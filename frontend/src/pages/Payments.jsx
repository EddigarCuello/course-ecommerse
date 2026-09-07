export default function Payments() {
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
          <div className="text-2xl font-bold text-[#0f172a]">$0.00</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#e2e8f0] shadow-sm">
          <div className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">Pagos Completados</div>
          <div className="text-2xl font-bold text-[#16a34a]">0</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#e2e8f0] shadow-sm">
          <div className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">Pendientes</div>
          <div className="text-2xl font-bold text-[#f59e0b]">0</div>
        </div>
      </div>

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
              <tr>
                <td colSpan="5" className="px-5 py-12 text-center text-[#94a3b8]">
                  No hay transacciones registradas
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
