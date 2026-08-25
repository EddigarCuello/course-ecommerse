import { useEffect, useState, useRef } from "react";
import { 
  Plus, Search, Pencil, Trash2, CheckCircle, XCircle, Loader2, 
  Upload, FileSpreadsheet, FileCode, AlertCircle, X, UserCheck, RefreshCw 
} from "lucide-react";
import * as XLSX from "xlsx";
import { teacherService } from "../../services/teacher.service.js";

export default function AdminInstructors() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [search, setSearch] = useState("");

  // Modales
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditing, setCurrentEditing] = useState(null);

  // Formulario Manual
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    pais: "",
    ciudad: "",
    especializacion: "",
    departamento: ""
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Carga Masiva
  const [bulkFile, setBulkFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const fileInputRef = useRef(null);

  const fetchInstructors = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const data = await teacherService.getAll();
      setInstructors(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Error al cargar instructores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors(false);
  }, []);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.email) {
      setError("Nombre y Email son obligatorios.");
      return;
    }
    setFormSubmitting(true);
    setError(null);
    try {
      await teacherService.create({
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        pais: formData.pais,
        ciudad: formData.ciudad,
        detallesInstructor: {
          especializacion: formData.especializacion,
          departamento: formData.departamento
        }
      });
      setSuccessMsg("Instructor creado exitosamente");
      setIsManualModalOpen(false);
      setFormData({ nombre: "", email: "", telefono: "", pais: "", ciudad: "", especializacion: "", departamento: "" });
      fetchInstructors();
    } catch (err) {
      setError(err.message || "Error al registrar instructor");
    } finally {
      setFormSubmitting(false);
    }
  };

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
          const list = Array.isArray(parsed) ? parsed : (parsed.instructores || parsed.teachers || []);
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
      const res = await teacherService.createBulk(previewData);
      setBulkResult(res);
      setSuccessMsg(res.message || "Carga masiva completada");
      fetchInstructors();
    } catch (err) {
      setError(err.message || "Error en la carga masiva");
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleEditOpen = (inst) => {
    setCurrentEditing(inst);
    setFormData({
      nombre: inst.nombre || "",
      email: inst.email || "",
      telefono: inst.telefono || "",
      pais: inst.pais || "",
      ciudad: inst.ciudad || "",
      especializacion: inst.detallesInstructor?.especializacion || "",
      departamento: inst.detallesInstructor?.departamento || ""
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!currentEditing) return;
    setFormSubmitting(true);
    setError(null);
    try {
      await teacherService.update(currentEditing._id, {
        nombre: formData.nombre,
        telefono: formData.telefono,
        pais: formData.pais,
        ciudad: formData.ciudad,
        detallesInstructor: {
          especializacion: formData.especializacion,
          departamento: formData.departamento
        }
      });
      setSuccessMsg("Instructor actualizado correctamente");
      setIsEditModalOpen(false);
      setCurrentEditing(null);
      fetchInstructors();
    } catch (err) {
      setError(err.message || "Error al actualizar instructor");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (inst) => {
    try {
      await teacherService.update(inst._id, { activo: !inst.activo });
      setInstructors(prev => prev.map(i => i._id === inst._id ? { ...i, activo: !inst.activo } : i));
    } catch (err) {
      setError("Error al cambiar estado: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este instructor?")) return;
    try {
      await teacherService.delete(id);
      setSuccessMsg("Instructor eliminado correctamente");
      fetchInstructors();
    } catch (err) {
      setError("Error al eliminar instructor: " + err.message);
    }
  };

  const filtered = instructors.filter(
    (u) => (u.nombre || "").toLowerCase().includes(search.toLowerCase()) || 
           (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
           (u.detallesInstructor?.especializacion || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserCheck className="text-green-500" size={26} /> Gestionar Instructores
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {loading ? "Cargando..." : `${filtered.length} de ${instructors.length} instructores registrados`} · Conectado a MongoDB (/api/teachers)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { setBulkFile(null); setPreviewData([]); setBulkResult(null); setIsBulkModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-sm font-semibold transition-all shadow-md"
          >
            <Upload size={16} className="text-green-400" /> Cargar Excel / JSON
          </button>
          
          <button
            onClick={() => {
              setFormData({ nombre: "", email: "", telefono: "", pais: "", ciudad: "", especializacion: "", departamento: "" });
              setIsManualModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-green-600/20"
          >
            <Plus size={16} /> Nuevo Instructor
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
            placeholder="Buscar por nombre, email o especialización..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1e293b] border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-green-600"
          />
        </div>
        <button
          onClick={fetchInstructors}
          className="p-2.5 bg-[#1e293b] border border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
          title="Refrescar datos"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Tabla de Instructores */}
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl overflow-x-auto shadow-xl">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/50">
              {["Instructor", "Email", "Ubicación", "Especialización / Dpto", "Estado", "Acciones"].map((h) => (
                <th key={h} className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
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
                  <p className="text-slate-500 text-sm mt-2">Cargando instructores desde MongoDB...</p>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                  {instructors.length === 0 ? "No hay instructores en la base de datos." : "Sin resultados para la búsqueda."}
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u._id} className="hover:bg-slate-700/20 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nombre)}&background=16a34a&color=fff`}
                        alt={u.nombre}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <p className="text-white font-medium text-sm">{u.nombre}</p>
                        <p className="text-slate-500 text-xs">{u.telefono || "Sin teléfono"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-sm">{u.email}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {u.pais || u.ciudad ? `${u.ciudad || ""}${u.ciudad && u.pais ? ", " : ""}${u.pais || ""}` : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-slate-200 text-sm">{u.detallesInstructor?.especializacion || "General"}</p>
                      {u.detallesInstructor?.departamento && (
                        <p className="text-slate-500 text-xs">{u.detallesInstructor.departamento}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
                        u.activo ? "bg-green-500/15 text-green-400 hover:bg-green-500/25" : "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                      }`}
                      title="Click para cambiar estado"
                    >
                      {u.activo ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {u.activo ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleEditOpen(u)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Creación Manual */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="text-green-500" size={20} /> Nuevo Instructor Manual
              </h3>
              <button onClick={() => setIsManualModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre Completo *</label>
                  <input
                    required
                    type="text"
                    placeholder="Ej. Juan Pérez"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Correo Electrónico *</label>
                  <input
                    required
                    type="email"
                    placeholder="juan@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="+57 300 000 0000"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">País</label>
                  <input
                    type="text"
                    placeholder="Colombia"
                    value={formData.pais}
                    onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Ciudad</label>
                  <input
                    type="text"
                    placeholder="Bogotá"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Especialización</label>
                  <input
                    type="text"
                    placeholder="Desarrollo Web / Cloud"
                    value={formData.especializacion}
                    onChange={(e) => setFormData({ ...formData, especializacion: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Departamento</label>
                  <input
                    type="text"
                    placeholder="Tecnología e Ingeniería"
                    value={formData.departamento}
                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
                >
                  {formSubmitting && <Loader2 size={16} className="animate-spin" />} Guardar en MongoDB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Carga Masiva Excel / JSON */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Upload className="text-green-500" size={20} /> Cargar Instructores (Excel / JSON)
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
                          <th className="p-2">Nombre</th>
                          <th className="p-2">Email</th>
                          <th className="p-2">Especialización</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.slice(0, 10).map((row, idx) => (
                          <tr key={idx} className="border-b border-slate-800/50 text-slate-300">
                            <td className="p-2 text-slate-500">{idx + 1}</td>
                            <td className="p-2 font-medium text-white">{row.nombre || row.Nombre || row.name || "—"}</td>
                            <td className="p-2">{row.email || row.Email || row.correo || "—"}</td>
                            <td className="p-2 text-slate-400">{row.especializacion || row.Especializacion || row.detallesInstructor?.especializacion || "—"}</td>
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
                    <p className="text-amber-400">⚠️ Omitidos (emails duplicados): {bulkResult.omitidos.length}</p>
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

      {/* Modal Edición */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Pencil className="text-green-500" size={18} /> Editar Instructor
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">País</label>
                  <input
                    type="text"
                    value={formData.pais}
                    onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Especialización</label>
                  <input
                    type="text"
                    value={formData.especializacion}
                    onChange={(e) => setFormData({ ...formData, especializacion: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Departamento</label>
                  <input
                    type="text"
                    value={formData.departamento}
                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
                >
                  {formSubmitting && <Loader2 size={16} className="animate-spin" />} Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
