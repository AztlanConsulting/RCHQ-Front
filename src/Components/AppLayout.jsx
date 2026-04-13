import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logoutService } from "../Services/AuthService";
import Button from "../Components/Atoms/Button";

const navLinkClass = ({ isActive }) =>
  `block rounded px-3 py-2 text-sm ${
    isActive ? "bg-slate-700 text-white" : "text-black"
  }`;

export default function AppLayout() {
  const navigate = useNavigate();

  const logout = () => {
    logoutService();

    navigate("/login");
  };

  return (
    <div className="flex min-h-screen text-slate-100">
      <aside className="w-52 shrink-0 border-r border-slate-800 p-4">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Menú
        </p>
        <nav className="flex flex-col h-full justify-between gap-1">
          <div>
            <NavLink to="/app/dashboard" className={navLinkClass} end>
              Dashboard
            </NavLink>
            <NavLink to="/app/casas" className={navLinkClass}>
              Casas
            </NavLink>
            <NavLink to="/app/personal" className={navLinkClass}>
              Personal
            </NavLink>
            <NavLink to="/app/calendario" className={navLinkClass}>
              Calendario
            </NavLink>
            <NavLink to="/app/perfil" className={navLinkClass}>
              Perfil
            </NavLink>
          </div>

          <div>
            <Button onClick={logout} className="mb-6">
              Logout
            </Button>
          </div>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
