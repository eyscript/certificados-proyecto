import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import axios from "axios";
import "../App.css";                   
import illustration from "../assets/undraw_secure_login.svg"; 

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === "ADMIN") {
        navigate("/admin/certificates", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Intentando iniciar sesión...");
    try {
      const res = await axios.post("http://127.0.0.1:8000/auth/login", {
        email,
        password,
      });
      login(res.data.access_token);
   
    } catch {
      alert("Credenciales inválidas");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Iniciar Sesión</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Entrar</button>
        </form>
        <div className="auth-links">
          <a href="/register">¿No tienes cuenta? Regístrate</a>
        </div>
      </div>
      <div
        className="login-illustration"
        style={{ backgroundImage: `url(${illustration})` }}
      />
    </div>
    
  );
}
