import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentService } from '../services/payment.service';

export default function Payments() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const verifyAttempted = import.meta.env.DEV ? React.useRef(false) : { current: false };

  useEffect(() => {
    const verifyAndLoad = async () => {
      const sessionId = searchParams.get('session_id');
      const status = searchParams.get('status');

      if (sessionId && status === 'success' && !verifyAttempted.current) {
        verifyAttempted.current = true;
        setVerifying(true);
        try {
          await paymentService.verifyCheckout(sessionId);
          // Limpiar la URL para que no vuelva a verificar si recarga
          navigate('/pagos', { replace: true });
        } catch (error) {
          console.error("Error verificando pago:", error);
          alert("Hubo un error verificando tu pago. Por favor contacta soporte.");
        } finally {
          setVerifying(false);
        }
      }

      // Cargar pagos independientemente de si verificamos o no
      try {
        const myPayments = await paymentService.getMyPayments();
        setPayments(myPayments);
      } catch (error) {
        console.error("Error cargando pagos:", error);
      } finally {
        setLoading(false);
      }
    };

    verifyAndLoad();
  }, [searchParams, navigate]);

  const totalInvertido = payments.reduce((sum, p) => sum + (p.monto || 0), 0);
  const pagosCompletados = payments.filter(p => p.estado === 'paid').length;
  const pagosPendientes = payments.filter(p => p.estado === 'pending').length;
  return (
    <div className="p-6 md:p-8 max-w-[1200px] w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f172a]">Gestión de Pagos</h1>
        <p className="text-[#64748b] mt-1 text-sm">Historial de transacciones y estados de inscripción</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-[#e2e8f0] shadow-sm">
          <div className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">Total Invertido</div>
          <div className="text-2xl font-bold text-[#0f172a]">${totalInvertido.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#e2e8f0] shadow-sm">
          <div className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">Pagos Completados</div>
          <div className="text-2xl font-bold text-[#16a34a]">{pagosCompletados}</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#e2e8f0] shadow-sm">
          <div className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">Pendientes</div>
          <div className="text-2xl font-bold text-[#f59e0b]">{pagosPendientes}</div>
        </div>
      </div>

      {verifying && (
        <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
          <p className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verificando transacción de Stripe, por favor espera...
          </p>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#e2e8f0]">
          <h2 className="font-semibold text-[#0f172a]">Historial Reciente</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-xs text-[#94a3b8] uppercase font-semibold border-b border-[#e2e8f0]">
              <tr>
                <th className="px-5 py-4">ID Transacción</th>
                <th className="px-5 py-4">Curso / Concepto</th>
                <th className="px-5 py-4">Fecha</th>
                <th className="px-5 py-4">Monto</th>
                <th className="px-5 py-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-[#94a3b8]">Cargando historial...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-[#94a3b8]">
                    No hay transacciones registradas
                  </td>
                </tr>
              ) : (
                payments.map((pago) => (
                  <tr key={pago._id} className="border-b border-[#e2e8f0] last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">
                      {pago.metodoPago === 'cash_transfer'
                        ? <span className="font-sans text-amber-600 font-medium">Efectivo / Transferencia</span>
                        : (pago.stripePaymentId || '—').substring(0, 14) + '...'
                      }
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-800">
                      {pago.inscripcion?.curso?.titulo || 'Curso no disponible'}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {new Date(pago.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      ${(pago.monto ?? 0).toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        pago.estado === 'paid' ? 'bg-green-100 text-green-700' :
                        pago.estado === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {pago.estado === 'paid' ? 'Completado' : pago.estado === 'pending' ? 'Pendiente' : 'Fallido'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
