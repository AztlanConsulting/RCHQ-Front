const API_URL = import.meta.env.VITE_API_URL;

const Field = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <label className="text-xs font-semibold text-slate-500 camelcase tracking-wide">
      {label}
    </label>
    <div className="flex items-center min-h-[38px] w-full rounded-lg bg-[#F2F2F2] px-4 shadow-[inset_0px_2px_4px_#00000020] gap-2">
      <span className="flex-1 text-sm font-medium text-slate-700 truncate">
        {value || <span className="text-slate-400 italic">Sin información</span>}
      </span>
    </div>
  </div>
);

const ProfileCard = ({ user }) => {
  const imageUrl = user?.foto ? `${API_URL}/${user.foto}` : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex justify-center mb-4 lg:hidden">
        <div className="h-[150px] w-[150px] rounded-full overflow-hidden flex-shrink-0">
          {imageUrl ? (
            <img src={imageUrl} alt="Foto de perfil" className="h-full w-full object-cover" />
          ) : (
            <img src="/profilePhoto.svg" alt="Sin foto de perfil" className="h-full w-full object-cover" />
          )}
        </div>
      </div>
      <div className="hidden lg:flex flex-row gap-6">
        <div className="flex-1 flex flex-col gap-3">
          <h2 className="text-base font-bold text-slate-800 pt-0">Datos del Usuario</h2>
          <div className="h-1" />
          <Field label="Casa Hogar" value={user?.casaHogar} />
          <Field label="Puesto"     value={user?.puesto} />
          <Field label="Nombre"     value={user?.nombre} />
          <Field label="Apellidos"  value={user?.apellidos} />
          <Field label="Correo"     value={user?.correo} />
          <Field label="RFC"        value={user?.rfc} />
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex justify-center items-center pt-6" style={{ minHeight: "150px" }}>
            <div className="h-[150px] w-[150px] rounded-full overflow-hidden flex-shrink-0">
              {imageUrl ? (
                <img src={imageUrl} alt="Foto de perfil" className="h-full w-full object-cover" />
              ) : (
                <img src="/profilePhoto.svg" alt="Sin foto de perfil" className="h-full w-full object-cover" />
              )}
            </div>
          </div>
          <Field label="CURP"            value={user?.curp} />
          <Field label="NSS"             value={user?.nss} />
          <Field label="Cuenta Bancaria" value={user?.cuentaBancaria} />
          <Field label="Cumpleaños"      value={user?.cumpleanos} />
        </div>
      </div>
      <div className="flex flex-col gap-3 lg:hidden">
        <h2 className="text-base font-bold text-slate-800">Datos del Usuario</h2>
        <Field label="Casa Hogar"      value={user?.casaHogar} />
        <Field label="Puesto"          value={user?.puesto} />
        <Field label="Nombre"          value={user?.nombre} />
        <Field label="Apellidos"       value={user?.apellidos} />
        <Field label="Correo"          value={user?.correo} />
        <Field label="RFC"             value={user?.rfc} />
        <Field label="CURP"            value={user?.curp} />
        <Field label="NSS"             value={user?.nss} />
        <Field label="Cuenta Bancaria" value={user?.cuentaBancaria} />
        <Field label="Cumpleaños"      value={user?.cumpleanos} />
      </div>

      <div className="mt-5 flex flex-wrap gap-3 justify-end">
        <button className="h-[38px] px-6 rounded-lg bg-[#1e3a5f] text-white text-sm font-semibold hover:bg-[#16304f] active:bg-[#0f2540] transition-colors">
          Modificar Perfil
        </button>
        <button className="h-[38px] px-6 rounded-lg bg-[#1e3a5f] text-white text-sm font-semibold hover:bg-[#16304f] active:bg-[#0f2540] transition-colors">
          Otras Opciones
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;