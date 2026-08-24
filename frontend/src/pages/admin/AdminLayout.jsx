import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, BookOpen, ClipboardList, LogOut, GraduationCap, ChevronRight } from "lucide-react";
import { useAuthStore } from "../../hooks/useAuthStore.js";

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/courses", label: "Cursos", icon: BookOpen },
  { to: "/admin/instructors", label: "Instructores", icon: Users },
  { to: "/admin/enrollments", label: "Inscripciones", icon: ClipboardList },
];

export default function AdminLayout({ logo }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const avatarUrl = logo || user?.avatarUrl;

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex bg-[#0f172a] font-['Montserrat',sans-serif]">
      {/* Sidebar admin — replica VACACIONALPAG AdminLayout.jsx */}
      <aside className="w-64 shrink-0 bg-[#0f172a] border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-lg bg-gradient-to-br from-green-500 to-purple-600 shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Admin logo" className="w-full h-full object-cover" />
              ) : (
                <GraduationCap size={18} className="text-white" />
              )}
            </div>
            <div>
              <p className="text-white font-bold text-sm m-0 leading-none">Admin Panel</p>
              <p className="text-slate-400 text-xs m-0">Prime Cursos</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto space-y-1">
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium no-underline transition-all ${
                    isActive ? "bg-[#16a34a] text-white shadow-lg shadow-green-900/30" : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} className={isActive ? "text-white" : "text-slate-500"} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight size={14} className="text-green-200" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <GraduationCap size={18} className="text-slate-500" />
            Volver a la App
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Mobile top bar para admin */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-green-500 to-purple-600 shrink-0">
            {avatarUrl ? <img src={avatarUrl} alt="Admin logo" className="w-full h-full object-cover" /> : <GraduationCap size={14} className="text-white" />}
          </div>
          <span className="text-white font-bold text-sm">Admin Panel</span>
        </div>
        <div className="flex gap-1">
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `p-2 rounded-lg ${isActive ? "bg-[#16a34a] text-white" : "text-slate-400"}`}>
                <Icon size={18} />
              </NavLink>
            );
          })}
        </div>
      </div>

      <main className="flex-1 overflow-auto bg-[#0f172a] md:bg-[#020617] pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
