import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";
import noDataImage from "../assets/no-data.svg";

export default function AdminDashboard() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [certs, setCerts] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [error, setError] = useState(null);

  // traer solicitudes
  const fetchAll = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/certificates/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCerts(res.data);
    } catch {
      setError("Error cargando solicitudes.");
    }
  };

  // traer estados
  const fetchStatuses = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/certificates/statuses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatuses(res.data);
    } catch {
      console.error("No pude cargar estados");
    }
  };

  useEffect(() => {
    if (user?.role !== "ADMIN") return navigate("/login", { replace: true });
    fetchAll();
    fetchStatuses();
  }, [user, token, navigate]);

  // logout
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  //  cambiar estado
  const changeStatus = async (id, newStatusId) => {
    try {
      const res = await axios.patch(
        `http://127.0.0.1:8000/certificates/${id}`,
        { status_id: newStatusId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCerts((prev) => prev.map((c) => (c.id === id ? res.data : c)));
    } catch {
      alert("No se pudo actualizar el estado.");
    }
  };

  if (user?.role !== "ADMIN") return <p>No autorizado</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Panel Admin — Solicitudes</h2>
        <button onClick={handleLogout} style={{ padding: "0.5rem 1rem" }}>
          Cerrar sesión
        </button>
      </header>

      {certs.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            marginTop: "4rem",
            color: "#555",
          }}
        >
          <img
            src={noDataImage}
            alt="Sin solicitudes"
            style={{ width: 180, opacity: 0.6 }}
          />
          <h3 style={{ marginTop: "1rem" }}>¡Aún no hay solicitudes!</h3>
          <p>
            Aquí verás todas las solicitudes de los usuarios en cuanto empiecen
            a llegar. Por ahora, relájate y vuelve pronto.
          </p>
        </div>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem",
          }}
        >
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Usuario</th>
              <th style={th}>Tipo</th>
              <th style={th}>Estado</th>
              <th style={th}>Documento</th>
              <th style={th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {certs.map((c) => (
              <tr key={c.id}>
                <td style={td}>{c.id}</td>
                <td style={td}>{c.user.email}</td>
                <td style={td}>{c.document_type}</td>
                <td style={td}>{c.status.name}</td>
                <td style={td}>
                  {c.filename ? (
                    <a
                      href={`http://127.0.0.1:8000/uploads/${c.filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td style={td}>
                  <select
                    value={c.status_id}
                    onChange={(e) =>
                      changeStatus(c.id, Number(e.target.value))
                    }
                  >
                    {statuses.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Estilos para tabla
const th = {
  border: "1px solid #ccc",
  padding: "0.5rem",
  background: "#f0f0f0",
  textAlign: "left",
};
const td = { border: "1px solid #ccc", padding: "0.5rem" };
