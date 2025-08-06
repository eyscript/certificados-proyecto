import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { createCertificate, fetchCertificates } from "../api/certificates";
import "../App.css";

export default function RequestCertificate() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [address, setAddress] = useState("");
  const [docType, setDocType] = useState("Nacimiento");
  const [file, setFile] = useState(null);

  // Control de flujo
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState(null);
  const [message, setMessage] = useState("");

  //  comprueba si ya hay solicitud
useEffect(() => {
  if (!user) return navigate("/login", { replace: true });

   fetchCertificates()
      .then(list => {
        console.log(" RequestCertificate lista ", list);
        if (list.length > 0) {
          setCertificate(list[0]);
        }
      })
    .catch(err => {
      console.error("Error comprobando solicitudes:", err);
    })
    .finally(() => setLoading(false));
}, [user, navigate]);

  // 2) Mientras carga…
 // if (loading) {
  //  return <p>Cargando datos…</p>;
  //}

  // Si ya hay solicitud sin formulario
   if (certificate) {
    return (
      <div className="form-card">
        <p>
          ✅ Ya realizaste tu solicitud de certificado.
          <br />
          <small>Estado: {certificate.status.name}</small>
        </p>
        {certificate.status.name === "emitido" && (
          <a
            href={`http://localhost:8000/certificates/${certificate.id}/download`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Descargar certificado
          </a>
        )}
      </div>
    );
  }

  //  Si no hay solicitud renderiza el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Selecciona un archivo.");
      return;
    }

    const formData = new FormData();
    formData.append("full_name", fullName);
    formData.append("birth_date", birthDate);
    formData.append("id_number", idNumber);
    formData.append("address", address);
    formData.append("document_type", docType);
    formData.append("file", file);

    try {
      const cert = await createCertificate(formData);
      setCertificate(cert);
      //navigate("/certificates", { replace: true });
    } catch (err) {
      console.error(err.response?.data || err);
      setMessage("Error al enviar la solicitud.");
    }
  };

  return (
    <div className="form-card">
      <h1>Solicitar Certificado</h1>
      {message && <div className="form-message">{message}</div>}
      <form onSubmit={handleSubmit}>
        <label>Nombre completo:</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <label>Fecha de nacimiento:</label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
        />

        <label>Número de documento:</label>
        <input
          type="text"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          required
        />

        <label>Dirección:</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        <label>Tipo de certificado:</label>
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
        >
          <option value="Nacimiento">Nacimiento</option>
          <option value="Estudios">Estudios</option>
        </select>

        <label>Adjuntar archivo (PDF/JPG):</label>
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />

        <button type="submit" style={{ marginTop: "1rem" }}>
          Enviar Solicitud
        </button>
      </form>
    </div>
  );
}
