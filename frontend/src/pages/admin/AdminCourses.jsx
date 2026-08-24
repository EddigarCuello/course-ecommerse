import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, Users, DollarSign, Loader2, X, Calendar, Clock } from "lucide-react";
import { courseService } from "../../services/course.service.js";
import { useProfessorStore } from "../../store/useProfessorStore.js";
import { useCategoryStore } from "../../store/useCategoryStore.js";

const statusColors = {
  published: "bg-green-500/15 text-green-400",
  draft: "bg-yellow-500/15 text-yellow-400",
  archived: "bg-slate-500/15 text-slate-400",
  finished: "bg-slate-500/15 text-slate-400",
};
const statusLabels = { published: "Publicado", draft: "Borrador", archived: "Archivado", finished: "Finalizado" };
const diasOptions = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// Genera ObjectId dummy de 24 hex para categoria cuando no hay endpoint de categorías
function generateObjectId() {
  return [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
}

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const professors = useProfessorStore((s) => s.professors);
  const categories = useCategoryStore((s) => s.categories);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    categoria: "",
    instructor: "",
    precio: 0,
    capacidad: 20,
    fechaInicio: "",
    fechaFin: "",
    horaInicio: "09:00",
    horaFin: "11:00",
    diasSemana: [],
    estado: "draft",
    publicado: false,
  });

  const loadCourses = async () => {
    try {
      const data = await courseService.getAll();
      setCourses(Array.isArray(data) ? data : []);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function init() {
      setLoading(true);
      try {
        const cs = await courseService.getAll().catch(() => []);
        if (!cancelled) setCourses(Array.isArray(cs) ? cs : []);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const openCreate = () => {
    setFormError(null);
    setFormData({
      titulo: "",
      descripcion: "",
      categoria: categories[0]?._id || "",
      instructor: professors[0]?._id || "",
      precio: 0,
      capacidad: 20,
      fechaInicio: new Date().toISOString().slice(0, 10),
      fechaFin: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      horaInicio: "09:00",
      horaFin: "11:00",
      diasSemana: ["Lunes"],
      estado: "draft",
      publicado: false,
    });
    setIsModalOpen(true);
  };

  const toggleDia = (dia) => {
    setFormData((prev) => ({
      ...prev,
      diasSemana: prev.diasSemana.includes(dia) ? prev.diasSemana.filter((d) => d !== dia) : [...prev.diasSemana, dia],
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.titulo || !formData.categoria || !formData.instructor || !formData.fechaInicio || !formData.fechaFin || !formData.horaInicio || !formData.horaFin || formData.diasSemana.length === 0) {
      setFormError("Completa: título, categoría, instructor, fechas, horas y al menos un día.");
      return;
    }
    const categoriaId = formData.categoria;

    setIsSaving(true);
    try {
      const payload = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        categoria: categoriaId,
        instructor: formData.instructor,
        precio: Number(formData.precio),
        capacidad: Number(formData.capacidad),
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
        diasSemana: formData.diasSemana,
        estado: formData.estado,
        publicado: formData.publicado,
      };
      const created = await courseService.create(payload);
      // created puede ser el curso directo o {data: curso}
      const newCourse = created?._id ? created : created;
      // Refrescar lista para obtener populate
      await loadCourses();
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || "Error al crear curso");
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = courses.filter(
    (c) =>
      (c.titulo || c.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.instructor?.nombre || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Gestionar Cursos</h1>
          <p className="text-slate-400 text-sm">
            {loading ? "Cargando..." : `${filtered.length} cursos`} {error && <span className="text-amber-400">· {error}</span>} {!loading && !error && "· GET /api/courses en vivo"}
          </p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-green-900/20 transition-colors">
          <Plus size={16} /> Nuevo Curso
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          placeholder="Buscar por título o instructor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm pl-10 pr-4 py-2.5 bg-[#1e293b] border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-green-600"
        />
      </div>

      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-700 bg-[#1e293b]/50">
              {["Curso", "Instructor", "Cupos", "Precio", "Estado", "Acciones"].map((h) => (
                <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <Loader2 className="animate-spin mx-auto text-slate-500" size={24} />
                  <p className="text-slate-500 text-sm mt-2">Cargando desde GET /api/courses…</p>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                  {courses.length === 0 ? "No hay cursos. Crea el primero con Nuevo Curso." : "Sin resultados."}
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const titulo = c.titulo || c.title || "—";
                const instructor = c.instructor?.nombre || "Sin asignar";
                const dias = Array.isArray(c.diasSemana) ? c.diasSemana.join(", ") : c.diasSemana || "";
                const estado = c.estado || (c.publicado ? "published" : "draft");
                return (
                  <tr key={c._id} className="hover:bg-slate-700/20">
                    <td className="px-6 py-4">
                      <p className="text-white font-medium text-sm">{titulo}</p>
                      <p className="text-slate-500 text-xs flex items-center gap-1.5">
                        <Calendar size={12} /> {dias || "—"}
                        <span className="ml-2 flex items-center gap-1">
                          <Clock size={12} /> {c.horaInicio || ""} - {c.horaFin || ""}
                        </span>
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{instructor === "Sin asignar" ? <span className="italic text-slate-500">{instructor}</span> : instructor}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-sm text-slate-300">
                        <Users size={13} className="text-slate-500" />
                        {c.inscritos ?? 0}/{c.capacidad ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-sm text-slate-300">
                        <DollarSign size={13} className="text-slate-500" /> {Number(c.precio ?? 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[estado] || statusColors.draft}`}>{statusLabels[estado] || estado}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1 opacity-40" title="Editar/Eliminar pendiente PUT/DELETE">
                        <span className="p-2 text-slate-400">
                          <Pencil size={15} />
                        </span>
                        <span className="p-2 text-slate-400">
                          <Trash2 size={15} />
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#1e293b] px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-white font-semibold">Nuevo Curso</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              {formError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">{formError}</div>}

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Título *</label>
                <input value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} placeholder="React Avanzado" required className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-green-600" />
              </div>
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Descripción</label>
                <textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} rows={3} placeholder="Breve descripción..." className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-green-600 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Precio</label>
                  <input type="number" step="0.01" value={formData.precio} onChange={(e) => setFormData({ ...formData, precio: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-600" />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Capacidad *</label>
                  <input type="number" value={formData.capacidad} onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })} required className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-600" />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Profesor * (colección RAM)</label>
                <select value={formData.instructor} onChange={(e) => setFormData({ ...formData, instructor: e.target.value })} required className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-600">
                  <option value="">— Seleccionar —</option>
                  {professors.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.nombre} ({u.email}) {u.activo ? "" : "— inactivo"}
                    </option>
                  ))}
                </select>
                <p className="text-slate-500 text-[11px] mt-1">Colección en RAM sin backend · {professors.length} profesores · IDs ObjectId válidos para que el backend acepte instructor.</p>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Categoría * (colección RAM)</label>
                <select value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })} required className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-600">
                  <option value="">— Seleccionar —</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.nombre} — {c.descripcion}
                    </option>
                  ))}
                </select>
                <p className="text-slate-500 text-[11px] mt-1">Colección en RAM · {categories.length} categorías · sin /api/categories, IDs ObjectId válidos.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Fecha inicio *</label>
                  <input type="date" value={formData.fechaInicio} onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })} required className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-600" />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Fecha fin *</label>
                  <input type="date" value={formData.fechaFin} onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })} required className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-600" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Hora inicio *</label>
                  <input type="time" value={formData.horaInicio} onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })} required className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-600" />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Hora fin *</label>
                  <input type="time" value={formData.horaFin} onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })} required className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-600" />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Días *</label>
                <div className="flex flex-wrap gap-1.5">
                  {diasOptions.map((d) => (
                    <button key={d} type="button" onClick={() => toggleDia(d)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${formData.diasSemana.includes(d) ? "bg-green-600 text-white" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Estado</label>
                  <select value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-600">
                    <option value="draft">Borrador</option>
                    <option value="published">Publicado</option>
                    <option value="finished">Finalizado</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 mt-6 cursor-pointer">
                  <input type="checkbox" checked={formData.publicado} onChange={(e) => setFormData({ ...formData, publicado: e.target.checked })} className="accent-green-600" />
                  <span className="text-sm text-slate-300">Publicado</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold">
                  Cancelar
                </button>
                <button type="submit" disabled={isSaving} className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSaving && <Loader2 size={16} className="animate-spin" />} {isSaving ? "Creando..." : "Crear Curso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500 mt-4">
        Categoría e instructor desde RAM (<code className="bg-[#1e293b] px-1 rounded">useCategoryStore / useProfessorStore</code>) — POST /api/courses usa <code className="bg-[#1e293b] px-1 rounded">titulo,categoria,instructor,fechaInicio,fechaFin,horaInicio,horaFin,diasSemana</code> per <code className="bg-[#1e293b] px-1 rounded">course.controller.js:79</code>.
      </p>
    </div>
  );
}
