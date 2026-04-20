// src/Components/Organism/ProfileCard.jsx

/**
 * ProfileCard
 * Organism que muestra la información del perfil del usuario.
 * Recibe el objeto `user` ya parseado desde Perfil.jsx.
 *
 * Props:
 *   user: {
 *     foto, casaHogar, puesto, nombre, apellidos,
 *     correo, rfc, curp, nss, cuentaBancaria, cumpleanos
 *   }
 */

const FieldReadOnly = ({ label, value, editable = false }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
      {label}
    </label>
    <div className="flex items-center min-h-[46px] w-full rounded-lg bg-slate-100 px-4 shadow-[inset_0px_2px_4px_#00000020] gap-2">
      <span className="flex-1 text-sm font-medium text-slate-700 truncate">
        {value || <span className="text-slate-400 italic">Sin información</span>}
      </span>
      {/* Ícono de candado para campos de solo lectura */}
      {!editable && (
        <img src="/icons.svg#lock" alt="" aria-hidden="true" className="h-4 w-4 opacity-30" />
      )}
    </div>
  </div>
);

const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 text-slate-400"
    aria-hidden="true"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

/**
 * FieldPendingId
 * Igual que Field pero muestra el valor numérico con un badge
 * "ID · Pendiente" para campos que aún no resuelven su nombre
 * (houseId, roleId). Se reemplaza cuando el backend exponga el nombre.
 */
const FieldPendingId = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
      {label}
    </label>
    <div className="flex items-center min-h-[46px] w-full rounded-lg bg-slate-100 px-4 shadow-[inset_0px_2px_4px_#00000020] gap-2">
      <span className="flex-1 text-sm font-medium text-slate-700 truncate">
        {value != null
          ? `ID: ${value}`
          : <span className="text-slate-400 italic">Sin información</span>}
      </span>
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 whitespace-nowrap">
        Pendiente
      </span>
    </div>
  </div>
);

const Field = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
      {label}
    </label>
    <div className="flex items-center min-h-[46px] w-full rounded-lg bg-slate-100 px-4 shadow-[inset_0px_2px_4px_#00000020] gap-2">
      <span className="flex-1 text-sm font-medium text-slate-700 truncate">
        {value || <span className="text-slate-400 italic">Sin información</span>}
      </span>
      <LockIcon />
    </div>
  </div>
);

const ProfileCard = ({ user }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-10">

        {/* ── Columna izquierda: Datos del Usuario ── */}
        <div className="flex-1 flex flex-col gap-5">
          <h2 className="text-lg font-bold text-slate-800">Datos del Usuario</h2>

          <FieldPendingId label="Casa Hogar" value={user?.casaHogar} />
          <FieldPendingId label="Puesto"     value={user?.puesto} />
          <Field label="Nombre"     value={user?.nombre} />
          <Field label="Apellidos"  value={user?.apellidos} />
          <Field label="Correo"     value={user?.correo} />
          <Field label="RFC"        value={user?.rfc} />
        </div>

        {/* ── Columna derecha: Foto + datos sensibles ── */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Foto */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Foto del Usuario
            </label>
            <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-100 h-[180px]">
              {user?.foto ? (
                <img
                  src={user.foto}
                  alt="Foto de perfil"
                  className="h-full w-full object-cover rounded-xl"
                />
              ) : (
                /* Avatar placeholder */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 80 80"
                  className="h-20 w-20 text-slate-400"
                  fill="currentColor"
                  aria-label="Sin foto"
                >
                  <circle cx="40" cy="32" r="16" />
                  <path d="M10 72c0-16.569 13.431-30 30-30s30 13.431 30 30" />
                </svg>
              )}
            </div>
          </div>

          <Field label="CURP"            value={user?.curp} />
          <Field label="NSS"             value={user?.nss} />
          <Field label="Cuenta Bancaria" value={user?.cuentaBancaria} />
          <Field label="Cumpleaños"      value={user?.cumpleanos} />
        </div>
      </div>

      {/* ── Acciones ── */}
      <div className="mt-8 flex flex-wrap gap-3 justify-end">
        <button
          className="h-[46px] px-6 rounded-lg bg-[#1e3a5f] text-white text-sm font-semibold
                     hover:bg-[#16304f] active:bg-[#0f2540] transition-colors"
        >
          Modificar Perfil
        </button>
        <button
          className="h-[46px] px-6 rounded-lg bg-[#1e3a5f] text-white text-sm font-semibold
                     hover:bg-[#16304f] active:bg-[#0f2540] transition-colors"
        >
          Otras Opciones
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;