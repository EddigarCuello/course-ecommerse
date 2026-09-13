import { useEffect, useState } from "react";
import { Search, Sun, Sunset, Moon, Calendar, Clock, Users, ChevronRight, Loader2, X } from "lucide-react";
import { courseService } from "../services/course.service.js";
import { paymentService } from "../services/payment.service.js";
import { useAuthStore } from "../hooks/useAuthStore.js";

function Badge({ available }) {
  if (available <= 0)
    return <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fee2e2] text-[#dc2626] w-fit mb-4">Lleno</span>;
  if (available > 5)
    return <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-[#dcfce7] text-[#22c55e] w-fit mb-4">{available} cupos</span>;
  return <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fef08a] text-[#ca8a04] w-fit mb-4">{available} cupos</span>;
}

function CourseModal({ course, onClose }) {
  if (!course) return null;

  const title = course.titulo || course.title || "Sin título";
  const description = course.descripcion || "Sin descripción disponible.";
  const professorName = course.instructor?.nombre || "Sin asignar";
  const days = Array.isArray(course.diasSemana) ? course.diasSemana.join(", ") : course.diasSemana || "Por definir";
  const time = course.horaInicio && course.horaFin ? `${course.horaInicio} - ${course.horaFin}` : "Por definir";
  const enrolled = course.inscritos ?? 0;
  const capacity = course.capacidad ?? 20;
  const available = capacity - enrolled;
  const price = Number(course.precio ?? 0);
  const initial = professorName.charAt(0).toUpperCase();

  const discount = price * 0.15;
  const taxes = (price - discount) * 0.12;
  const total = price - discount + taxes;

  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [loadingPay, setLoadingPay] = useState(false);
  const [payError, setPayError] = useState(null);
  const [cashSuccess, setCashSuccess] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const handleInscribirse = async () => {
    if (!isAuthenticated) {
      setPayError("Debes iniciar sesión para inscribirte.");
      return;
    }
    if (course.isEnrolled) {
      setPayError("Ya estás inscrito en este curso.");
      return;
    }
    if (paymentMethod === "stripe") {
      setLoadingPay(true);
      setPayError(null);
      try {
        await paymentService.createCheckout(course._id || course.id);
      } catch (err) {
        setPayError(err.message || "Error al conectar con Stripe.");
        setLoadingPay(false);
      }
    } else {
      // Pago por efectivo/transferencia
      setLoadingPay(true);
      setPayError(null);
      try {
        await paymentService.registerCashPayment(course._id || course.id);
        setCashSuccess(true);
      } catch (err) {
        setPayError(err.response?.data?.error || err.message || "Error al registrar la inscripción.");
      } finally {
        setLoadingPay(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[700px] relative overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full text-[#94a3b8] hover:text-[#0f172a] hover:bg-slate-100 transition-colors shadow-sm border border-slate-100">
          <X size={20} />
        </button>

        <div className="p-8 overflow-y-auto flex-1">
          {cashSuccess ? (
            <div className="flex flex-col items-center justify-center text-center py-8 gap-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 text-3xl mb-2">
                🏦
              </div>
              <h3 className="text-xl font-bold text-[#0f172a]">¡Inscripción Registrada!</h3>
              <p className="text-[#64748b] max-w-sm">
                Tu inscripción en <span className="font-semibold text-[#0f172a]">{title}</span> ha sido registrada con estado <span className="font-semibold text-amber-600">Pendiente</span>.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 text-left w-full max-w-sm">
                <p className="font-semibold mb-1">📋 Instrucciones de pago:</p>
                <p>Realiza tu transferencia o pago en efectivo y envía el comprobante al administrador para confirmar tu inscripción.</p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
              >
                Entendido — Ver en Mis Cursos
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row gap-8 mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[#0f172a] mb-4 pr-8">{title}</h2>
                  <Badge available={available} />
                  
                  <p className="text-[#64748b] text-sm leading-relaxed mb-6 mt-4">
                    {description}
                  </p>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-sm text-[#64748b]">
                      <Clock size={16} className="text-[#94a3b8] shrink-0" /> {days} | {time}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#64748b]">
                      <Calendar size={16} className="text-[#94a3b8] shrink-0" /> Duración total del periodo vacacional
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#64748b]">
                      <Users size={16} className="text-[#94a3b8] shrink-0" /> {enrolled} Inscritos de {capacity} cupos totales
                    </div>
                  </div>
                </div>

                {/* Instructor Card */}
                <div className="md:w-[200px] shrink-0">
                  <div className="bg-[#0f172a] rounded-xl p-5 text-center text-white shadow-lg">
                    <div className="w-12 h-12 bg-[#22c55e] rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
                      {initial}
                    </div>
                    <div className="text-[10px] text-[#22c55e] font-bold tracking-wider mb-1 uppercase">Instructor</div>
                    <div className="font-bold mb-2 text-sm">{professorName}</div>
                    <p className="text-[#94a3b8] text-[11px] leading-relaxed">
                      Profesional experto con años de experiencia impartiendo la materia.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 mb-6">
                <h4 className="text-xs font-bold text-[#64748b] mb-4 uppercase tracking-wider">Resumen de Pago</h4>
                <div className="flex justify-between text-sm text-[#64748b] mb-2">
                  <span>Precio original del curso</span>
                  <span>$ {price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-[#22c55e] font-medium mb-2">
                  <span>Descuento Especial Beca (15%)</span>
                  <span>-$ {discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-[#64748b] mb-4">
                  <span>Impuestos Nacionales (12%)</span>
                  <span>$ {taxes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-[#e2e8f0] pt-3">
                  <span className="font-bold text-[#0f172a]">Total a Pagar</span>
                  <span className="font-bold text-lg text-[#0f172a]">$ US$ {total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-xs text-[#0f172a] font-medium mb-3 block">Selecciona método de pago:</label>
                <div className="flex gap-2 bg-white p-1 rounded-lg border border-[#e2e8f0]">
                  <button
                    onClick={() => setPaymentMethod("stripe")}
                    className={`flex-1 font-medium text-xs py-2.5 rounded-md transition-all ${
                      paymentMethod === "stripe"
                        ? "bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]"
                        : "text-[#64748b] hover:bg-[#f8fafc]"
                    }`}
                  >
                    Tarjeta (Stripe)
                  </button>
                  <button
                    onClick={() => setPaymentMethod("manual")}
                    className={`flex-1 font-medium text-xs py-2.5 rounded-md transition-all ${
                      paymentMethod === "manual"
                        ? "bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]"
                        : "text-[#64748b] hover:bg-[#f8fafc]"
                    }`}
                  >
                    Transferencia / Efectivo
                  </button>
                </div>
              </div>

              {payError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
                  {payError}
                </div>
              )}

              <button
                onClick={course.isEnrolled ? null : handleInscribirse}
                disabled={loadingPay || course.isEnrolled}
                className={`w-full font-medium py-3 rounded-xl transition-all flex justify-center items-center gap-2 ${
                  course.isEnrolled
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-60 disabled:cursor-not-allowed text-white"
                }`}
              >
                {loadingPay ? <Loader2 size={18} className="animate-spin" /> : null}
                {course.isEnrolled ? "Ya estás inscrito" : loadingPay ? (paymentMethod === 'stripe' ? 'Redirigiendo a Stripe...' : 'Registrando inscripción...') : "Inscribirse →"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Catalog() {
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [search, setSearch] = useState("");
  const [scheduleFilter, setScheduleFilter] = useState("all"); // 'all', 'Mañana', 'Tarde', 'Noche'
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await courseService.getAll();
        
        let enrolled = new Set();
        if (isAuthenticated) {
           try {
             const myPayments = await paymentService.getMyPayments();
             myPayments.forEach(p => {
               // Ocultar cursos pagados Y pendientes de confirmación
               if ((p.estado === 'paid' || p.estado === 'pending') && p.inscripcion?.curso?._id) {
                 enrolled.add(p.inscripcion.curso._id);
               }
             });
           } catch (e) {
             console.error("Error loading user payments", e);
           }
        }

        if (!cancelled) {
          setCourses(Array.isArray(data) ? data : []);
          setEnrolledCourseIds(enrolled);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const getScheduleTag = (horaInicio) => {
    if (!horaInicio) return "Mañana";
    const hour = parseInt(horaInicio.split(":")[0], 10);
    if (isNaN(hour)) return "Mañana";
    if (hour < 12) return "Mañana";
    if (hour < 18) return "Tarde";
    return "Noche";
  };

  const filteredCourses = courses.filter((c) => {
    // Ocultar cursos en los que el usuario ya está inscrito
    const courseId = c._id || c.id;
    if (isAuthenticated && enrolledCourseIds.has(courseId)) return false;

    const title = (c.titulo || c.title || "").toLowerCase();
    const instructor = (c.instructor?.nombre || "").toLowerCase();
    const matchesSearch = title.includes(search.toLowerCase()) || instructor.includes(search.toLowerCase());

    const schedule = getScheduleTag(c.horaInicio);
    const matchesSchedule = scheduleFilter === "all" || schedule === scheduleFilter;

    const available = (c.capacidad ?? 20) - (c.inscritos ?? 0);
    const matchesAvailability = !onlyAvailable || available > 0;

    return matchesSearch && matchesSchedule && matchesAvailability;
  });

  return (
    <div className="p-6 md:p-8 pb-[80px] md:pb-6 max-w-[1200px] w-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[2rem] font-semibold text-[#0f172a] mb-2">Catálogo de Cursos</h1>
          <p className="text-[#64748b] text-[0.95rem]">Elige tu curso, inscríbete y empieza tu vacación productiva</p>
        </div>
        <div className="hidden sm:flex bg-[#0f172a] text-white px-4 py-2 rounded-lg text-sm font-medium items-center gap-2">
          <span className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse" /> {filteredCourses.length} cursos disponibles
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-4 justify-between items-center bg-white p-3 rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] mb-8">
        <div className="flex items-center gap-2 text-[#64748b] flex-1 min-w-[220px] max-w-[320px] bg-[#f8fafc] px-4 py-2 rounded-lg border border-slate-200">
          <Search size={18} className="shrink-0 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar curso o instructor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 bg-transparent outline-none w-full text-sm text-[#1e293b] placeholder:text-[#94a3b8]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setScheduleFilter("all")}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              scheduleFilter === "all" ? "bg-[#16a34a] text-white" : "bg-[#f8fafc] text-[#64748b] hover:bg-slate-100"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setScheduleFilter("Mañana")}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors ${
              scheduleFilter === "Mañana" ? "bg-[#16a34a] text-white" : "bg-[#f8fafc] text-[#64748b] hover:bg-slate-100"
            }`}
          >
            <Sun size={14} /> Mañana
          </button>
          <button
            onClick={() => setScheduleFilter("Tarde")}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors ${
              scheduleFilter === "Tarde" ? "bg-[#16a34a] text-white" : "bg-[#f8fafc] text-[#64748b] hover:bg-slate-100"
            }`}
          >
            <Sunset size={14} /> Tarde
          </button>
          <button
            onClick={() => setScheduleFilter("Noche")}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors ${
              scheduleFilter === "Noche" ? "bg-[#16a34a] text-white" : "bg-[#f8fafc] text-[#64748b] hover:bg-slate-100"
            }`}
          >
            <Moon size={14} /> Noche
          </button>
          <div className="w-[1px] h-6 bg-[#e2e8f0] mx-2 hidden sm:block" />
          <label className="flex items-center gap-2 text-sm text-[#64748b] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="accent-[#16a34a]"
            />
            Solo con cupos
          </label>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <Loader2 className="animate-spin mx-auto text-[#16a34a] mb-2" size={32} />
          <p className="text-sm">Cargando cursos desde la base de datos...</p>
        </div>
      ) : error ? (
        <div className="py-12 bg-red-50 text-red-600 rounded-xl p-6 text-center border border-red-200">
          <p className="font-semibold">Error al cargar cursos</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-xl shadow-sm border border-slate-100">
          <p className="text-slate-600 font-medium">No se encontraron cursos que coincidan con los filtros.</p>
          <p className="text-slate-400 text-sm mt-1">Prueba cambiando la búsqueda o quitando filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const title = course.titulo || course.title || "Sin título";
            const description = course.descripcion || "Sin descripción disponible.";
            const professorName = course.instructor?.nombre || "Sin asignar";
            const days = Array.isArray(course.diasSemana) ? course.diasSemana.join(", ") : course.diasSemana || "Por definir";
            const time = course.horaInicio && course.horaFin ? `${course.horaInicio} - ${course.horaFin}` : "Por definir";
            const enrolled = course.inscritos ?? 0;
            const capacity = course.capacidad ?? 20;
            const available = capacity - enrolled;
            const price = Number(course.precio ?? 0);
            const initial = professorName.charAt(0).toUpperCase();

            const isEnrolled = enrolledCourseIds.has(course._id || course.id);

            return (
              <div
                key={course._id || course.id}
                onClick={() => setSelectedCourse({ ...course, isEnrolled })}
                className="bg-white rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] p-6 relative border-t-4 border-[#16a34a] flex flex-col hover:-translate-y-1 hover:shadow-[0_15px_25px_-5px_rgba(0,0,0,0.1)] transition-all duration-200 cursor-pointer"
              >
                <Badge available={available} />
                <h3 className="text-[1.15rem] font-semibold leading-snug mb-3 text-[#0f172a] line-clamp-2">{title}</h3>

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-[#e0e7ff] text-[#16a34a] flex items-center justify-center text-xs font-bold shrink-0">
                    {initial}
                  </div>
                  <span className="text-sm text-[#64748b] font-medium truncate">{professorName}</span>
                </div>

                <p className="text-sm text-[#64748b] leading-relaxed mb-6 line-clamp-2">{description}</p>

                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex items-center gap-2 text-xs text-[#64748b]">
                    <Calendar size={14} className="text-[#94a3b8] shrink-0" /> {days}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#64748b]">
                    <Clock size={14} className="text-[#94a3b8] shrink-0" /> {time}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#64748b]">
                    <Users size={14} className="text-[#94a3b8] shrink-0" /> {enrolled}/{capacity} inscritos
                  </div>
                </div>

                <div className="mt-auto flex justify-between items-center pt-4 border-t border-[#f1f5f9]">
                  <span className="text-[1.1rem] font-bold text-[#16a34a]">$ US$ {price.toFixed(2)}</span>
                  {isEnrolled ? (
                    <span className="text-slate-400 font-semibold text-sm flex items-center gap-1">
                      Inscrito
                    </span>
                  ) : (
                    <span className="text-[#16a34a] font-semibold text-sm flex items-center gap-1">
                      Ver detalle <ChevronRight size={14} />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Modal Render */}
      {selectedCourse && (
        <CourseModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />
      )}
    </div>
  );
}
