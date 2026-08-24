import { create } from "zustand";

/**
 * Colección de categorías en RAM — sin backend
 * Backend Prime tiene category.schema.js (nombre, descripcion, icono, color) pero no expone /api/categories
 * Se usa para probar POST /api/courses que requiere categoria ObjectId
 */
function oid() {
  return [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
}

const mockCategories = [
  { _id: oid(), nombre: "Programación", descripcion: "Desarrollo web y backend", icono: "Code", color: "#3b82f6" },
  { _id: oid(), nombre: "Diseño", descripcion: "UX/UI y Figma", icono: "Palette", color: "#a855f7" },
  { _id: oid(), nombre: "Marketing", descripcion: "Digital y ventas", icono: "TrendingUp", color: "#ec4899" },
  { _id: oid(), nombre: "Data Science", descripcion: "Python, ML y análisis", icono: "BarChart3", color: "#10b981" },
  { _id: oid(), nombre: "Negocios", descripcion: "Emprendimiento", icono: "Briefcase", color: "#f59e0b" },
];

export const useCategoryStore = create((set, get) => ({
  categories: mockCategories,

  addCategory: (cat) =>
    set((s) => ({
      categories: [...s.categories, { _id: oid(), ...cat }],
    })),

  removeCategory: (id) =>
    set((s) => ({
      categories: s.categories.filter((c) => c._id !== id),
    })),

  getById: (id) => get().categories.find((c) => c._id === id),
}));
