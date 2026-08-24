import { Search, ClipboardList } from "lucide-react";

/**
 * Admin Inscripciones — estático
 * Replica AdminEnrollments.jsx: tabla estudiante/curso/monto/estado/fecha
 * VACACIONALPAG: enrollments + profiles + courses (Supabase). Prime: EnrollmentModel {usuario, curso, estadoPago, montoPagado}
 * Backend aún sin ruta /api/enrollments (solo modelos), por eso vista estática con mock
 */
const mockEnrollments = [
  { _id: "e1", usuario: { nombre: "Sofía López" }, curso: { titulo: "React Avanzado", precio: 49.99 }, montoPagado: 49.99, estadoPago: "paid", fechaInscripcion: "2026-08-10" },
  { _id: "e2", usuario: { nombre: "Juan Pérez" }, curso: { titulo: "UX/UI con Figma", precio: 39.99 }, montoPagado: 39.99, estadoPago: "pending", fechaInscripcion: "2026-08-12" },
  { _id: "e3", usuario: { nombre: "María Gómez" }, curso: { titulo: "Node.js API REST", precio: 59.99 }, montoPagado: 59.99, estadoPago: "paid", fechaInscripcion: "2026-08-13" },
  { _id: "e4", usuario: { nombre: "Pedro Ruiz" }, curso: { titulo: "Python Data" }, montoPagado: null, estadoPago: "failed", fechaInscripcion: "2026-08-14" },
];

const statusColors = {
  paid: "bg-green-500/15 text-green-400",
  pending: "bg-yellow-500/15 text-yellow-400",
  failed: "bg-red-500/15 text-red-400",
  refunded: "bg-slate-500/15 text-slate-400",
};
const statusLabels = { paid: "Pagado", pending: "Pendiente", failed: "Fallido", refunded: "Reembolsado" };

export default function AdminEnrollments() {
  const totalRevenue = mockEnrollments.filter((e) => e.estadoPago === "paid").reduce((sum, e) => sum + (e.montoPagado ?? e.curso.precio), 0);

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Inscripciones</h1>
          <p className="text-slate-400 text-sm mt-1">
            {mockEnrollments.length} inscripciones · <span className="text-green-400">${totalRevenue.toFixed(2)} recaudados</span> — estático
          </p>
        </div>
        <div className="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center">
          <ClipboardList size={20} className="text-green-400" />
        </div>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input disabled placeholder="Buscar por estudiante o curso... (deshabilitado)" className="w-full max-w-sm pl-10 pr-4 py-2.5 bg-[#1e293b] border border-slate-700 rounded-xl text-sm placeholder-slate-500" />
      </div>

      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-700">
              {["Estudiante", "Curso", "Monto", "Estado pago", "Fecha"].map((h) => (
                <th key={h} className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {mockEnrollments.map((e) => (
              <tr key={e._id} className="hover:bg-slate-700/20">
                <td className="px-6 py-4 text-slate-200 text-sm font-medium">{e.usuario.nombre}</td>
                <td className="px-6 py-4 text-slate-300 text-sm">{e.curso.titulo}</td>
                <td className="px-6 py-4 text-slate-300 text-sm">${(e.montoPagado ?? e.curso.precio).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[e.estadoPago]}`}>{statusLabels[e.estadoPago]}</span>
                </td>
                <td className="px-6 py-4 text-slate-400 text-sm">{new Date(e.fechaInscripcion).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500 mt-4">
        Modelo Prime: <code className="bg-[#1e293b] px-1 rounded">enrollment.schema.js</code> con <code className="bg-[#1e293b] px-1 rounded">usuario, curso, estadoPago, montoPagado</code>. Cuando exista <code className="bg-[#1e293b] px-1 rounded">GET /api/enrollments</code> con populate usuario/curso, reemplazar mock.
      </p>
    </div>
  );
}
