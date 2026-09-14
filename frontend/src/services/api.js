/**
 * Cliente HTTP centralizado para consumir el backend Prime.
 * Usa VITE_API_URL o proxy de Vite (/api -> localhost:3000)
 */

const rawBaseUrl = import.meta.env.VITE_API_URL || "";
// Si VITE_API_URL es "/api" y las rutas ya inician con "/api", evitamos duplicar a "/api/api"
const API_URL = rawBaseUrl.replace(/\/api\/?$/, "");

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const url = `${API_URL}${path}`;

  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  // Adjuntar token si existe (preparado para cuando el backend implemente JWT)
  const token = localStorage.getItem("prime_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (body) {
    if (body instanceof FormData) {
      config.body = body;
      // Fetch setea el boundary solo si NO existe el header Content-Type
      delete config.headers["Content-Type"];
    } else {
      config.body = JSON.stringify(body);
    }
  }

  const res = await fetch(url, config);

  // Respuesta vacía (204)
  if (res.status === 204) {
    return { ok: true };
  }

  let data;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    data = text ? { message: text } : {};
  }

  if (!res.ok) {
    // Backend errorHandler responde con { error: message }
    const message = data?.error || data?.message || data?.msg || `Error ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  del: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};

export default api;
