import { api } from "./api.js";

/**
 * Servicio de autenticación - consume endpoints reales del backend Prime.
 * Backend: backend/src/routes/auth.routes.js
 *  - POST /api/auth/register
 *  - POST /api/auth/login
 *
 * NOTA: El backend no retorna JWT aún, retorna { ok, message, data: user }.
 * Cuando se implemente JWT, este servicio ya está preparado para extraer token.
 */

export const authService = {
  /**
   * @param {{ nombre: string, email: string, password: string, rol?: string, telefono?: string, pais?: string, ciudad?: string }} payload
   */
  register: async ({ nombre, email, password, rol, telefono, pais, ciudad }) => {
    const payload = {
      nombre: nombre?.trim(),
      email: email?.trim().toLowerCase(),
      password,
      ...(rol && { rol }),
      ...(telefono && { telefono }),
      ...(pais && { pais }),
      ...(ciudad && { ciudad }),
    };

    const res = await api.post("/api/auth/register", payload);
    // res = { ok: true, message, data: user }
    return res;
  },

  /**
   * @param {{ email: string, password: string }} credentials
   */
  login: async ({ email, password }) => {
    const payload = {
      email: email?.trim().toLowerCase(),
      password,
    };

    const res = await api.post("/api/auth/login", payload);
    // res = { ok: true, message, data: user }
    return res;
  },

  // Helper para persistencia local (sin Supabase)
  persistSession: (user, token = null) => {
    localStorage.setItem("prime_user", JSON.stringify(user));
    if (token) {
      localStorage.setItem("prime_token", token);
    }
  },

  clearSession: () => {
    localStorage.removeItem("prime_user");
    localStorage.removeItem("prime_token");
  },

  getStoredUser: () => {
    try {
      const raw = localStorage.getItem("prime_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
};
