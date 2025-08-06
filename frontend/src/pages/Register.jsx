import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";
import "../App.css";                         
import illustration from "../assets/undraw_sign_up.svg";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
 
  const { user } = useAuth();
  const navigate = useNavigate();

  // Si ya hay user, redirige
  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/auth/register", {
        email,
        password,
 
      });
      alert("Registro exitoso. Por favor inicia sesión.");
      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);
      alert("Error al registrar. Revisa la consola.");
    }
  };

  return (
    <div className="auth-page">
      {/* Ilustracion */}
      <div
        className="login-illustration"
        style={{ backgroundImage: `url(${illustration})` }}
      />

      {/* Formulario */}
      <div className="auth-card">
        <h1>Registro</h1>
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
      
          <button type="submit">Registrarme</button>
        </form>
        <div className="auth-links">
          <a href="/login">¿Ya tienes cuenta? Inicia sesión</a>
        </div>
      </div>
    </div>
  );
}
