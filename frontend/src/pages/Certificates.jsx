import { useEffect, useState, useContext } from "react";
import axios from "axios";  // <<<<< IMPORTAR axios
import { AuthContext } from "../auth/AuthContext";
import { downloadCertificate } from "../api/certificates";

export default function Certificates() {
  const { token } = useContext(AuthContext);
  const [cert, setCert] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/certificates/mine", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCert(res.data))
      .catch(() => setError("No tienes ninguna solicitud."));

    axios
      .get("http://127.0.0.1:8000/certificates/statuses", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStatuses(res.data))
      .catch(() => {});
  }, [token]);

  const handleDownload = async (id) => {
    try {
      const blob = await downloadCertificate(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificado_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Error al descargar.");
    }
  };

  if (error) return <p>{error}</p>;
  if (!cert || statuses.length === 0) return <p>Cargando…</p>;

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Mi Solicitud</h2>
      <p>
        <strong>ID:</strong> {cert.id}
      </p>
      <p>
        <strong>Tipo:</strong> {cert.document_type}
      </p>

      <h3>Progreso</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {statuses.map((s) => (
          <li
            key={s.id}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              marginBottom: "0.5rem",
              backgroundColor: s.id === cert.status_id ? "#4caf50" : "#e0e0e0",
              color: s.id === cert.status_id ? "white" : "black",
            }}
          >
            {s.name}
          </li>
        ))}
      </ul>

      {cert.status.name === "Emitido" && (
        <button
          onClick={() => handleDownload(cert.id)}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            background: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Descargar mi certificado
        </button>
      )}
    </div>
  );
}
