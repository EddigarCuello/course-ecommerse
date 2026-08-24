import { Search, Sun, Sunset, Moon, Calendar, Clock, Users, ChevronRight } from "lucide-react";

/**
 * Vista Catálogo — solo UI estática, sin consultas al backend
 * Réplica visual de VACACIONALPAG Catalog.jsx: header, filters-bar, course-grid, course-card, badge
 * Datos mock para no hacer fetch
 */
const mockCourses = [
  {
    id: 1,
    title: "React Avanzado: Patrones y Performance",
    description: "Domina hooks avanzados, render props y optimización con React 19.",
    professor: "Ana Torres",
    days: "Lunes a Viernes",
    time: "09:00 - 11:00",
    enrolled: 18,
    capacity: 25,
    price: 49.99,
    schedule: "Mañana",
  },
  {
    id: 2,
    title: "Diseño UX/UI con Figma",
    description: "De wireframes a prototipos interactivos con auto-layout.",
    professor: "Carlos Méndez",
    days: "Lunes y Miércoles",
    time: "15:00 - 17:00",
    enrolled: 25,
    capacity: 25,
    price: 39.99,
    schedule: "Tarde",
  },
  {
    id: 3,
    title: "Node.js & Express — API REST",
    description: "Construye backends escalables con MongoDB y JWT.",
    professor: "Lucía Fernández",
    days: "Martes y Jueves",
    time: "19:00 - 21:00",
    enrolled: 12,
    capacity: 20,
    price: 59.99,
    schedule: "Noche",
  },
  {
    id: 4,
    title: "Python para Data Science",
    description: "Pandas, NumPy y visualización con Matplotlib.",
    professor: "Jorge Ruiz",
    days: "Sábados",
    time: "09:00 - 13:00",
    enrolled: 8,
    capacity: 30,
    price: 45.0,
    schedule: "Mañana",
  },
  {
    id: 5,
    title: "Marketing Digital Intensivo",
    description: "SEO, Ads y funnels que convierten en vacaciones.",
    professor: "Valentina Soto",
    days: "Lunes a Viernes",
    time: "16:00 - 18:00",
    enrolled: 19,
    capacity: 20,
    price: 29.99,
    schedule: "Tarde",
  },
  {
    id: 6,
    title: "Ciberseguridad Práctica",
    description: "OWASP, pentesting básico y hardening.",
    professor: "Miguel Prado",
    days: "Miércoles y Viernes",
    time: "20:00 - 22:00",
    enrolled: 6,
    capacity: 15,
    price: 69.99,
    schedule: "Noche",
  },
];

function Badge({ available }) {
  if (available === 0)
    return <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fee2e2] text-[#dc2626] w-fit mb-4">Lleno</span>;
  if (available > 5)
    return <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-[#dcfce7] text-[#22c55e] w-fit mb-4">{available} cupos</span>;
  return <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fef08a] text-[#ca8a04] w-fit mb-4">{available} cupos</span>;
}

export default function Catalog() {
  return (
    <div className="p-6 md:p-8 pb-[80px] md:pb-6 max-w-[1200px] w-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[2rem] font-semibold text-[#0f172a] mb-2">Catálogo de Cursos</h1>
          <p className="text-[#64748b] text-[0.95rem]">Elige tu curso, inscríbete y empieza tu vacación productiva</p>
        </div>
        <div className="hidden sm:flex bg-[#0f172a] text-white px-4 py-2 rounded-lg text-sm font-medium items-center gap-2">
          <span className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse" /> {mockCourses.length} cursos disponibles
        </div>
      </div>

      {/* Filters Bar — solo visual, sin lógica */}
      <div className="flex flex-wrap gap-4 justify-between items-center bg-white p-3 rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] mb-8">
        <div className="flex items-center gap-2 text-[#64748b] flex-1 min-w-[220px] max-w-[320px] bg-[#f8fafc] px-4 py-2 rounded-lg">
          <Search size={18} className="shrink-0" />
          <input
            type="text"
            placeholder="Buscar curso o instructor..."
            className="border-0 bg-transparent outline-none w-full text-sm text-[#1e293b] placeholder:text-[#94a3b8]"
            disabled
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button className="px-3.5 py-1.5 rounded-full text-sm font-medium bg-[#16a34a] text-white flex items-center gap-1.5">Todos</button>
          <button className="px-3.5 py-1.5 rounded-full text-sm font-medium bg-[#f8fafc] text-[#64748b] flex items-center gap-1.5">
            <Sun size={14} /> Mañana
          </button>
          <button className="px-3.5 py-1.5 rounded-full text-sm font-medium bg-[#f8fafc] text-[#64748b] flex items-center gap-1.5">
            <Sunset size={14} /> Tarde
          </button>
          <button className="px-3.5 py-1.5 rounded-full text-sm font-medium bg-[#f8fafc] text-[#64748b] flex items-center gap-1.5">
            <Moon size={14} /> Noche
          </button>
          <div className="w-[1px] h-6 bg-[#e2e8f0] mx-2 hidden sm:block" />
          <label className="flex items-center gap-2 text-sm text-[#64748b] cursor-pointer select-none">
            <input type="checkbox" className="accent-[#16a34a]" disabled /> Solo con cupos
          </label>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockCourses.map((course) => {
          const available = course.capacity - course.enrolled;
          const initial = course.professor.charAt(0).toUpperCase();
          return (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] p-6 relative border-t-4 border-[#16a34a] flex flex-col cursor-pointer hover:-translate-y-1 hover:shadow-[0_15px_25px_-5px_rgba(0,0,0,0.1)] transition-all duration-200"
            >
              <Badge available={available} />
              <h3 className="text-[1.15rem] font-semibold leading-snug mb-3 text-[#0f172a] line-clamp-2">{course.title}</h3>

              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-full bg-[#e0e7ff] text-[#16a34a] flex items-center justify-center text-xs font-bold">
                  {initial}
                </div>
                <span className="text-sm text-[#64748b] font-medium">{course.professor}</span>
              </div>

              <p className="text-sm text-[#64748b] leading-relaxed mb-6 line-clamp-2">{course.description}</p>

              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-2 text-xs text-[#64748b]">
                  <Calendar size={14} className="text-[#94a3b8]" /> {course.days}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#64748b]">
                  <Clock size={14} className="text-[#94a3b8]" /> {course.time}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#64748b]">
                  <Users size={14} className="text-[#94a3b8]" /> {course.enrolled}/{course.capacity} inscritos
                </div>
              </div>

              <div className="mt-auto flex justify-between items-center pt-4 border-t border-[#f1f5f9]">
                <span className="text-[1.1rem] font-bold text-[#16a34a]">$ US$ {course.price.toFixed(2)}</span>
                <span className="text-[#16a34a] font-semibold text-sm flex items-center gap-1">
                  Ver detalle <ChevronRight size={14} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-[#94a3b8] mt-10">
        Vista estática — sin consultas al backend. Próximo paso: conectar a <code className="bg-white px-1.5 py-0.5 rounded border border-[#e2e8f0]">GET /api/courses</code>
      </p>
    </div>
  );
}
