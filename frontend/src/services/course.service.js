import { api } from "./api.js";

/**
 * Usa backend Prime existente: GET /api/courses
 * Controller: course.controller.js:5 -> populate categoria,instructor, filtra eliminado:false
 * Retorna { ok, total, data: Course[] } con Course: { _id, titulo, precio, capacidad, inscritos, estado, publicado, diasSemana, instructor:{nombre}, categoria:{nombre} }
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
  update: async (id, payload) => {
    const res = await api.put(`/api/courses/${id}`, payload);
    return res.data || res;
  },
  remove: async (id) => {
    const res = await api.del(`/api/courses/${id}`);
    return res;
  },
};
