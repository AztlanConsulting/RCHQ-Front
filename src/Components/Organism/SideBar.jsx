import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useSideBar from "../../hooks/Organism/useSideBar";
import ExpandIcon from "../Atoms/ExpandIcon";
import CalendarIcon from "../Atoms/CalendarIcon";
import PersonnelIcon from "../Atoms/PersonnelIcon";
import HouseIcon from "../Atoms/HouseIcon";
import VacationsIcon from "../Atoms/VacationsIcon";
import AbsencesIcon from "../Atoms/AbsencesIcon";
import DonationsIcon from "../Atoms/DonationsIcon";
import ProfileIcon from "../Atoms/ProfileIcon";
import LogoutIcon from "../Atoms/LogoutIcon";

const NAV_ITEMS = [
  { to: "/app/calendario", label: "Calendario", Icon: CalendarIcon },
  { to: "/app/personal", label: "Personal", Icon: PersonnelIcon },
  { to: "/app/casas", label: "Casas Hogares", Icon: HouseIcon },
  { to: "/app/vacaciones", label: "Vacaciones", Icon: VacationsIcon },
  { to: "/app/ausencias", label: "Ausencias", Icon: AbsencesIcon },
  { to: "/app/donaciones", label: "Donaciones", Icon: DonationsIcon },
];

const NavItem = ({ to, label, Icon, expanded }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center rounded-lg h-10 transition-colors overflow-hidden
      ${isActive ? "bg-[#1F5ACD]" : "hover:bg-[#FAFAFA]/10"}
      ${expanded ? "w-full" : "w-10 mx-auto"}`
    }
  >
    {({ isActive }) => (
      <>
        <span className={`flex items-center justify-center shrink-0 ${expanded ? "w-12" : "w-10"}`}>
          <Icon className={`h-5 w-5 ${isActive ? "text-[#FAFAFA]" : "text-[#FAFAFA]/70"}`} />
        </span>
        <span
          className={`
            flex-1 text-center pr-4
            overflow-hidden whitespace-nowrap transition-all duration-300
            font-['Public_Sans'] font-bold text-xl text-[#FAFAFA]
            ${expanded ? "opacity-100 max-w-xs" : "opacity-0 max-w-0 pr-0"}
          `}
        >
          {label}
        </span>
      </>
    )}
  </NavLink>
);

const BottomItem = ({ to, label, Icon, expanded, onClick, isButton, onButtonClick }) => {
  const baseClass = `flex items-center rounded-lg h-10 transition-colors overflow-hidden hover:bg-[#FAFAFA]/10
    ${expanded ? "w-full" : "w-10 mx-auto"}`;

  const content = (isActive = false) => (
    <>
      <span className={`flex items-center justify-center shrink-0 ${expanded ? "w-12" : "w-10"}`}>
        <Icon className={`h-5 w-5 ${isActive ? "text-[#FAFAFA]" : "text-[#FAFAFA]/70"}`} />
      </span>
      <span
        className={`
          flex-1 text-center pr-4
          overflow-hidden whitespace-nowrap transition-all duration-300
          font-['Public_Sans'] font-bold text-xl text-[#FAFAFA]
          ${expanded ? "opacity-100 max-w-xs" : "opacity-0 max-w-0 pr-0"}
        `}
      >
        {label}
      </span>
    </>
  );

  if (isButton) {
    return (
      <button onClick={onButtonClick} className={baseClass}>
        {content(false)}
      </button>
    );
  }

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `${baseClass} ${isActive ? "bg-[#1F5ACD]" : ""}`
      }
    >
      {({ isActive }) => content(isActive)}
    </NavLink>
  );
};

const SidebarContent = ({ expanded, toggle, onClose, isMobile }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isExpanded = expanded || isMobile;

  const handleLogout = () => {
    logout();
    navigate("/iniciar-sesion", { replace: true });
  };

  return (
    <aside
      className={`
        flex flex-col bg-[#1F3664] rounded-lg
        shadow-[0_0_8px_0_rgba(0,0,0,1)]
        transition-[width] duration-300 ease-in-out
        overflow-hidden
        ${isMobile ? "w-[358px]" : isExpanded ? "w-[358px]" : "w-16"}
      `}
      style={{ height: "calc(100vh - 32px)" }}
    >
      {/* Header */}
      <div className={`flex items-center h-16 shrink-0 ${isExpanded ? "" : "justify-center"}`}>
        <button
          onClick={isMobile ? onClose : toggle}
          className={`flex items-center justify-center w-10 h-10 hover:bg-[#FAFAFA]/10 transition-colors rounded-lg shrink-0
            ${isExpanded ? "ml-2" : ""}`}
        >
          <ExpandIcon
            className={`h-5 w-5 text-[#FAFAFA] transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
        <span
          className={`
            flex-1 text-center pr-4
            overflow-hidden whitespace-nowrap transition-all duration-300
            font-['Public_Sans'] font-bold text-xl text-[#FAFAFA]
            ${isExpanded ? "opacity-100 max-w-full" : "opacity-0 max-w-0"}
          `}
        >
          TOCHAN R.H.
        </span>
      </div>

      <div className="h-px bg-[#FAFAFA]/25 mx-3 shrink-0" />

      <nav className="flex flex-col gap-1 flex-1 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} expanded={isExpanded} />
        ))}
      </nav>

      <div className="h-px bg-[#FAFAFA]/25 mx-3 shrink-0" />

      <div className="flex flex-col px-3 py-3 gap-1 shrink-0">
        <BottomItem
          to="/app/perfil"
          label="Perfil"
          Icon={ProfileIcon}
          expanded={isExpanded}
          onClick={isMobile ? onClose : undefined}
        />

        <div className="h-px bg-[#FAFAFA]/25 my-1 shrink-0" />

        <BottomItem
          label="Cerrar Sesión"
          Icon={LogoutIcon}
          expanded={isExpanded}
          isButton={true}
          onButtonClick={handleLogout}
        />
      </div>
    </aside>
  );
};

const SideBar = () => {
  const { expanded, toggle, mobileOpen, openMobile, closeMobile } = useSideBar();

  return (
    <>
      <div className="hidden md:flex ml-5 my-4 sticky top-4 self-start shrink-0">
        <SidebarContent expanded={expanded} toggle={toggle} isMobile={false} />
      </div>

      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={openMobile}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#1F3664] shadow-[0_0_8px_0_rgba(0,0,0,1)]"
        >
          <ExpandIcon className="h-5 w-5 text-[#FAFAFA]" />
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/50" onClick={closeMobile} />
          <div className="relative z-50 ml-5 my-4">
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