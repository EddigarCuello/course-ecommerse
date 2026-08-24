import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { userService } from "../../services/user.service.js";

export default function AdminInstructors() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    userService
      .getAll()
      .then((data) => {
        if (!cancelled) setUsers(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const instructors = users.filter((u) => u.rol === "instructor");
  const filtered = instructors.filter(
    (u) => (u.nombre || "").toLowerCase().includes(search.toLowerCase()) || (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestionar Instructores</h1>
          <p className="text-slate-400 text-sm mt-1">
            {loading ? "Cargando..." : `${filtered.length} de ${instructors.length} instructores`} {error && <span className="text-amber-400">· {error}</span>} {!loading && !error && "· GET /api/users filtrado rol=instructor en front"}
          </p>
        </div>
        <button disabled className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold opacity-50 cursor-not-allowed" title="Crear requiere POST /api/users">
          <Plus size={16} /> Nuevo Instructor
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input placeholder="Buscar por nombre o email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full max-w-sm pl-10 pr-4 py-2.5 bg-[#1e293b] border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-green-600" />
      </div>

      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-700">
              {["Instructor", "Email", "Estado", "Acciones"].map((h) => (
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
                  <p className="text-slate-500 text-sm mt-2">Cargando GET /api/users…</p>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-sm">
                  {instructors.length === 0 ? "No hay instructores (rol instructor) en la BD." : "Sin resultados."}
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u._id} className="hover:bg-slate-700/20">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nombre)}&background=16a34a&color=fff`} alt={u.nombre} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <p className="text-white font-medium text-sm">{u.nombre}</p>
                        <p className="text-slate-500 text-xs">{u.detallesInstructor?.especializacion || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-sm">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${u.activo ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                      {u.activo ? <CheckCircle size={11} /> : <XCircle size={11} />} {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1 opacity-40">
                      <span className="p-2 text-slate-400">
                        <Pencil size={15} />
                      </span>
                      <span className="p-2 text-slate-400">
                        <Trash2 size={15} />
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500 mt-4">
        Prime no tiene <code className="bg-[#1e293b] px-1 rounded">professors</code> tabla — usa <code className="bg-[#1e293b] px-1 rounded">GET /api/users</code> y filtro front <code className="bg-[#1e293b] px-1 rounded">rol==='instructor'</code>. Futuro: añadir <code className="bg-[#1e293b] px-1 rounded">?rol=instructor</code> en <code className="bg-[#1e293b] px-1 rounded">user.controller.js:5</code>. Crear con <code className="bg-[#1e293b] px-1 rounded">POST /api/users {"{nombre,email,password,rol:'instructor'}"}</code>
      </p>
    </div>
  );
}
