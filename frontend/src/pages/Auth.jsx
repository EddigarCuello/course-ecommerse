import { useState } from "react";
import { Share2, Globe, Code, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../hooks/useAuthStore.js";

/**
 * Pantalla Auth migrada desde VACACIONALPAG/src/features/auth/pages/Auth.jsx
 * Tailwind: todo el CSS de Auth.css migrado a clases utilitarias (sin archivo css)
 * Visual idéntico — gradiente, animaciones y dimensiones preservadas
 * Backend Prime: POST /api/auth/register { nombre, email, password } y POST /api/auth/login
 */
export default function Auth() {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();
  const { register, login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const emailTrimmed = email.trim().toLowerCase();
    const nombreTrimmed = name.trim();
    if (!nombreTrimmed || !emailTrimmed || !password) {
      showToast("error", "Todos los campos son obligatorios");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      showToast("error", "La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }
    try {
      await register({ nombre: nombreTrimmed, email: emailTrimmed, password });
      showToast("success", "Registro completado. Ya puedes iniciar sesión.");
      setIsRightPanelActive(false);
    } catch (err) {
      showToast("error", err.message || "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed || !password) {
      showToast("error", "Email y contraseña son obligatorios");
      setLoading(false);
      return;
    }
    try {
      await login({ email: emailTrimmed, password });
      showToast("success", "Inicio de sesión exitoso");
      navigate("/");
    } catch (err) {
      const msg = err.status === 401 ? "Credenciales inválidas" : err.message || "Error al iniciar sesión";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  // Clases base replicando Auth.css
  const wrapperCls =
    "bg-[#eef2f6] flex justify-center items-center flex-col font-['Montserrat',sans-serif] h-screen w-screen box-border absolute top-0 left-0 z-[1000]";
  const containerCls =
    "bg-white rounded-[20px] shadow-[0_14px_28px_rgba(0,0,0,0.1),0_10px_10px_rgba(0,0,0,0.05)] relative overflow-hidden w-[900px] max-w-[95%] min-h-[550px]";
  const formContainerBase =
    "absolute top-0 h-full transition-all duration-[600ms] ease-in-out";
  const signInCls = `${formContainerBase} left-0 w-1/2 z-[2] ${isRightPanelActive ? "translate-x-full" : "translate-x-0"}`;
  const signUpCls = `${formContainerBase} left-0 w-1/2 z-[1] ${isRightPanelActive ? "translate-x-full opacity-100 z-[5]" : "opacity-0 z-[1]"}`;
  const overlayContainerCls = `absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-[600ms] ease-in-out z-[100] ${isRightPanelActive ? "-translate-x-full" : "translate-x-0"}`;
  const overlayCls = `bg-gradient-to-br from-[#16a34a] to-[#22c55e] text-white relative left-[-100%] h-full w-[200%] transition-transform duration-[600ms] ease-in-out ${isRightPanelActive ? "translate-x-[50%]" : "translate-x-0"}`;
  const overlayPanelBase =
    "absolute flex items-center justify-center flex-col px-10 text-center top-0 h-full w-1/2 transition-transform duration-[600ms] ease-in-out";
  const overlayLeftCls = `${overlayPanelBase} ${isRightPanelActive ? "translate-x-0" : "-translate-x-[20%]"}`;
  const overlayRightCls = `${overlayPanelBase} right-0 ${isRightPanelActive ? "translate-x-[20%]" : "translate-x-0"}`;

  const h1Cls = "font-bold m-0 text-[#1e293b] text-[1.8rem] mb-[5px]";
  const h1WhiteCls = "font-bold m-0 text-white text-[1.8rem] mb-[5px]";
  const pCls = "text-[14px] font-normal leading-[20px] tracking-[0.5px] my-5 mb-[30px] max-w-[80%]";
  const spanCls = "text-[13px] text-[#64748b] mb-5";
  const linkCls = "text-[#64748b] text-[13px] no-underline my-[15px] transition-colors duration-300 hover:text-[#16a34a]";
  const inputCls =
    "bg-[#f1f5f9] border-0 py-[14px] px-[15px] my-2 w-full rounded-lg outline-none text-[#334155] font-inherit transition-all duration-300 focus:bg-[#e2e8f0] focus:shadow-[0_0_0_2px_rgba(22,163,74,0.2)]";
  const btnBase =
    "rounded-[25px] border border-[#16a34a] bg-[#16a34a] text-white text-xs font-bold py-3 px-[45px] tracking-[1px] uppercase transition-all duration-150 ease-in mt-2.5 cursor-pointer active:scale-[0.95] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none focus:outline-none";
  const btnGhost = "bg-transparent border-white text-white hover:bg-white/10";
  const socialContainerCls = "my-[15px] flex gap-3";
  const socialLinkCls =
    "border border-[#e2e8f0] rounded-full inline-flex justify-center items-center h-[42px] w-[42px] text-[#334155] transition-all duration-300 m-0 hover:bg-[#f1f5f9] hover:border-[#cbd5e1] hover:text-[#16a34a]";

  return (
    <div className={wrapperCls}>
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[9999] py-3 px-[18px] rounded-lg text-white text-sm max-w-[360px] shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${toast.type === "success" ? "bg-[#16a34a]" : "bg-[#dc2626]"}`}
        >
          {toast.message}
        </div>
      )}

      <div className={containerCls} id="container">
        {/* Register */}
        <div
          className={signUpCls}
          style={isRightPanelActive ? { animation: "show 0.6s" } : undefined}
        >
          <form
            onSubmit={handleSignUp}
            className="bg-white flex items-center justify-center flex-col px-[50px] h-full text-center"
          >
            <h1 className={h1Cls}>Crear Cuenta</h1>
            <div className={socialContainerCls}>
              <a href="#" className={socialLinkCls} onClick={(e) => e.preventDefault()}>
                <Share2 size={20} />
              </a>
              <a href="#" className={socialLinkCls} onClick={(e) => e.preventDefault()}>
                <Globe size={20} />
              </a>
              <a href="#" className={socialLinkCls} onClick={(e) => e.preventDefault()}>
                <Code size={20} />
              </a>
              <a href="#" className={socialLinkCls} onClick={(e) => e.preventDefault()}>
                <Briefcase size={20} />
              </a>
            </div>
            <span className={spanCls}>o usa tu correo para registrarte</span>
            <input type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
            <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              autoComplete="new-password"
              required
              className={inputCls}
            />
            <button type="submit" disabled={loading} className={btnBase}>
              {loading ? "CARGANDO..." : "REGISTRARSE"}
            </button>
          </form>
        </div>

        {/* Login */}
        <div className={signInCls}>
          <form
            onSubmit={handleSignIn}
            className="bg-white flex items-center justify-center flex-col px-[50px] h-full text-center"
          >
            <h1 className={h1Cls}>Iniciar Sesión</h1>
            <div className={socialContainerCls}>
              <a href="#" className={socialLinkCls} onClick={(e) => e.preventDefault()}>
                <Share2 size={20} />
              </a>
              <a href="#" className={socialLinkCls} onClick={(e) => e.preventDefault()}>
                <Globe size={20} />
              </a>
              <a href="#" className={socialLinkCls} onClick={(e) => e.preventDefault()}>
                <Code size={20} />
              </a>
              <a href="#" className={socialLinkCls} onClick={(e) => e.preventDefault()}>
                <Briefcase size={20} />
              </a>
            </div>
            <span className={spanCls}>o usa tu cuenta con correo y contraseña</span>
            <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className={inputCls}
            />
            <a href="#" className={linkCls}>
              ¿Olvidaste tu contraseña?
            </a>
            <button type="submit" disabled={loading} className={btnBase}>
              {loading ? "CARGANDO..." : "INGRESAR"}
            </button>
          </form>
        </div>

        {/* Overlay */}
        <div className={overlayContainerCls}>
          <div className={overlayCls}>
            <div className={overlayLeftCls}>
              <h1 className={h1WhiteCls}>¡Bienvenido de nuevo!</h1>
              <p className={pCls}>Para mantenerte conectado con nosotros, por favor inicia sesión con tu información personal</p>
              <button type="button" onClick={() => setIsRightPanelActive(false)} className={`${btnBase} ${btnGhost}`}>
                INICIAR SESIÓN
              </button>
            </div>
            <div className={overlayRightCls}>
              <h1 className={h1WhiteCls}>¡Hola, Amigo!</h1>
              <p className={pCls}>Introduce tus datos personales y comienza tu viaje con nosotros</p>
              <button type="button" onClick={() => setIsRightPanelActive(true)} className={`${btnBase} ${btnGhost}`}>
                REGISTRARSE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
