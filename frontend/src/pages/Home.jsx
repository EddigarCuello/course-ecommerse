import { Link } from "react-router-dom";
import { BookOpen, GraduationCap, Clock, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { useAuthStore } from "../hooks/useAuthStore.js";

/**
 * Vista Inicio — estática, sin consultas
 * Hero + stats + CTA a Catálogo. Usa misma paleta del catálogo.
 */
export default function Home() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <div className="p-6 md:p-8 pb-[90px] md:pb-6 max-w-[1200px] w-full">
      {/* Header bienvenida */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-[2rem] font-bold text-[#0f172a] leading-tight">
            Hola{isAuthenticated && user?.nombre ? `, ${user.nombre}` : ""} <span className="inline-block animate-pulse">👋</span>
          </h1>
          <p className="text-[#64748b] mt-1.5">Bienvenido a Prime — tu vacación productiva empieza aquí</p>
        </div>
        {!isAuthenticated && (
          <Link to="/auth" className="inline-flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors">
            Ingresar <ArrowRight size={16} />
          </Link>
        )}
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] rounded-2xl p-8 md:p-10 text-white relative overflow-hidden mb-8 shadow-[0_10px_30px_rgba(15,23,42,0.25)]">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#16a34a]/20 rounded-full blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-56 h-56 bg-[#22c55e]/10 rounded-full blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs font-medium mb-4">
            <Sparkles size={14} className="text-[#22c55e]" /> Nuevo periodo vacacional abierto
          </span>
          <h2 className="text-[1.8rem] md:text-[2.2rem] font-bold leading-tight max-w-[24ch]">
            Aprende algo nuevo <span className="text-[#22c55e]">estas vacaciones</span>
          </h2>
          <p className="text-slate-300 mt-3 max-w-[50ch] text-sm leading-relaxed">
            Catálogo curado, instructores verificados y cupos en tiempo real. Sin Supabase, 100% backend Prime.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link to="/catalog" className="inline-flex items-center gap-2 bg-[#16a34a] hover:bg-[#22c55e] text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors">
              <BookOpen size={16} /> Explorar catálogo <ArrowRight size={16} />
            </Link>
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white font-medium px-5 py-3 rounded-full text-sm border border-white/10">
              <Clock size={16} /> Clases 9:00 — 21:00
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Cursos activos", value: "24", icon: BookOpen, color: "text-[#16a34a] bg-[#dcfce7]" },
          { label: "Estudiantes", value: "1.200+", icon: GraduationCap, color: "text-[#0ea5e9] bg-[#e0f2fe]" },
          { label: "Instructores", value: "18", icon: ShieldCheck, color: "text-[#8b5cf6] bg-[#ede9fe]" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl p-5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-[#f1f5f9] flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
                <Icon size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0f172a] leading-none">{s.value}</div>
                <div className="text-xs text-[#64748b] mt-1 font-medium">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pasos */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f5f9]">
        <h3 className="font-semibold text-[#0f172a]">¿Cómo funciona?</h3>
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {[
            { n: "01", t: "Explora", d: "Filtra por horario (mañana/tarde/noche) y cupos." },
            { n: "02", t: "Inscríbete", d: "Elige método de pago y confirma tu cupo." },
            { n: "03", t: "Aprende", d: "Accede a tus cursos en Mis Cursos." },
          ].map((p) => (
            <div key={p.n} className="flex gap-4">
              <span className="text-[#16a34a] font-bold text-sm mt-0.5">{p.n}</span>
              <div>
                <div className="font-semibold text-[#0f172a] text-sm">{p.t}</div>
                <div className="text-sm text-[#64748b] mt-1 leading-relaxed">{p.d}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <Link to="/catalog" className="text-sm font-semibold text-[#16a34a] inline-flex items-center gap-1 hover:gap-2 transition-all">
            Ir al catálogo <ArrowRight size={14} />
          </Link>
          <span className="text-[#e2e8f0]">|</span>
          <span className="text-xs text-[#94a3b8] self-center">Vista estática — pendiente conexión GET /api/courses</span>
        </div>
      </div>
    </div>
  );
}
