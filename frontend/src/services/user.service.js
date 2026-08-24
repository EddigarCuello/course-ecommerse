import { api } from "./api.js";

/**
 * Usa backend Prime: GET /api/users
 * Controller user.controller.js:5 -> find({eliminado:false}).select(-passwordHash)
 * No hay filtro ?rol en back, filtrado en front.
 * Retorna { ok, data: User[] } con User: { _id, nombre, email, rol, activo, eliminado, ... }
 */
export const userService = {
  getAll: async () => {
    const res = await api.get("/api/users");
    if (Array.isArray(res)) return res;
    return res.data || res.users || [];
  },
  getById: async (id) => {
    const res = await api.get(`/api/users/${id}`);
    return res.data || res;
  },
};
