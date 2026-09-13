import { GraduationCap, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function MyCourses() {
  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto w-full animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0f172a]">Mis Cursos</h1>
            <p className="text-[#64748b] text-sm">Hola, gestiona tus inscripciones</p>
          </div>
        </div>
        <Link
          to="/catalog"
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors inline-flex items-center justify-center whitespace-nowrap"
        >
          Explorar más cursos
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white py-8 px-6 rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:border-emerald-100">
          <span className="text-4xl font-bold text-emerald-500 mb-2">0</span>
          <span className="text-[#64748b] text-sm font-medium">Cursos Inscritos</span>
        </div>
        <div className="bg-white py-8 px-6 rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:border-emerald-100">
          <span className="text-4xl font-bold text-emerald-500 mb-2">0</span>
          <span className="text-[#64748b] text-sm font-medium">Pagos confirmados</span>
        </div>
        <div className="bg-white py-8 px-6 rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:border-slate-200">
          <span className="text-4xl font-bold text-[#0f172a] mb-2">US$ 0.00</span>
          <span className="text-[#64748b] text-sm font-medium">Inversión total</span>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-[#94a3b8] mb-6">
          <BookOpen size={32} strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold text-[#0f172a] mb-2">
          Aún no tienes inscripciones
        </h2>
        <p className="text-[#64748b] mb-8 max-w-md">
          Explora el catálogo y encuentra el curso perfecto para ti
        </p>
        <Link
          to="/catalog"
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 group"
        >
          Explorar cursos
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
