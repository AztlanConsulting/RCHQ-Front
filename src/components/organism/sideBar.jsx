import { NavLink, useNavigate } from "react-router-dom";
import { useRef, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import useSideBar from "../../hooks/organism/useSideBar";
import { hasRole } from "../../utils/auth/getRoleName";

// ─── Icon component ───────────────────────────────────────────────────────────
const Icon = ({ name, className }) => (
  <img
    src={`/${name}.svg`}
    alt=""
    aria-hidden="true"
    className={`${className} ${name === "document" ? "brightness-0 invert" : ""}`}
  />
);

const getNavItems = (user) => {
  const isCoordinator = hasRole(user, "coordinador");
  const vacationPath = isCoordinator
    ? "/app/vacaciones/solicitudes"
    : "/app/vacaciones";

  const navItems = [
    { to: "/app/calendario", label: "Calendario", icon: "calendar" },
    { to: "/app/personal", label: "Personal", icon: "employee" },
    { to: "/app/casas", label: "Casas Hogares", icon: "home" },
    { to: vacationPath, label: "Vacaciones", icon: "vacation" },
    { to: "/app/ausencias", label: "Ausencias", icon: "absences" },
    { to: "/app/donaciones", label: "Donaciones", icon: "donations" },
  ];

  if (isCoordinator) {
    navItems.push({
      to: "/app/logs",
      label: "Acciones Registradas",
      icon: "document",
    });
  }

  return navItems;
};

// ─── Desktop NavItem ──────────────────────────────────────────────────────────
const NavItem = ({ to, label, icon, expanded }) => (
  <NavLink
    to={to}
    aria-label={label}
    className={({ isActive }) =>
      `flex items-center rounded-lg h-10 w-full shrink-0 transition-colors overflow-hidden
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
          aria-hidden="true"
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
        aria-hidden="true"
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
      <button
        type="button"
        onClick={onButtonClick}
        aria-label={label}
        className="flex items-center rounded-lg h-10 w-full shrink-0 transition-colors overflow-hidden hover:bg-[#FAFAFA]/10"
      >
        {content(false)}
      </button>
    );
  }

  return (
    <NavLink
      to={to}
      aria-label={label}
      className={({ isActive }) =>
        `flex items-center rounded-lg h-10 w-full shrink-0 transition-colors overflow-hidden
        ${isActive ? "bg-[#1F5ACD] hover:bg-[#1F5ACD]" : "hover:bg-[#FAFAFA]/10"}`
      }
    >
      {({ isActive }) => content(isActive)}
    </NavLink>
  );
};

// ─── Desktop SidebarContent ───────────────────────────────────────────────────
const SideBarContent = ({ expanded, toggle }) => {
  const sideBarRef = useRef(null);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const navItems = getNavItems(user);

  useEffect(() => {
    if (!expanded) return;

    const handleClickOutside = (e) => {
      if (sideBarRef.current && !sideBarRef.current.contains(e.target)) {
        toggle();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded, toggle]);

  const handleLogout = () => {
    logout();
    navigate("/iniciar-sesion", { replace: true });
  };

  return (
    <aside
      ref={sideBarRef}
      aria-label="Menú principal"
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
          type="button"
          onClick={toggle}
          aria-label={expanded ? "Contraer menú" : "Expandir menú"}
          aria-expanded={expanded}
          className="flex items-center justify-center w-10 h-10 ml-3 hover:bg-[#FAFAFA]/10 transition-colors rounded-lg shrink-0"
        >
          <Icon
            name="expand"
            className={`h-5 w-5 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          />
        </button>
        <span
          aria-hidden="true"
          className={`
            flex-1 text-center pr-4
            overflow-hidden whitespace-nowrap transition-all duration-300
            font-['Public_Sans'] font-bold text-xl text-[#FAFAFA]
            ${expanded ? "opacity-100 max-w-full" : "opacity-0 max-w-0"}
          `}
        >
          TOCHAN
        </span>
      </div>

      <div className="h-px bg-[#FAFAFA]/25 mx-3 shrink-0" />
      <nav className="flex flex-col gap-1 flex-1 px-3 py-4 overflow-y-auto min-h-0">
        {navItems.map((item) => (
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
  const { logout, user } = useAuth();
  const navItems = getNavItems(user);

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
            type="button"
            onClick={mobileOpen ? closeMobile : openMobile}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-menu"
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[#FAFAFA]/10 transition-colors shrink-0"
          >
            {mobileOpen ? (
              <svg aria-hidden="true" className="h-5 w-5 text-[#FAFAFA]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg aria-hidden="true" className="h-5 w-5 text-[#FAFAFA]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          <span aria-hidden="true" className="flex-1 text-center font-['Public_Sans'] font-bold text-xl text-[#FAFAFA]">
            TOCHAN
          </span>
        </div>

        {mobileOpen && (
          <nav
            id="mobile-nav-menu"
            aria-label="Menú principal"
            className="bg-[#1F3664] border-t border-[#FAFAFA]/25 px-4 py-3 flex flex-col gap-1 max-h-[calc(100vh-56px)] overflow-y-auto"
          >
            {navItems.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={closeMobile}
                aria-label={label}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg h-12 px-3 shrink-0 transition-colors
                  ${isActive ? "bg-[#1F5ACD]" : "hover:bg-[#FAFAFA]/10"}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      name={icon}
                      className={`h-5 w-5 shrink-0 ${isActive ? "opacity-100" : "opacity-70"}`}
                    />
                    <span aria-hidden="true" className="font-['Public_Sans'] font-bold text-base text-[#FAFAFA]">
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
              aria-label="Perfil"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg h-12 px-3 shrink-0 transition-colors
                ${isActive ? "bg-[#1F5ACD]" : "hover:bg-[#FAFAFA]/10"}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    name="profile"
                    className={`h-5 w-5 shrink-0 ${isActive ? "opacity-100" : "opacity-70"}`}
                  />
                  <span aria-hidden="true" className="font-['Public_Sans'] font-bold text-base text-[#FAFAFA]">
                    Perfil
                  </span>
                </>
              )}
            </NavLink>

            <div className="h-px bg-[#FAFAFA]/25 my-1" />

            <button
              type="button"
              onClick={handleLogout}
              aria-label="Cerrar Sesión"
              className="flex items-center gap-3 rounded-lg h-12 px-3 shrink-0 transition-colors hover:bg-[#FAFAFA]/10 w-full"
            >
              <Icon name="logout" className="h-5 w-5 shrink-0 opacity-70" />
              <span aria-hidden="true" className="font-['Public_Sans'] font-bold text-base text-[#FAFAFA]">
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
