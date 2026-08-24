import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, Users, BookOpen, BarChart3, Award, Download, Sparkles, LayoutDashboard, Loader2 } from "lucide-react";
import { courseService } from "../../services/course.service.js";
import { userService } from "../../services/user.service.js";

/**
 * Admin Dashboard — ahora conectado a backend Prime sin crear nada nuevo
 * Usa: GET /api/courses y GET /api/users (filtrado cliente para rol instructor/admin)
 * Enrollments/revenue quedan mock porque /api/enrollments no existe en backend/src
 */
const StatCard = ({ label, value, sub, icon: Icon, color }) => (
  <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6 shadow-sm">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} mb-4`}>
      <Icon size={22} className="text-white" />
    </div>
    <p className="text-3xl font-bold text-white mb-1 truncate">{value}</p>
    <p className="text-slate-400 text-sm font-medium">{label}</p>
    {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
  </div>
);

export default function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [cs, us] = await Promise.all([courseService.getAll().catch(() => []), userService.getAll().catch(() => [])]);
        if (!cancelled) {
          setCourses(Array.isArray(cs) ? cs : []);
          setUsers(Array.isArray(us) ? us : []);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const totalCourses = courses.length;
  const publishedCourses = courses.filter((c) => c.publicado === true || c.estado === "published").length;
  const totalCap = courses.reduce((s, c) => s + (c.capacidad || 0), 0);
  const totalInsc = courses.reduce((s, c) => s + (c.inscritos || 0), 0);
  const occupancyPercent = totalCap ? Math.round((totalInsc / totalCap) * 100) : 0;
  const topCourse = [...courses].sort((a, b) => (b.inscritos || 0) - (a.inscritos || 0))[0];
  const totalInstructors = users.filter((u) => u.rol === "instructor").length;
  // Sin /api/enrollments: revenue y enrollments no calculables
  const totalRevenue = null;
  const totalEnrollments = null;

  const fmt = (n) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 text-slate-400 mb-8"><Loader2 className="animate-spin" size={20} /> Cargando métricas desde /api/courses y /api/users…</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6 h-36 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#16a34a] flex items-center justify-center shrink-0 shadow-lg shadow-green-900/30">
            <LayoutDashboard size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Dashboard de Administración</h1>
            <p className="text-slate-400 text-sm">
              {error ? <span className="text-amber-400">Sin conexión a API — mostrando 0s. {error}</span> : "Datos en vivo desde /api/courses y /api/users (enrollments mock)"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button disabled className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-bold opacity-60 cursor-not-allowed" title="Pendiente IA">
            <Sparkles size={16} /> Insights IA
          </button>
          <div className="w-[1px] h-6 bg-slate-700 hidden sm:block" />
          <select disabled className="bg-[#1e293b] border border-slate-700 text-slate-300 text-sm rounded-xl px-3 py-2 opacity-60">
            <option>Formato CSV</option>
          </select>
          <button disabled className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium opacity-60 cursor-not-allowed">
            <Download size={15} /> Exportar Reporte
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        <StatCard
          label="Ingresos Totales"
          value={totalRevenue !== null ? fmt(totalRevenue) : "—"}
          sub={totalRevenue === null ? "Requiere GET /api/enrollments" : undefined}
          icon={DollarSign}
          color="bg-green-600"
        />
        <StatCard
          label="Total de Inscripciones"
          value={totalEnrollments !== null ? String(totalEnrollments) : "—"}
          sub={totalEnrollments === null ? "Sin /api/enrollments" : undefined}
          icon={Users}
          color="bg-green-600"
        />
        <StatCard label="Ocupación Total" value={`${occupancyPercent}%`} sub={`${totalInsc}/${totalCap} cupos`} icon={BarChart3} color="bg-purple-600" />
        <StatCard label="Total de Cursos" value={String(totalCourses)} sub={`${publishedCourses} publicados · ${totalInstructors} instructores`} icon={BookOpen} color="bg-orange-600" />
        <StatCard
          label="Curso Más Popular"
          value={topCourse?.titulo || topCourse?.title || "—"}
          sub={topCourse ? `${topCourse.inscritos || 0} inscritos` : "Sin cursos"}
          icon={Award}
          color="bg-yellow-600"
        />
        <StatCard label="Tendencia" value="↑ Activo" sub={error ? "API no disponible" : "Conectado a Prime"} icon={TrendingUp} color="bg-green-600" />
      </div>

      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-5 text-sm text-slate-400">
        <span className="text-slate-300 font-semibold">Nota:</span> Conectado a <code className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">GET /api/courses</code> y <code className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">GET /api/users</code> (filtro <code className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">rol=instructor</code> en front). Métricas de <code className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">ingresos/inscripciones</code> siguen mock porque <code className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">/api/enrollments</code> no existe en <code className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">backend/src</code>.
      </div>
    </div>
  );
}
