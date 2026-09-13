import { GraduationCap, BookOpen, ArrowRight, Clock, Calendar, Loader2, CheckCircle2, Circle } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { paymentService } from "../services/payment.service.js";

// Avatar de inicial del instructor
function InstructorAvatar({ name }) {
  const colors = [
    "bg-emerald-500", "bg-blue-500", "bg-violet-500",
    "bg-amber-500", "bg-rose-500", "bg-cyan-500",
  ];
  const initial = (name || "S").charAt(0).toUpperCase();
  const color = colors[initial.charCodeAt(0) % colors.length];
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold ${color} shrink-0`}>
      {initial}
    </span>
  );
}

export default function MyCourses() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchCourses = async () => {
      try {
        const myPayments = await paymentService.getMyPayments();
        if (!cancelled) {
          setPayments(myPayments); // todos (paid + pending)
        }
      } catch (error) {
        console.error("Error loading my courses:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCourses();
    return () => { cancelled = true; };
  }, []);

  const paidPayments   = payments.filter(p => p.estado === 'paid');
  const totalInvertido = paidPayments.reduce((sum, p) => sum + (p.monto || 0), 0);

  const enrolledCourses = payments
    .filter(p => p.estado === 'paid' || p.estado === 'pending')
    .map(p => ({
      ...p.inscripcion?.curso,
      paymentId: p._id,
      paymentState: p.estado,
      metodoPago: p.metodoPago,
      comprobanteUrl: p.comprobanteUrl,
    }))
    .filter(c => c && c._id);

  const [uploadingId, setUploadingId] = useState(null);

  const handleUploadReceipt = async (paymentId, event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploadingId(paymentId);
      await paymentService.uploadReceipt(paymentId, file);
      alert("Comprobante enviado exitosamente.");
      // Recargar pagos
      const myPayments = await paymentService.getMyPayments();
      setPayments(myPayments);
    } catch (error) {
      console.error("Error al subir comprobante:", error);
      alert("Error al subir el comprobante: " + (error.response?.data?.error || error.message));
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto w-full animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0f172a]">Mis Cursos</h1>
            <p className="text-[#64748b] text-sm">Hola, gestiona tus inscripciones</p>
          </div>
        </div>
        <Link
          to="/catalog"
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors inline-flex items-center justify-center whitespace-nowrap"
        >
          Explorar más cursos
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white py-8 px-6 rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col items-center text-center">
          <span className="text-4xl font-bold text-emerald-500 mb-2">{enrolledCourses.length}</span>
          <span className="text-[#64748b] text-sm font-medium">Cursos Inscritos</span>
        </div>
        <div className="bg-white py-8 px-6 rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col items-center text-center">
          <span className="text-4xl font-bold text-emerald-500 mb-2">{paidPayments.length}</span>
          <span className="text-[#64748b] text-sm font-medium">Pagos confirmados</span>
        </div>
        <div className="bg-white py-8 px-6 rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col items-center text-center">
          <span className="text-4xl font-bold text-[#0f172a] mb-2">US$ {totalInvertido.toFixed(2)}</span>
          <span className="text-[#64748b] text-sm font-medium">Inversión total</span>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <Loader2 className="animate-spin mx-auto text-[#16a34a] mb-2" size={32} />
          <p className="text-sm">Cargando tus cursos...</p>
        </div>
      ) : enrolledCourses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-12 flex flex-col items-center text-center min-h-[400px]">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-[#94a3b8] mb-6">
            <BookOpen size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-[#0f172a] mb-2">Aún no tienes inscripciones</h2>
          <p className="text-[#64748b] mb-8 max-w-md">Explora el catálogo y encuentra el curso perfecto para ti</p>
          <Link
            to="/catalog"
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 group"
          >
            Explorar cursos
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {enrolledCourses.map((course, idx) => {
            const isPending   = course.paymentState === 'pending';
            const isCash      = course.metodoPago === 'cash_transfer';
            const hasReceipt  = !!course.comprobanteUrl;
            const professorName = course.instructor?.nombre || "Sin asignar";
            const days = Array.isArray(course.diasSemana)
              ? course.diasSemana.join(", ")
              : course.diasSemana || "Por definir";
            const time = course.horaInicio && course.horaFin
              ? `${course.horaInicio} - ${course.horaFin}`
              : "Por definir";

            return (
              <div
                key={course._id || idx}
                className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6 flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                {/* Title + badge */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[1.05rem] font-semibold text-[#0f172a] leading-snug">
                    {course.titulo || course.title}
                  </h3>
                  <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isPending
                      ? "text-amber-600 bg-amber-50"
                      : "text-emerald-600 bg-emerald-50"
                  }`}>
                    {isPending ? "pending" : "completed"}
                  </span>
                </div>

                {/* Instructor */}
                <div className="flex items-center gap-2">
                  <InstructorAvatar name={professorName} />
                  <span className="text-sm text-[#64748b]">{professorName}</span>
                </div>

                {/* Meta info */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-sm text-[#64748b]">
                    <Calendar size={14} className="text-[#94a3b8] shrink-0" />
                    <span>{days}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#64748b]">
                    <Clock size={14} className="text-[#94a3b8] shrink-0" />
                    <span>{time}</span>
                  </div>
                </div>

                {/* Cash warning & Upload Button */}
                {isPending && isCash && (
                  <div className="flex flex-col gap-2 mt-2">
                    <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                      💳 Envía tu comprobante al administrador para activar el acceso.
                    </p>
                    
                    {hasReceipt ? (
                       <p className="text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2 flex items-center gap-1">
                         <CheckCircle2 size={14} /> Comprobante enviado, esperando revisión.
                       </p>
                    ) : (
                      <div className="mt-1">
                        <label className={`cursor-pointer inline-flex items-center justify-center text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
                            uploadingId === course.paymentId ? "bg-slate-100 text-slate-400" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        }`}>
                          {uploadingId === course.paymentId ? (
                            <>
                              <Loader2 size={14} className="animate-spin mr-2" /> Subiendo...
                            </>
                          ) : "Subir comprobante"}
                          <input 
                            type="file" 
                            accept="image/*,application/pdf" 
                            className="hidden" 
                            disabled={uploadingId === course.paymentId}
                            onChange={(e) => handleUploadReceipt(course.paymentId, e)}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#f1f5f9]">
                  <div className="flex items-center gap-1.5 text-sm text-[#64748b]">
                    {isPending
                      ? <Circle size={15} className="text-amber-400" />
                      : <CheckCircle2 size={15} className="text-emerald-500" />
                    }
                    <span>{isPending ? "Pendiente de confirmación" : "En Progreso"}</span>
                  </div>
                  <button
                    disabled={isPending}
                    className={`text-sm font-semibold transition-colors ${
                      isPending
                        ? "text-slate-300 cursor-not-allowed"
                        : "text-[#16a34a] hover:text-[#15803d]"
                    }`}
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
