import { useState, useEffect } from "react";
import { Search, ClipboardList, Loader2, Check, X, AlertCircle } from "lucide-react";
import { paymentService } from "../../services/payment.service.js";

const statusColors = {
  paid: "bg-green-500/15 text-green-400",
  pending: "bg-yellow-500/15 text-yellow-400",
  failed: "bg-red-500/15 text-red-400",
  refunded: "bg-slate-500/15 text-slate-400",
};

const statusLabels = { paid: "Pagado", pending: "Pendiente", failed: "Fallido", refunded: "Reembolsado" };

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updating, setUpdating] = useState(null); // ID del pago que se está actualizando

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getAllPayments();
      setEnrollments(data);
    } catch (error) {
      console.error("Error al cargar inscripciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (paymentId, newStatus) => {
    try {
      setUpdating(paymentId);
      await paymentService.updatePaymentStatus(paymentId, newStatus);
      // Actualizar estado local
      setEnrollments((prev) =>
        prev.map((e) => (e._id === paymentId ? { ...e, estado: newStatus } : e))
      );
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      alert("Error al actualizar estado: " + (error.response?.data?.error || error.message));
    } finally {
      setUpdating(null);
    }
  };

  const filteredEnrollments = enrollments.filter((e) => {
    const term = searchTerm.toLowerCase();
    const userName = e.usuario?.nombre?.toLowerCase() || "";
    const courseTitle = e.inscripcion?.curso?.titulo?.toLowerCase() || e.inscripcion?.curso?.title?.toLowerCase() || "";
    const method = e.metodoPago?.toLowerCase() || "";
    return userName.includes(term) || courseTitle.includes(term) || method.includes(term);
  });

  const totalRevenue = enrollments
    .filter((e) => e.estado === "paid")
    .reduce((sum, e) => sum + (e.monto || 0), 0);

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Inscripciones / Pagos</h1>
          <p className="text-slate-400 text-sm mt-1">
            {enrollments.length} transacciones · <span className="text-green-400">${totalRevenue.toFixed(2)} recaudados</span>
          </p>
        </div>
        <div className="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center">
          <ClipboardList size={20} className="text-green-400" />
        </div>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar por estudiante, curso o método de pago..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm pl-10 pr-4 py-2.5 bg-[#1e293b] border border-slate-700 rounded-xl text-sm placeholder-slate-500 text-white focus:outline-none focus:border-green-500 transition-colors"
        />
      </div>

      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/50">
              {["Estudiante", "Curso", "Monto", "Método", "Fecha", "Estado", "Acciones"].map((h) => (
                <th key={h} className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                  <Loader2 size={24} className="animate-spin mx-auto mb-2 text-green-500" />
                  Cargando inscripciones...
                </td>
              </tr>
            ) : filteredEnrollments.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                  <AlertCircle size={24} className="mx-auto mb-2 text-slate-500" />
                  No se encontraron inscripciones
                </td>
              </tr>
            ) : (
              filteredEnrollments.map((e) => {
                const title = e.inscripcion?.curso?.titulo || e.inscripcion?.curso?.title || 'Curso eliminado';
                const method = e.metodoPago === 'cash_transfer' ? 'Efectivo/Transferencia' : 'Stripe';
                const date = new Date(e.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: '2-digit', minute: '2-digit' });
                
                return (
                  <tr key={e._id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 overflow-hidden shrink-0">
                          {e.usuario?.avatarUrl ? <img src={e.usuario.avatarUrl} alt="" className="w-full h-full object-cover" /> : e.usuario?.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-200 text-sm font-medium">{e.usuario?.nombre || 'Usuario eliminado'}</span>
                          <span className="text-slate-500 text-xs">{e.usuario?.email || '-'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{title}</td>
                    <td className="px-6 py-4 text-slate-300 text-sm font-medium">${(e.monto || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{method}</td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{date}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[e.estado] || statusColors.failed}`}>
                        {statusLabels[e.estado] || e.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {updating === e._id ? (
                          <Loader2 size={16} className="animate-spin text-slate-400" />
                        ) : e.estado === 'pending' ? (
                          <>
                            <button
                              title="Aprobar pago"
                              onClick={() => handleUpdateStatus(e._id, 'paid')}
                              className="p-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded transition-colors"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              title="Rechazar pago"
                              onClick={() => handleUpdateStatus(e._id, 'failed')}
                              className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : e.estado === 'paid' ? (
                           <button
                             title="Marcar como reembolsado"
                             onClick={() => {
                               if(window.confirm('¿Estás seguro de marcar este pago como reembolsado? Se quitará el acceso al curso.')) {
                                 handleUpdateStatus(e._id, 'refunded');
                               }
                             }}
                             className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                           >
                             Reembolsar
                           </button>
                        ) : (
                          <span className="text-xs text-slate-600">-</span>
                        )}

                        {e.comprobanteUrl && (
                          <a
                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${e.comprobanteUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-2 text-xs px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded transition-colors"
                            title="Ver comprobante"
                          >
                            Ver comprobante
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
