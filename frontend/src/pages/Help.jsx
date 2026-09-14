import { useState } from "react";
import { MessageSquare, FileText, Ticket, HelpCircle, Play, ChevronDown, Send, X, Bot, User } from "lucide-react";
import { useAuthStore } from "../hooks/useAuthStore";

export default function Help() {
  const user = useAuthStore((s) => s.user);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: `¡Hola ${user?.nombre || user?.name || "estudiante"}! 👋 Bienvenido al soporte de Prime. ¿En qué podemos ayudarte hoy?` }
  ]);
  const [inputMsg, setInputMsg] = useState("");

  const faqs = [
    "¿Cómo me inscribo a un curso?",
    "¿Qué métodos de pago aceptan?",
    "¿Cuándo empiezan las clases?",
    "¿Cómo descargo mi certificado?"
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setInputMsg("");

    // Respuesta automática simulada del soporte
    setTimeout(() => {
      let botReply = "Gracias por escribirnos. Un agente de soporte revisará tu consulta a la brevedad.";
      const lower = userText.toLowerCase();
      if (lower.includes("pago") || lower.includes("precio") || lower.includes("efectivo")) {
        botReply = "Para realizar un pago en efectivo o transferencia, selecciona la opción al inscribirte en un curso y sube tu comprobante desde Mis Cursos.";
      } else if (lower.includes("curso") || lower.includes("catalogo") || lower.includes("inscrip")) {
        botReply = "Puedes explorar todos los cursos disponibles en el Catálogo e inscribirte con 1 clic.";
      } else if (lower.includes("hola") || lower.includes("buenas")) {
        botReply = "¡Hola! ¿Deseas consultar sobre inscripciones, certificados o métodos de pago?";
      }

      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    }, 800);
  };

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto w-full animate-fade-in relative">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f172a]">Centro de Ayuda</h1>
        <p className="text-[#64748b] text-sm mt-1">¿En qué podemos ayudarte hoy?</p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Chat */}
        <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
            <MessageSquare size={24} />
          </div>
          <h3 className="font-bold text-[#0f172a] mb-2">Chatea con Soporte</h3>
          <p className="text-[#94a3b8] text-sm mb-6 flex-grow">
            Nuestro equipo está listo para ayudarte en tiempo real
          </p>
          <button 
            onClick={() => setChatOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm w-full max-w-[200px]"
          >
            Iniciar Chat
          </button>
        </div>

        {/* FAQs */}
        <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
            <FileText size={24} />
          </div>
          <h3 className="font-bold text-[#0f172a] mb-2">Preguntas Frecuentes</h3>
          <p className="text-[#94a3b8] text-sm mb-6 flex-grow">
            Revisa nuestra base de conocimientos
          </p>
          <button className="bg-slate-50 hover:bg-slate-100 text-[#64748b] font-medium px-6 py-2.5 rounded-lg border border-slate-200 transition-colors text-sm w-full max-w-[200px]">
            Ver Artículos
          </button>
        </div>

        {/* Ticket */}
        <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
            <Ticket size={24} />
          </div>
          <h3 className="font-bold text-[#0f172a] mb-2">Crear un Ticket</h3>
          <p className="text-[#94a3b8] text-sm mb-6 flex-grow">
            Envía una solicitud detallada a nuestro equipo
          </p>
          <button className="bg-slate-50 hover:bg-slate-100 text-[#64748b] font-medium px-6 py-2.5 rounded-lg border border-slate-200 transition-colors text-sm w-full max-w-[200px]">
            Crear Ticket
          </button>
        </div>
      </div>

      {/* Modal de Chat de Soporte */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-[500px] h-[550px] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            {/* Header del Chat */}
            <div className="bg-[#0f172a] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Soporte en Vivo — Prime</h3>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping inline-block" /> En línea
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setChatOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mensajes */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
              {messages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-2 text-sm ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.sender === "bot" && (
                    <div className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center shrink-0 mt-1">
                      <Bot size={14} />
                    </div>
                  )}
                  <div 
                    className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                      m.sender === "user" 
                        ? "bg-emerald-600 text-white rounded-tr-none" 
                        : "bg-white text-[#0f172a] border border-slate-200 shadow-sm rounded-tl-none"
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.sender === "user" && (
                    <div className="w-7 h-7 bg-slate-800 text-white rounded-full flex items-center justify-center shrink-0 mt-1">
                      <User size={14} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input para enviar mensaje */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
              <input 
                type="text" 
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button 
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 rounded-xl transition-colors shrink-0"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle size={18} className="text-emerald-500" />
            <h3 className="font-bold text-[#0f172a]">Preguntas más populares</h3>
          </div>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-white border border-[#e2e8f0] rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-emerald-200 hover:shadow-sm transition-all group"
              >
                <span className="text-[#0f172a] text-sm font-medium">{faq}</span>
                <ChevronDown size={18} className="text-[#94a3b8] group-hover:text-emerald-500 transition-colors" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Play size={18} className="text-red-400" />
            <h3 className="font-bold text-[#0f172a]">Guías en video</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div 
                key={item}
                className="bg-[#e2e8f0] rounded-xl aspect-[16/9] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity relative group"
              >
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Play size={18} className="text-red-500 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
