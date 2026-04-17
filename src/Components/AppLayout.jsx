import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Button from "../Components/Atoms/Button";
import useAuth from "../hooks/useAuth";

const navLinkClass = ({ isActive }) =>
  `block rounded px-3 py-2 text-sm ${isActive ? "bg-slate-700 text-white" : "text-black"
  }`;

export default function AppLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen text-slate-100">
      <aside className="w-52 shrink-0 border-r border-slate-800 p-4">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Menú
        </p>

        <nav className="flex h-full flex-col justify-between gap-1">
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

          <div className="mb-6">
            <Button
              text="Cerrar sesión"
              type="button"
              onClick={handleLogout}
              bgColor="bg-red-600"
              textColor="text-white"
              hoverColor="hover:bg-red-700"
              activeColor="active:bg-red-800"
              fullWidth={true}
            />
          </div>
        </nav>
      </aside>

      <main className="min-w-0 flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}