import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import axios from "axios";

export default function CertificateReview() {
  const { id } = useParams();
  const { token } = useAuth();
  const [cert, setCert] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    
    axios
      .get(`http://localhost:8000/certificates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setCert(res.data))
      .catch(() => setError("No encontrado"));

    // traer estados para botones
    axios
      .get("http://localhost:8000/certificates/statuses", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setStatuses(res.data))
      .catch(() => {});
  }, [id, token]);

  const changeStatus = (newId) => {
    axios
      .patch(`http://localhost:8000/certificates/${id}`, { status_id: newId }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        setCert(res.data);
        alert("Estado actualizado");
      })
      .catch(() => alert("Error al actualizar"));
  };

  if (error) return <p>{error}</p>;
  if (!cert || statuses.length === 0) return <p>Cargando…</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Revisión Solicitud #{cert.id}</h1>
      <p><strong>Nombre:</strong> {cert.full_name}</p>
      <p><strong>Tipo:</strong> {cert.document_type}</p>
      <p>
        <strong>Documento:</strong>{" "}
        <a href={`http://localhost:8000/uploads/${cert.filename}`} target="_blank">
          Ver original
        </a>
      </p>
      <p><strong>Estado actual:</strong> {cert.status.name}</p>

      <h3>Acciones</h3>
      {statuses.map(s => (
        <button
          key={s.id}
          onClick={() => changeStatus(s.id)}
          style={{ 
            margin: "0.5rem", 
            backgroundColor: s.id === cert.status_id ? "gray" : "initial" 
          }}
        >
          {s.name}
        </button>
      ))}

      <div style={{ marginTop: "1rem" }}>
        <button onClick={() => navigate("/admin/certificates")}>
          Volver al panel
        </button>
      </div>
    </div>
  );
}
