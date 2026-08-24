import { Home, BookOpen, GraduationCap, CreditCard, User, HelpCircle, LogOut, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../hooks/useAuthStore.js";

/**
 * Navbar lateral con curva mágica — réplica visual de App.css .navigation
 * Solo vista, sin consultas. Usa Tailwind + estilos inline para la curva (box-shadow trick)
 * Desktop: 70px -> 250px hover, curva en active
 * Mobile: barra inferior fija 60px
 */
const navItems = [
  { label: "Inicio", icon: Home, to: "/" },
  { label: "Catálogo", icon: BookOpen, to: "/catalog" },
  { label: "Mis Cursos", icon: GraduationCap, to: "/mis-cursos" },
  { label: "Pagos", icon: CreditCard, to: "/pagos" },
  { label: "Mi Perfil", icon: User, to: "/perfil" },
  { label: "Ayuda", icon: HelpCircle, to: "/ayuda" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex relative h-[calc(100vh-40px)] bg-[#0f172a] rounded-[20px] flex-col justify-center z-[1000] shadow-[0_10px_25px_rgba(15,23,42,0.2)] w-[70px] hover:w-[250px] transition-all duration-300 ease-in-out m-5 group overflow-visible shrink-0">
        <ul className="flex flex-col w-full py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <li
                key={item.to}
                className={`relative w-full list-none rounded-l-[30px] ${active ? "bg-[#f8fafc] text-[#0f172a]" : "text-white hover:bg-white/10"} `}
              >
                {/* curva superior */}
                {active && (
                  <>
                    <span className="hidden group-hover:block absolute -top-[30px] right-0 w-[30px] h-[30px] bg-transparent rounded-full shadow-[15px_15px_0_#f8fafc] pointer-events-none" />
                    <span className="hidden group-hover:block absolute -bottom-[30px] right-0 w-[30px] h-[30px] bg-transparent rounded-full shadow-[15px_-15px_0_#f8fafc] pointer-events-none" />
                  </>
                )}
                <button
                  onClick={() => navigate(item.to)}
                  className={`relative flex items-center w-full text-left py-0 px-0 transition-colors ${active ? "text-[#0f172a]" : "text-white"}`}
                >
                  <span className="flex justify-center items-center min-w-[70px] h-[60px] shrink-0">
                    <Icon size={22} />
                  </span>
                  <span className="flex items-center h-[60px] px-2.5 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 font-medium text-[15px]">
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}

          {/* Separador + logout al final */}
          <li className="relative w-full list-none mt-auto">
            <button
              onClick={handleLogout}
              className="relative flex items-center w-full text-white hover:text-[#f87171] transition-colors"
            >
              <span className="flex justify-center items-center min-w-[70px] h-[60px]">
                <LogOut size={22} />
              </span>
              <span className="flex items-center h-[60px] px-2.5 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 font-bold text-[15px]">
                Cerrar Sesión
              </span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-[#0f172a] flex flex-row items-center justify-around z-[1000] shadow-[0_-4px_12px_rgba(0,0,0,0.15)]">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg ${active ? "text-[#22c55e]" : "text-white/70"}`}
            >
              <Icon size={22} />
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            </button>
          );
        })}
        <button onClick={handleLogout} className="flex flex-col items-center justify-center p-2 text-white/70">
          <LogOut size={22} />
          <span className="text-[10px] mt-0.5">Salir</span>
        </button>
      </nav>
    </>
  );
}
