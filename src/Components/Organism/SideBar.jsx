import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useSideBar from "../../hooks/Organism/useSideBar";
import ExpandIcon from "../Atoms/Icons/ExpandIcon";
import CalendarIcon from "../Atoms/Icons/CalendarIcon";
import PersonalIcon from "../Atoms/Icons/PersonalIcon";
import HouseIcon from "../Atoms/Icons/HouseIcon";
import VacationsIcon from "../Atoms/Icons/VacationsIcon";
import AbsencesIcon from "../Atoms/Icons/AbsencesIcon";
import DonationsIcon from "../Atoms/Icons/DonationsIcon";
import ProfileIcon from "../Atoms/Icons/ProfileIcon";
import LogoutIcon from "../Atoms/Icons/LogoutIcon";

const NAV_ITEMS = [
  { to: "/app/calendario", label: "Calendario", Icon: CalendarIcon },
  { to: "/app/personal", label: "Personal", Icon: PersonalIcon },
  { to: "/app/casas", label: "Casas Hogares", Icon: HouseIcon },
  { to: "/app/vacaciones", label: "Vacaciones", Icon: VacationsIcon },
  { to: "/app/ausencias", label: "Ausencias", Icon: AbsencesIcon },
  { to: "/app/donaciones", label: "Donaciones", Icon: DonationsIcon },
];

const NavItem = ({ to, label, Icon, expanded }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 rounded-lg px-3 py-3 transition-colors
      ${expanded ? "" : "justify-center"}
      ${isActive
        ? "bg-[#1F5ACD] text-[#FAFAFA]"
        : "text-[#FAFAFA] hover:bg-[#FAFAFA]/10"
      }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-[#FAFAFA]" : "text-[#FAFAFA]/70"}`} />
        {expanded && (
          <span className="text-xl font-bold font-[\'Public_Sans\'] whitespace-nowrap">
            {label}
          </span>
        )}
      </>
    )}
  </NavLink>
);

const SidebarContent = ({ expanded, toggle, onClose, isMobile }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/iniciar-sesion", { replace: true });
  };

  return (
    <aside
      className={`
        flex flex-col h-full bg-[#1F3664] rounded-lg
        shadow-[0_0_8px_0_rgba(0,0,0,1)]
        transition-all duration-300
        ${isMobile ? "w-[390px] max-w-[85vw]" : expanded ? "w-[390px]" : "w-20"}
      `}
    >
      {/* Header: expand button + brand */}
      <div className={`flex items-center h-16 px-4 gap-4 ${expanded || isMobile ? "" : "justify-center"}`}>
        <button
          onClick={isMobile ? onClose : toggle}
          className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[#FAFAFA]/10 transition-colors shrink-0"
        >
          <ExpandIcon
            className={`h-5 w-5 text-[#FAFAFA] transition-transform duration-300 ${expanded || isMobile ? "rotate-180" : ""}`}
          />
        </button>
        {(expanded || isMobile) && (
          <span className="text-[#FAFAFA] text-xl font-bold font-['Public_Sans'] whitespace-nowrap">
            TOCHAN R.H.
          </span>
        )}
      </div>

      {/* Divider */}
      {(expanded || isMobile) && (
        <div className="h-px bg-[#FAFAFA]/25 mx-4" />
      )}

      {/* Nav items */}
      <nav className="flex flex-col gap-1 flex-1 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.to}
            {...item}
            expanded={expanded || isMobile}
            onClick={isMobile ? onClose : undefined}
          />
        ))}
      </nav>

      {/* Divider */}
      <div className="h-px bg-[#FAFAFA]/25 mx-4" />

      {/* Bottom: Perfil + Cerrar Sesión */}
      <div className="flex flex-col gap-1 px-3 py-4">
        <NavLink
          to="/app/perfil"
          onClick={isMobile ? onClose : undefined}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-3 transition-colors
            ${expanded || isMobile ? "" : "justify-center"}
            ${isActive
              ? "bg-[#1F5ACD] text-[#FAFAFA]"
              : "text-[#FAFAFA] hover:bg-[#FAFAFA]/10"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <ProfileIcon className={`h-5 w-5 shrink-0 ${isActive ? "text-[#FAFAFA]" : "text-[#FAFAFA]/70"}`} />
              {(expanded || isMobile) && (
                <span className="text-xl font-bold font-['Public_Sans']">Perfil</span>
              )}
            </>
          )}
        </NavLink>

        {/* Divider */}
        <div className="h-px bg-[#FAFAFA]/25 mx-1 my-1" />

        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-colors
            text-[#FAFAFA] hover:bg-[#FAFAFA]/10
            ${expanded || isMobile ? "" : "justify-center"}`}
        >
          <LogoutIcon className="h-5 w-5 shrink-0 text-[#FAFAFA]/70" />
          {(expanded || isMobile) && (
            <span className="text-xl font-bold font-['Public_Sans']">Cerrar Sesión</span>
          )}
        </button>
      </div>
    </aside>
  );
};

const SideBar = () => {
  const { expanded, toggle, mobileOpen, openMobile, closeMobile } = useSideBar();

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex h-screen sticky top-0">
        <SidebarContent expanded={expanded} toggle={toggle} isMobile={false} />
      </div>

      {/* Mobile: hamburger button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={openMobile}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#1F3664] shadow-[0_0_8px_0_rgba(0,0,0,1)]"
        >
          <ExpandIcon className="h-5 w-5 text-[#FAFAFA]" />
        </button>
      </div>

      {/* Mobile: drawer overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeMobile}
          />
          <div className="relative z-50 h-full p-4">
            <SidebarContent
              expanded={true}
              toggle={closeMobile}
              onClose={closeMobile}
              isMobile={true}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default SideBar;