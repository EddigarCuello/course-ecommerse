import { create } from "zustand";
import { categoryService } from "../services/category.service.js";

export const useCategoryStore = create((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const data = await categoryService.getAll();
      set({ categories: Array.isArray(data) ? data : [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addCategory: async (cat) => {
    try {
      const created = await categoryService.create(cat);
      set((s) => ({ categories: [...s.categories, created] }));
      return created;
    } catch (err) {
      console.error("Error al crear categoría:", err);
      throw err;
    }
  },

  updateCategory: async (id, data) => {
    try {
      const updated = await categoryService.update(id, data);
      set((s) => ({
        categories: s.categories.map((c) => (c._id === id ? updated : c)),
      }));
      return updated;
    } catch (err) {
      console.error("Error al actualizar categoría:", err);
      throw err;
    }
  },

  removeCategory: async (id) => {
    try {
      await categoryService.delete(id);
      set((s) => ({ categories: s.categories.filter((c) => c._id !== id) }));
    } catch (err) {
      console.error("Error al eliminar categoría:", err);
      throw err;
    }
  },

  getById: (id) => get().categories.find((c) => c._id === id),
}));
