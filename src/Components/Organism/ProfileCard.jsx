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
    </div>
  </div>
);

const Field = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-slate-500 camelcase tracking-wide">
      {label}
    </label>
    <div className="flex items-center min-h-[46px] w-full rounded-lg bg-slate-100 px-4 shadow-[inset_0px_2px_4px_#00000020] gap-2">
      <span className="flex-1 text-sm font-medium text-slate-700 truncate">
        {value || <span className="text-slate-400 italic">Sin información</span>}
      </span>
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

          <Field label="Casa Hogar" value={user?.casaHogar} />
          <Field label="Puesto"     value={user?.puesto} />
          <Field label="Nombre"     value={user?.nombre} />
          <Field label="Apellidos"  value={user?.apellidos} />
          <Field label="Correo"     value={user?.correo} />
          <Field label="RFC"        value={user?.rfc} />
        </div>

        {/* ── Columna derecha: Foto + datos sensibles ── */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Foto */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 camelcase tracking-wide">
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
                viewBox="0 0 680 400"
                className="h-full w-full"
                aria-label="Sin foto"
              >
                <circle cx="340" cy="200" r="160" fill="#c8c8c8"/>
                <circle cx="340" cy="170" r="42" fill="none" stroke="#a0a0a0" strokeWidth="6"/>
                <path d="M260 295 Q260 248 340 248 Q420 248 420 295" fill="none" stroke="#a0a0a0" strokeWidth="6" strokeLinecap="round"/>
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