const DrawerToggle = ({ isOpen, onToggle, ariaLabel, className = "" }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`p-2 rounded-lg hover:bg-slate-100 transition-colors ${className}`}
    aria-label={ariaLabel ?? (isOpen ? "Cerrar" : "Abrir")}
  >
    <svg
      className={`w-5 h-5 text-slate-600 transition-transform duration-300 ${
        isOpen ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </button>
);

const Drawer = ({ isOpen, children, className = "" }) => (
  <div
    className={`transition-all duration-300 ease-in-out overflow-hidden ${
      isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
    } ${className}`}
  >
    {children}
  </div>
);

Drawer.Toggle = DrawerToggle;

export default Drawer;
