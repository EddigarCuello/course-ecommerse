import { api } from "./api.js";

/**
 * Servicio para interactuar con la API REST de Profesores/Instructores (/api/teachers)
 */
export const teacherService = {
  getAll: async () => {
    const res = await api.get("/api/teachers");
    if (Array.isArray(res)) return res;
    return res.data || res.profesores || [];
  },

  getById: async (id) => {
    const res = await api.get(`/api/teachers/${id}`);
    return res.data || res;
  },

  create: async (data) => {
    const res = await api.post("/api/teachers", data);
    return res.data || res;
  },

  createBulk: async (teachersArray) => {
    const res = await api.post("/api/teachers/bulk", teachersArray);
    return res;
  },

  update: async (id, data) => {
    const res = await api.put(`/api/teachers/${id}`, data);
    return res.data || res;
  },

  delete: async (id) => {
    const res = await api.delete(`/api/teachers/${id}`);
    return res;
  },
};
