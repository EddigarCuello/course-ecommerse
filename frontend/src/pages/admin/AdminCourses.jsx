import { useEffect, useState, useRef } from "react";
import { 
  Plus, Search, Pencil, Trash2, Users, DollarSign, Loader2, X, Calendar, Clock, 
  Upload, FileSpreadsheet, FileCode, AlertCircle, RefreshCw, CheckCircle 
} from "lucide-react";
import * as XLSX from "xlsx";
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

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const professors = useProfessorStore((s) => s.professors);
  const fetchProfessors = useProfessorStore((s) => s.fetchProfessors);
  const categories = useCategoryStore((s) => s.categories);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Carga Masiva
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const fileInputRef = useRef(null);

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

  const loadCourses = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await courseService.getAll();
      setCourses(Array.isArray(data) ? data : []);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function init() {
      setLoading(true);
      try {
        await Promise.all([fetchCategories(), fetchProfessors()]);
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
    setEditingCourse(null);
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

  const openEdit = (course) => {
    setEditingCourse(course);
    setFormError(null);

    const catId = typeof course.categoria === "object" ? course.categoria?._id : course.categoria;
    const instId = typeof course.instructor === "object" ? course.instructor?._id : course.instructor;

    const parseDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

    setFormData({
      titulo: course.titulo || course.title || "",
      descripcion: course.descripcion || "",
      categoria: catId || categories[0]?._id || "",
      instructor: instId || professors[0]?._id || "",
      precio: course.precio ?? 0,
      capacidad: course.capacidad ?? 20,
      fechaInicio: parseDate(course.fechaInicio) || new Date().toISOString().slice(0, 10),
      fechaFin: parseDate(course.fechaFin) || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      horaInicio: course.horaInicio || "09:00",
      horaFin: course.horaFin || "11:00",
      diasSemana: Array.isArray(course.diasSemana) ? course.diasSemana : [],
      estado: course.estado || (course.publicado ? "published" : "draft"),
      publicado: course.publicado ?? false,
    });
    setIsModalOpen(true);
  };

  const toggleDia = (dia) => {
    setFormData((prev) => ({
      ...prev,
      diasSemana: prev.diasSemana.includes(dia) ? prev.diasSemana.filter((d) => d !== dia) : [...prev.diasSemana, dia],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.titulo || !formData.categoria || !formData.instructor || !formData.fechaInicio || !formData.fechaFin || !formData.horaInicio || !formData.horaFin || formData.diasSemana.length === 0) {
      setFormError("Completa: título, categoría, instructor, fechas, horas y al menos un día.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        categoria: formData.categoria,
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

      if (editingCourse) {
        await courseService.update(editingCourse._id, payload);
        setSuccessMsg("Curso actualizado con éxito");
      } else {
        await courseService.create(payload);
        setSuccessMsg("Curso creado con éxito");
      }

      await loadCourses();
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || "Error al guardar el curso");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      await courseService.remove(id);
      await loadCourses();
      setSuccessMsg("Curso eliminado correctamente");
      setDeletingId(null);
    } catch (err) {
      setError("Error al eliminar curso: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Carga Masiva handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBulkFile(file);
    setBulkResult(null);
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".json")) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result);
          const list = Array.isArray(parsed) ? parsed : (parsed.cursos || parsed.courses || []);
          setPreviewData(list);
        } catch (err) {
          setError("Error al parsear el archivo JSON: " + err.message);
        }
      };
      reader.readAsText(file);
    } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls") || fileName.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target.result;
          const workbook = XLSX.read(bstr, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          setPreviewData(json);
        } catch (err) {
          setError("Error al procesar el archivo Excel: " + err.message);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      setError("Formato no soportado. Sube un archivo .xlsx, .xls, .csv o .json");
    }
  };

  const handleBulkImportSubmit = async () => {
    if (previewData.length === 0) {
      setError("No hay registros para importar.");
      return;
    }
    setBulkSubmitting(true);
    setError(null);
    try {
      const res = await courseService.createBulk(previewData);
      setBulkResult(res);
      setSuccessMsg(res.message || "Carga masiva de cursos completada");
      loadCourses();
    } catch (err) {
      setError(err.message || "Error en la carga masiva de cursos");
    } finally {
      setBulkSubmitting(false);
    }
  };

  const filtered = courses.filter(
    (c) =>
      (c.titulo || c.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.instructor?.nombre || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Gestionar Cursos</h1>
          <p className="text-slate-400 text-sm">
            {loading ? "Cargando..." : `${filtered.length} de ${courses.length} cursos registrados`} · Conectado a MongoDB (/api/courses)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { setBulkFile(null); setPreviewData([]); setBulkResult(null); setIsBulkModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-sm font-semibold transition-all shadow-md"
          >
            <Upload size={16} className="text-green-400" /> Cargar Excel / JSON
          </button>

          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-green-900/20 transition-colors">
            <Plus size={16} /> Nuevo Curso
          </button>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)}><X size={16} /></button>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)}><X size={16} /></button>
        </div>
      )}

      {/* Buscador & Refrescar */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            placeholder="Buscar por título o instructor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1e293b] border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-green-600"
          />
        </div>
        <button
          onClick={() => loadCourses(true)}
          className="p-2.5 bg-[#1e293b] border border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
          title="Refrescar datos"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl overflow-x-auto shadow-xl">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/50">
              {["Curso", "Instructor", "Categoría", "Cupos", "Precio", "Estado", "Acciones"].map((h) => (
                <th key={h} className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <Loader2 className="animate-spin mx-auto text-slate-500" size={24} />
                  <p className="text-slate-500 text-sm mt-2">Cargando cursos desde la base de datos…</p>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm">
                  {courses.length === 0 ? "No hay cursos en la BD. Crea el primero con Nuevo Curso." : "Sin resultados."}
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const titulo = c.titulo || c.title || "—";
                const instructorNombre = c.instructor?.nombre || "Sin asignar";
                const categoriaNombre = c.categoria?.nombre || "Sin categoría";
                const dias = Array.isArray(c.diasSemana) ? c.diasSemana.join(", ") : c.diasSemana || "";
                const estado = c.estado || (c.publicado ? "published" : "draft");
                return (
                  <tr key={c._id} className="hover:bg-slate-700/20 transition-all">
                    <td className="px-6 py-4">
                      <p className="text-white font-medium text-sm">{titulo}</p>
                      <p className="text-slate-500 text-xs flex items-center gap-1.5 mt-0.5">
                        <Calendar size={12} /> {dias || "—"}
                        <span className="ml-2 flex items-center gap-1">
                          <Clock size={12} /> {c.horaInicio || ""} - {c.horaFin || ""}
                        </span>
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{instructorNombre}</td>
                    <td className="px-6 py-4 text-slate-300 text-sm">
                      <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium">
                        {categoriaNombre}
                      </span>
                    </td>
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
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Editar Curso"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingId(c._id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Eliminar Curso"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Carga Masiva Excel / JSON */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Upload className="text-green-500" size={20} /> Cargar Cursos (Excel / JSON)
              </h3>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-green-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-900/50 hover:bg-slate-900 transition-all group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv, .json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex justify-center gap-3 mb-3">
                  <FileSpreadsheet className="text-green-400 group-hover:scale-110 transition-transform" size={32} />
                  <FileCode className="text-blue-400 group-hover:scale-110 transition-transform" size={32} />
                </div>
                <p className="text-white font-medium text-sm">
                  {bulkFile ? bulkFile.name : "Haz clic o arrastra aquí tu archivo Excel (.xlsx, .csv) o JSON (.json)"}
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Formatos soportados: .xlsx, .xls, .csv, .json
                </p>
              </div>

              {previewData.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-slate-300">
                      Vista previa ({previewData.length} registros detectados):
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-800">
                          <th className="p-2">#</th>
                          <th className="p-2">Título</th>
                          <th className="p-2">Precio</th>
                          <th className="p-2">Capacidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.slice(0, 10).map((row, idx) => (
                          <tr key={idx} className="border-b border-slate-800/50 text-slate-300">
                            <td className="p-2 text-slate-500">{idx + 1}</td>
                            <td className="p-2 font-medium text-white">{row.titulo || row.Title || row.title || "—"}</td>
                            <td className="p-2">${row.precio ?? row.price ?? 0}</td>
                            <td className="p-2">{row.capacidad ?? row.capacity ?? 20}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {previewData.length > 10 && (
                      <p className="text-center text-slate-500 py-1 text-[11px]">
                        ...y {previewData.length - 10} registros más
                      </p>
                    )}
                  </div>
                </div>
              )}

              {bulkResult && (
                <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl text-xs space-y-1">
                  <p className="text-green-400 font-semibold">{bulkResult.message}</p>
                  {bulkResult.creados?.length > 0 && (
                    <p className="text-slate-300">✓ Creados exitosamente: {bulkResult.creados.length}</p>
                  )}
                  {bulkResult.omitidos?.length > 0 && (
                    <p className="text-amber-400">⚠️ Omitidos: {bulkResult.omitidos.length}</p>
                  )}
                  {bulkResult.errores?.length > 0 && (
                    <p className="text-red-400">❌ Errores: {bulkResult.errores.length}</p>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-700 flex justify-end gap-3 bg-slate-800/40">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-700"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleBulkImportSubmit}
                disabled={bulkSubmitting || previewData.length === 0}
                className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                {bulkSubmitting && <Loader2 size={16} className="animate-spin" />} Confirmar e Importar a MongoDB
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#1e293b] px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-white font-semibold">{editingCourse ? "Editar Curso" : "Nuevo Curso"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
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
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Precio ($)</label>
                  <input type="number" step="0.01" value={formData.precio} onChange={(e) => setFormData({ ...formData, precio: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-600" />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Capacidad *</label>
                  <input type="number" value={formData.capacidad} onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })} required className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-600" />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Instructor * (Base de datos MongoDB)</label>
                <select value={formData.instructor} onChange={(e) => setFormData({ ...formData, instructor: e.target.value })} required className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-600">
                  <option value="">— Seleccionar —</option>
                  {professors.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.nombre} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Categoría * (Base de datos MongoDB)</label>
                <select value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })} required className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-600">
                  <option value="">— Seleccionar —</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.nombre} — {c.descripcion}
                    </option>
                  ))}
                </select>
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

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Estado</label>
                <select value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-600">
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                  <option value="finished">Finalizado</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold">
                  Cancelar
                </button>
                <button type="submit" disabled={isSaving} className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSaving && <Loader2 size={16} className="animate-spin" />} {isSaving ? "Guardando..." : editingCourse ? "Actualizar Curso" : "Crear Curso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-sm p-6 text-center">
            <h3 className="text-white font-semibold text-lg mb-2">¿Eliminar curso?</h3>
            <p className="text-slate-400 text-sm mb-6">El curso pasará al estado de borrado lógico en la base de datos.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting && <Loader2 size={16} className="animate-spin" />} {isDeleting ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
