import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useSideBar from "../../hooks/organism/useSideBar";

// ─── Icon component ───────────────────────────────────────────────────────────
const Icon = ({ name, className }) => (
  <img
    src={`/${name}.svg`}
    alt={name}
    className={className}
  />
);

const NAV_ITEMS = [
  { to: "/app/calendario", label: "Calendario", icon: "calendar" },
  { to: "/app/personal",   label: "Personal",   icon: "employee" },
  { to: "/app/casas",      label: "Casas Hogares", icon: "home" },
  { to: "/app/vacaciones", label: "Vacaciones", icon: "vacation" },
  { to: "/app/ausencias",  label: "Ausencias",  icon: "absences" },
  { to: "/app/donaciones", label: "Donaciones", icon: "donations" },
];

// ─── Desktop NavItem ──────────────────────────────────────────────────────────
const NavItem = ({ to, label, icon, expanded }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center rounded-lg h-10 w-full transition-colors overflow-hidden
      ${isActive ? "bg-[#1F5ACD] hover:bg-[#1F5ACD]" : "hover:bg-[#FAFAFA]/10"}`
    }
  >
    {({ isActive }) => (
      <>
        <span className="flex items-center justify-center w-10 h-10 shrink-0">
          <Icon
            name={icon}
            className={`h-5 w-5 ${isActive ? "opacity-100" : "opacity-70"}`}
          />
        </span>
        <span
          className={`
            flex-1 text-center pr-4
            overflow-hidden whitespace-nowrap transition-all duration-300
            font-['Public Sans'] font-bold text-xl text-[#FAFAFA]
            ${expanded ? "opacity-100 max-w-xs" : "opacity-0 max-w-0 pr-0"}
          `}
        >
          {label}
        </span>
      </>
    )}
  </NavLink>
);

// ─── Desktop BottomItem ───────────────────────────────────────────────────────
const BottomItem = ({ to, label, icon, expanded, isButton, onButtonClick }) => {
  const content = (isActive = false) => (
    <>
      <span className="flex items-center justify-center w-10 h-10 shrink-0">
        <Icon
          name={icon}
          className={`h-5 w-5 ${isActive ? "opacity-100" : "opacity-70"}`}
        />
      </span>
      <span
        className={`
          flex-1 text-center pr-4
          overflow-hidden whitespace-nowrap transition-all duration-300
          font-['Public Sans'] font-bold text-xl text-[#FAFAFA]
          ${expanded ? "opacity-100 max-w-xs" : "opacity-0 max-w-0 pr-0"}
        `}
      >
        {label}
      </span>
    </>
  );

  if (isButton) {
    return (
      <button
        onClick={onButtonClick}
        className="flex items-center rounded-lg h-10 w-full transition-colors overflow-hidden hover:bg-[#FAFAFA]/10"
      >
        {content(false)}
      </button>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center rounded-lg h-10 w-full transition-colors overflow-hidden
        ${isActive ? "bg-[#1F5ACD] hover:bg-[#1F5ACD]" : "hover:bg-[#FAFAFA]/10"}`
      }
    >
      {({ isActive }) => content(isActive)}
    </NavLink>
  );
};

// ─── Desktop SideBar ──────────────────────────────────────────────────────────
const SideBarContent = ({ expanded, toggle }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

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
        ${expanded ? "w-[358px]" : "w-16"}
      `}
      style={{ height: "calc(100vh - 32px)" }}
    >
      <div className="flex items-center h-16 shrink-0">
        <button
          onClick={toggle}
          className="flex items-center justify-center w-10 h-10 ml-3 hover:bg-[#FAFAFA]/10 transition-colors rounded-lg shrink-0"
        >
          <Icon
            name="expand"
            className={`h-5 w-5 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          />
        </button>
        <span
          className={`
            flex-1 text-center pr-4
            overflow-hidden whitespace-nowrap transition-all duration-300
            font-['Public Sans'] font-bold text-xl text-[#FAFAFA]
            ${expanded ? "opacity-100 max-w-full" : "opacity-0 max-w-0"}
          `}
        >
          TOCHAN
        </span>
      </div>

      <div className="h-px bg-[#FAFAFA]/25 mx-3 shrink-0" />

      <nav className="flex flex-col gap-1 flex-1 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} expanded={expanded} />
        ))}
      </nav>

      <div className="h-px bg-[#FAFAFA]/25 mx-3 shrink-0" />

      <div className="flex flex-col px-3 py-3 gap-1 shrink-0">
        <BottomItem
          to="/app/perfil"
          label="Perfil"
          icon="profile"
          expanded={expanded}
        />
        <div className="h-px bg-[#FAFAFA]/25 my-1 shrink-0" />
        <BottomItem
          label="Cerrar Sesión"
          icon="logout"
          expanded={expanded}
          isButton={true}
          onButtonClick={handleLogout}
        />
      </div>
    </aside>
  );
};

// ─── Mobile Navbar + Dropdown ─────────────────────────────────────────────────
const MobileNav = ({ mobileOpen, openMobile, closeMobile }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    closeMobile();
    logout();
    navigate("/iniciar-sesion", { replace: true });
  };

  return (
    <>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={closeMobile} />
      )}

      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#1F3664] shadow-[0_0_8px_0_rgba(0,0,0,0.8)]">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={mobileOpen ? closeMobile : openMobile}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[#FAFAFA]/10 transition-colors shrink-0"
          >
            {mobileOpen ? (
              <svg className="h-5 w-5 text-[#FAFAFA]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-[#FAFAFA]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <span className="flex-1 text-center font-['Public Sans'] font-bold text-xl text-[#FAFAFA]">
            TOCHAN
          </span>
        </div>

        {mobileOpen && (
          <nav className="bg-[#1F3664] border-t border-[#FAFAFA]/25 px-4 py-3 flex flex-col gap-1">
            {NAV_ITEMS.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg h-12 px-3 transition-colors
                  ${isActive ? "bg-[#1F5ACD]" : "hover:bg-[#FAFAFA]/10"}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      name={icon}
                      className={`h-5 w-5 shrink-0 ${isActive ? "opacity-100" : "opacity-70"}`}
                    />
                    <span className="font-['Public Sans'] font-bold text-base text-[#FAFAFA]">
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}

            <div className="h-px bg-[#FAFAFA]/25 my-1" />

            <NavLink
              to="/app/perfil"
              onClick={closeMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg h-12 px-3 transition-colors
                ${isActive ? "bg-[#1F5ACD]" : "hover:bg-[#FAFAFA]/10"}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    name="profile"
                    className={`h-5 w-5 shrink-0 ${isActive ? "opacity-100" : "opacity-70"}`}
                  />
                  <span className="font-['Public Sans'] font-bold text-base text-[#FAFAFA]">
                    Perfil
                  </span>
                </>
              )}
            </NavLink>

            <div className="h-px bg-[#FAFAFA]/25 my-1" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-lg h-12 px-3 transition-colors hover:bg-[#FAFAFA]/10 w-full"
            >
              <Icon name="logout" className="h-5 w-5 shrink-0 opacity-70" />
              <span className="font-['Public Sans'] font-bold text-base text-[#FAFAFA]">
                Cerrar Sesión
              </span>
            </button>
          </nav>
        )}
      </header>
    </>
  );
};

// ─── Root SideBar ─────────────────────────────────────────────────────────────
const SideBar = () => {
  const { expanded, toggle, mobileOpen, openMobile, closeMobile } = useSideBar();

  return (
    <>
      {expanded && (
        <div
          className="hidden md:block fixed inset-0 z-30"
          onClick={toggle}
        />
      )}

      <div className="hidden md:block fixed top-0 left-0 z-40 ml-5 my-4">
        <SideBarContent expanded={expanded} toggle={toggle} />
      </div>

      <MobileNav
        mobileOpen={mobileOpen}
        openMobile={openMobile}
        closeMobile={closeMobile}
      />
    </>
  );
};

export default SideBar;