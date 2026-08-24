import { create } from "zustand";

/**
 * Colección de profesores en RAM — sin backend
 * Para probar POST /api/courses sin depender de GET /api/users
 * IDs son ObjectId válidos (24 hex) para que CourseModel instructor los acepte
 */
function oid() {
  return [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
}

const mockProfessors = [
  { _id: oid(), nombre: "Ana Torres", email: "ana.torres@prime.test", especializacion: "Frontend", avatarUrl: null, activo: true },
  { _id: oid(), nombre: "Carlos Méndez", email: "carlos@prime.test", especializacion: "UX/UI", avatarUrl: null, activo: true },
  { _id: oid(), nombre: "Lucía Fernández", email: "lucia@prime.test", especializacion: "Backend", avatarUrl: null, activo: true },
  { _id: oid(), nombre: "Jorge Ruiz", email: "jorge@prime.test", especializacion: "Data", avatarUrl: null, activo: false },
];

export const useProfessorStore = create((set, get) => ({
  professors: mockProfessors,

  // Solo RAM — no llama a backend
  getActive: () => get().professors.filter((p) => p.activo),

  addProfessor: (prof) =>
    set((s) => ({
      professors: [...s.professors, { _id: oid(), activo: true, ...prof }],
    })),

  updateProfessor: (id, data) =>
    set((s) => ({
      professors: s.professors.map((p) => (p._id === id ? { ...p, ...data } : p)),
    })),

  removeProfessor: (id) =>
    set((s) => ({
      professors: s.professors.filter((p) => p._id !== id),
    })),

  reset: () => set({ professors: mockProfessors }),
}));
