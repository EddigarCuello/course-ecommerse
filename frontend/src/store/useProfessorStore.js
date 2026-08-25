import { create } from "zustand";
import { teacherService } from "../services/teacher.service.js";

const initialProfessors = [
  { nombre: "Ana Torres", email: "ana.torres@prime.test", telefono: "+51 987654321", detallesInstructor: { especializacion: "Frontend" }, activo: true },
  { nombre: "Carlos Méndez", email: "carlos@prime.test", telefono: "+51 987654322", detallesInstructor: { especializacion: "UX/UI" }, activo: true },
  { nombre: "Lucía Fernández", email: "lucia@prime.test", telefono: "+51 987654323", detallesInstructor: { especializacion: "Backend" }, activo: true },
  { nombre: "Jorge Ruiz", email: "jorge@prime.test", telefono: "+51 987654324", detallesInstructor: { especializacion: "Data" }, activo: false },
];

export const useProfessorStore = create((set, get) => ({
  professors: [],
  loading: false,
  error: null,

  fetchProfessors: async () => {
    set({ loading: true, error: null });
    try {
      let data = await teacherService.getAll();
      if (!Array.isArray(data) || data.length === 0) {
        // Autoseed de profesores por defecto si la base de datos está vacía
        for (const prof of initialProfessors) {
          await teacherService.create(prof).catch(() => {});
        }
        data = await teacherService.getAll();
      }
      set({ professors: Array.isArray(data) ? data : [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  getActive: () => get().professors.filter((p) => p.activo !== false),

  addProfessor: async (prof) => {
    try {
      const created = await teacherService.create(prof);
      set((s) => ({ professors: [...s.professors, created] }));
      return created;
    } catch (err) {
      console.error("Error al crear profesor:", err);
      throw err;
    }
  },

  updateProfessor: async (id, data) => {
    try {
      const updated = await teacherService.update(id, data);
      set((s) => ({
        professors: s.professors.map((p) => (p._id === id ? updated : p)),
      }));
      return updated;
    } catch (err) {
      console.error("Error al actualizar profesor:", err);
      throw err;
    }
  },

  removeProfessor: async (id) => {
    try {
      await teacherService.delete(id);
      set((s) => ({
        professors: s.professors.filter((p) => p._id !== id),
      }));
    } catch (err) {
      console.error("Error al eliminar profesor:", err);
      throw err;
    }
  },
}));
