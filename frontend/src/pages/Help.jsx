import { MessageSquare, FileText, Ticket, HelpCircle, Play, ChevronDown } from "lucide-react";

export default function Help() {
  const faqs = [
    "¿Cómo me inscribo a un curso?",
    "¿Qué métodos de pago aceptan?",
    "¿Cuándo empiezan las clases?",
    "¿Cómo descargo mi certificado?"
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto w-full animate-fade-in">
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
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm w-full max-w-[200px]">
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

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* FAQs List */}
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

        {/* Video Guides */}
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
