import { api } from "./api.js";

/**
 * Servicio para interactuar con la API REST de Categorías (/api/categories)
 */
export const categoryService = {
  getAll: async () => {
    const res = await api.get("/api/categories");
    if (Array.isArray(res)) return res;
    return res.data || [];
  },

  getById: async (id) => {
    const res = await api.get(`/api/categories/${id}`);
    return res.data || res;
  },

  create: async (data) => {
    const res = await api.post("/api/categories", data);
    return res.data || res;
  },

  createBulk: async (categoriesArray) => {
    const res = await api.post("/api/categories/bulk", categoriesArray);
    return res;
  },

  update: async (id, data) => {
    const res = await api.put(`/api/categories/${id}`, data);
    return res.data || res;
  },

  delete: async (id) => {
    const res = await api.del(`/api/categories/${id}`);
    return res;
  },
};
