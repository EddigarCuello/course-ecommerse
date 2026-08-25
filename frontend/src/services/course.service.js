import { api } from "./api.js";

/**
 * Servicio para interactuar con la API REST de Cursos (/api/courses)
 */
export const courseService = {
  getAll: async () => {
    const res = await api.get("/api/courses");
    if (Array.isArray(res)) return res;
    return res.data || res.courses || [];
  },
  getById: async (id) => {
    const res = await api.get(`/api/courses/${id}`);
    return res.data || res;
  },
  create: async (payload) => {
    const res = await api.post("/api/courses", payload);
    return res.data || res;
  },
  createBulk: async (coursesArray) => {
    const res = await api.post("/api/courses/bulk", coursesArray);
    return res;
  },
  update: async (id, payload) => {
    const res = await api.put(`/api/courses/${id}`, payload);
    return res.data || res;
  },
  remove: async (id) => {
    const res = await api.del(`/api/courses/${id}`);
    return res;
  },
};
