import { useState } from "react";
import { User, Mail, BookOpen, Clock, Phone, Globe, MapPin, AlignLeft, CheckCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "../hooks/useAuthStore";
import { userService } from "../services/user.service";

export default function Profile() {
  const user = useAuthStore((s) => s.user);

  const [formData, setFormData] = useState({
    nombre: user?.nombre || user?.name || "",
    telefono: user?.telefono || "",
    pais: user?.pais || "",
    ciudad: user?.ciudad || "",
    idiomaPreferido: user?.idiomaPreferido || "Español",
    bio: user?.bio || "",
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const profileName = user?.nombre || user?.name || "Usuario Prime";
  const profileEmail = user?.email || "usuario@ejemplo.com";
  const initial = profileName.charAt(0).toUpperCase();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const userId = user?._id || user?.id;
      if (!userId) {
        throw new Error("No se pudo identificar tu ID de usuario.");
      }

      const updated = await userService.update(userId, formData);
      
      // Actualizar el estado global del usuario
      useAuthStore.setState((prev) => ({
        user: { ...prev.user, ...(updated.data || updated) },
      }));

      setSuccessMsg("¡Perfil actualizado con éxito!");
    } catch (err) {
      setErrorMsg(err.message || "Error al actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto w-full animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f172a]">Mi Perfil</h1>
        <p className="text-[#64748b] text-sm mt-1">Gestiona tu información personal y académica</p>
      </div>

      {successMsg && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium animate-fade-in">
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in">
          {errorMsg}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Profile Card */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
            <div className="h-32 bg-emerald-500 w-full relative">
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-white rounded-2xl p-1 shadow-sm">
                <div className="w-full h-full bg-emerald-50 rounded-xl flex items-center justify-center text-3xl font-bold text-emerald-600">
                  {initial}
                </div>
              </div>
            </div>
            
            <div className="pt-16 pb-6 px-6 text-center">
              <h2 className="text-lg font-bold text-[#0f172a] uppercase">{profileName}</h2>
              <p className="text-[#64748b] text-sm mt-1">{profileEmail}</p>
              
              <div className="h-px bg-slate-100 w-full my-6"></div>
              
              <div className="flex flex-col gap-3 text-left">
                <div className="flex items-center gap-3 text-sm text-[#64748b]">
                  <BookOpen size={18} className="text-emerald-500" />
                  <span className="capitalize">{user?.rol || "Estudiante Regular"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#64748b]">
                  <Clock size={18} className="text-emerald-500" />
                  <span>Miembro Activo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          
          {/* Datos Personales */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <User size={20} className="text-emerald-500" />
              <h3 className="text-lg font-bold text-emerald-500">Datos Personales</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                    Nombre Completo
                  </label>
                  <input 
                    type="text" 
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                    Correo Electrónico
                  </label>
                  <input 
                    type="email" 
                    value={profileEmail}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-[#64748b] cursor-not-allowed focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider flex items-center gap-1.5">
                    <Phone size={12} /> Teléfono
                  </label>
                  <input 
                    type="tel" 
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="Ej. +57 300 123 4567"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider flex items-center gap-1.5">
                    <Globe size={12} /> Idioma
                  </label>
                  <select 
                    name="idiomaPreferido"
                    value={formData.idiomaPreferido}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  >
                    <option value="Español">Español</option>
                    <option value="Inglés">Inglés</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={12} /> País
                  </label>
                  <input 
                    type="text" 
                    name="pais"
                    value={formData.pais}
                    onChange={handleChange}
                    placeholder="Ej. Colombia"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={12} /> Ciudad
                  </label>
                  <input 
                    type="text" 
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                    placeholder="Ej. Valledupar"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider flex items-center gap-1.5">
                  <AlignLeft size={12} /> Biografía
                </label>
                <textarea 
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Cuéntanos un poco sobre ti..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end mt-4">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>

          {/* Preferencias de Contacto */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Mail size={20} className="text-emerald-500" />
              <h3 className="text-lg font-bold text-emerald-500">Preferencias de Contacto</h3>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-[#0f172a] text-sm">Notificaciones de Cursos</h4>
                  <p className="text-[#94a3b8] text-xs mt-0.5">Recibe avisos sobre nuevos vacacionales</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-[#0f172a] text-sm">Avisos de Pago</h4>
                  <p className="text-[#94a3b8] text-xs mt-0.5">Alertas sobre vencimientos de facturas</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
