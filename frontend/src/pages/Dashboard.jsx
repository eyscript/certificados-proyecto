import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { fetchCertificates } from "../api/certificates";
import "../App.css";

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const flash = location.state?.flash;

  const [loading, setLoading] = useState(true);
  const [hasRequest, setHasRequest] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchCertificates()
      .then(list => setHasRequest(Array.isArray(list) && list.length > 0))
      .catch(err => {
        if (err.response?.status !== 404) console.error(err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <p>Cargando Dashboard…</p>;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      {flash && (
        <div className="dashboard__flash">
          {flash}
        </div>
      )}
      <p>Estás autenticado ✅</p>

      {hasRequest ? (
        <p>Ya realizaste tu solicitud de certificado.</p>
      ) : (
        <Link to="/request">📝 Solicitar Certificado</Link>
      )}
      <br />
      <Link to="/certificates">📂 Mis Certificados</Link>
    </div>
  );
}
