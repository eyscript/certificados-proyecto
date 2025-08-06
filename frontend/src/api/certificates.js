import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/certificates",
  // para cookies de sesión en el futuro:
  // withCredentials: true,
});

// --- INTERCEPTOR: inyecta el token en todas las peticiones ---
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Crea una nueva solicitud de certificado.
 * POST /certificates/upload
 */
export const createCertificate = async (formData) => {
  const res = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

/**
 * Recupera la(s) solicitud(es) existente(s) para el usuario.
 * GET /certificates/mine
 */
// src/api/certificates.js

export async function fetchCertificates() {
  const res = await api.get("/");    // ojo: "/" en vez de "/mine"
  return Array.isArray(res.data) ? res.data : [];
}

/**
 * Recupera todos los estados disponibles.
 * GET /certificates/statuses
 */
export const fetchStatuses = async () => {
  const res = await api.get("/statuses");
  return res.data;
};

/**
 * Descarga el PDF de un certificado ya emitido.
 * GET /certificates/{id}/download
 */
export const downloadCertificate = async (id) => {
  const res = await api.get(`/${id}/download`, {
    responseType: "blob",
  });
  return res.data;  // un Blob de tipo application/pdf
};
