import { useEffect, useState, useRef } from "react";
import { 
  Plus, Search, Pencil, Trash2, Loader2, 
  Upload, FileSpreadsheet, FileCode, AlertCircle, X, Tag, RefreshCw, CheckCircle 
} from "lucide-react";
import * as XLSX from "xlsx";
import { categoryService } from "../../services/category.service.js";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
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
    descripcion: "",
    icono: "BookOpen",
    color: "#3b82f6"
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Carga Masiva
  const [bulkFile, setBulkFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const fileInputRef = useRef(null);

  const fetchCategories = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const data = await categoryService.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(false);
  }, []);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre) {
      setError("El nombre es obligatorio.");
      return;
    }
    setFormSubmitting(true);
    setError(null);
    try {
      await categoryService.create(formData);
      setSuccessMsg("Categoría creada exitosamente");
      setIsManualModalOpen(false);
      setFormData({ nombre: "", descripcion: "", icono: "BookOpen", color: "#3b82f6" });
      fetchCategories();
    } catch (err) {
      setError(err.message || "Error al registrar categoría");
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
          const list = Array.isArray(parsed) ? parsed : (parsed.categorias || parsed.categories || []);
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
      const res = await categoryService.createBulk(previewData);
      setBulkResult(res);
      setSuccessMsg(res.message || "Carga masiva completada");
      fetchCategories();
    } catch (err) {
      setError(err.message || "Error en la carga masiva");
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleEditOpen = (cat) => {
    setCurrentEditing(cat);
    setFormData({
      nombre: cat.nombre || "",
      descripcion: cat.descripcion || "",
      icono: cat.icono || "BookOpen",
      color: cat.color || "#3b82f6"
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!currentEditing) return;
    setFormSubmitting(true);
    setError(null);
    try {
      await categoryService.update(currentEditing._id, formData);
      setSuccessMsg("Categoría actualizada correctamente");
      setIsEditModalOpen(false);
      setCurrentEditing(null);
      fetchCategories();
    } catch (err) {
      setError(err.message || "Error al actualizar categoría");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) return;
    try {
      await categoryService.delete(id);
      setSuccessMsg("Categoría eliminada correctamente");
      fetchCategories();
    } catch (err) {
      setError("Error al eliminar categoría: " + err.message);
    }
  };

  const filtered = categories.filter(
    (c) => (c.nombre || "").toLowerCase().includes(search.toLowerCase()) || 
           (c.descripcion || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Tag className="text-green-500" size={26} /> Gestionar Categorías
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {loading ? "Cargando..." : `${filtered.length} de ${categories.length} categorías registradas`} · Conectado a MongoDB (/api/categories)
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
              setFormData({ nombre: "", descripcion: "", icono: "BookOpen", color: "#3b82f6" });
              setIsManualModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-green-600/20"
          >
            <Plus size={16} /> Nueva Categoría
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
            placeholder="Buscar por nombre o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1e293b] border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-green-600"
          />
        </div>
        <button
          onClick={() => fetchCategories(true)}
          className="p-2.5 bg-[#1e293b] border border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
          title="Refrescar datos"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Tabla de Categorías */}
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl overflow-x-auto shadow-xl">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/50">
              {["Categoría", "Descripción", "Color", "Acciones"].map((h) => (
                <th key={h} className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <Loader2 className="animate-spin mx-auto text-slate-500" size={24} />
                  <p className="text-slate-500 text-sm mt-2">Cargando categorías desde MongoDB...</p>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-sm">
                  {categories.length === 0 ? "No hay categorías en la base de datos." : "Sin resultados para la búsqueda."}
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c._id} className="hover:bg-slate-700/20 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md"
                        style={{ backgroundColor: c.color || "#3b82f6" }}
                      >
                        {c.nombre.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium text-sm">{c.nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-sm">{c.descripcion || "—"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border border-slate-600 inline-block"
                        style={{ backgroundColor: c.color || "#3b82f6" }}
                      />
                      <span className="text-slate-400 text-xs font-mono">{c.color || "#3b82f6"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleEditOpen(c)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(c._id)}
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
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="text-green-500" size={20} /> Nueva Categoría Manual
              </h3>
              <button onClick={() => setIsManualModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre *</label>
                <input
                  required
                  type="text"
                  placeholder="Ej. Inteligencia Artificial"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  placeholder="Breve explicación de la categoría..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Color Identificador</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-mono"
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
                <Upload className="text-green-500" size={20} /> Cargar Categorías (Excel / JSON)
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
                          <th className="p-2">Descripción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.slice(0, 10).map((row, idx) => (
                          <tr key={idx} className="border-b border-slate-800/50 text-slate-300">
                            <td className="p-2 text-slate-500">{idx + 1}</td>
                            <td className="p-2 font-medium text-white">{row.nombre || row.Nombre || row.name || "—"}</td>
                            <td className="p-2 text-slate-400">{row.descripcion || row.Descripcion || row.description || "—"}</td>
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
                  {bulkResult.creadas?.length > 0 && (
                    <p className="text-slate-300">✓ Creadas exitosamente: {bulkResult.creadas.length}</p>
                  )}
                  {bulkResult.omitidas?.length > 0 && (
                    <p className="text-amber-400">⚠️ Omitidas (ya existen): {bulkResult.omitidas.length}</p>
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
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Pencil className="text-green-500" size={18} /> Editar Categoría
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-mono"
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
