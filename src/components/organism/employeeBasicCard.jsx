import Type from "../atoms/type";
import Loader from "../atoms/loader";
import TextField from "../atoms/textField";
import Drawer from "../atoms/drawer";
import Chip from "../atoms/chip";

const AVATAR_PLACEHOLDER = "/user-circle.svg";

const EmployeeBasicCard = ({
  employee,
  employeeHouse,
  isEditing,
  basicForm,
  setBasicField,
  saving,
  saveError,
  infoDrawer,
  onOpenEdit,
  onSubmit,
  onCancel,
}) => {
  return (
    <div className="relative w-full flex p-3 items-start rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Avatar */}
      <div className="flex shrink-0 mr-8 mt-1">
        <div className="relative h-28 w-28 shrink-0 sm:h-32 sm:w-32">
          <img
            src={employee?.picture?.trim() ? employee.picture : AVATAR_PLACEHOLDER}
            alt=""
            className="h-full w-full object-cover rounded-full ring-1 ring-slate-200"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = AVATAR_PLACEHOLDER; }}
          />
          <div className="absolute bottom-1 right-1 z-10">
            <Chip active={employee?.isActive ?? false} />
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {/* Nombre + botones */}
        <div className="flex justify-between items-start">
          <div>
            <Type variant="page-title" as="h2">
              {`${employee?.name ?? ""} ${employee?.surname ?? ""}`}
            </Type>
            <Type variant="subtitle" as="p" className="mt-1">
              {employeeHouse?.name ? `Casa - ${employeeHouse.name}` : ""}
            </Type>
          </div>

          {isEditing ? (
            <div className="flex gap-2 shrink-0">
              <button
                type="button" onClick={onCancel} disabled={saving}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button" onClick={onSubmit} disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
              >
                {saving && <Loader size="sm" />}
                Guardar
              </button>
            </div>
          ) : (
            <button
              type="button" aria-label="Editar información básica"
              className="rounded-lg p-2 hover:bg-slate-100 shrink-0"
              onClick={onOpenEdit}
            >
              <img src="/edit.svg" alt="" className="h-5 w-5" />
            </button>
          )}
        </div>

        {saveError && isEditing && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{saveError}</p>
        )}

        {/* Modo lectura */}
        {!isEditing && (
          <>
            <div className="w-[97%] mr-auto flex flex-wrap justify-between">
              {[
                { label: "Puesto",              value: employee?.role },
                { label: "Fecha de Nacimiento", value: employee?.birthDate ? String(employee.birthDate).slice(0, 10) : null },
                { label: "Fecha de Inicio",     value: employee?.startDate ? String(employee.startDate).slice(0, 10) : "Sin fecha" },
                { label: "Fecha de Terminación", value: employee?.endDate ?? "N/A" },
              ].map(({ label, value }) => (
                <div key={label} className="basis-1/4">
                  <Type variant="metric-label" as="p">{label}</Type>
                  <Type variant="metric-value" as="p" className="mt-0.5">{value ?? "N/A"}</Type>
                </div>
              ))}
            </div>

            <Drawer isOpen={infoDrawer.isOpen} className={infoDrawer.isOpen ? "mt-2" : ""}>
              <div className="pt-4 border-t border-slate-200">
                <div className="w-[97%] mr-auto flex flex-wrap justify-between">
                  {[
                    { label: "CURP",            value: employee?.curp },
                    { label: "NSS",             value: employee?.nss },
                    { label: "RFC",             value: employee?.rfc },
                    { label: "Cuenta Bancaria", value: employee?.bankAccount },
                  ].map(({ label, value }) => (
                    <div key={label} className="basis-1/4">
                      <Type variant="metric-label" as="p">{label}</Type>
                      <Type variant="metric-value" as="p" className="mt-0.5">{value ?? "N/A"}</Type>
                    </div>
                  ))}
                </div>
              </div>
            </Drawer>
          </>
        )}

        {/* Modo edición */}
        {isEditing && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Nombre",   field: "name" },
                { label: "Apellido", field: "surname" },
                { label: "CURP",     field: "curp" },
                { label: "RFC",      field: "rfc" },
                { label: "NSS",      field: "nss" },
                { label: "Cuenta Bancaria (CLABE)", field: "bankAccount" },
                { label: "Fecha de Nacimiento (YYYY-MM-DD)", field: "birthDate" },
              ].map(({ label, field }) => (
                <div key={field} className="flex flex-col gap-1">
                  <Type variant="metric-label" as="p">{label}</Type>
                  <TextField
                    id={field}
                    value={basicForm[field]}
                    setValue={(v) => setBasicField(field, v)}
                    labelClassName="hidden"
                    text=""
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toggle drawer (solo en lectura) */}
      {!isEditing && (
        <Drawer.Toggle
          isOpen={infoDrawer.isOpen}
          onToggle={infoDrawer.toggle}
          ariaLabel={infoDrawer.isOpen ? "Cerrar información adicional" : "Ver más información"}
          className="absolute bottom-2 right-2"
        />
      )}
    </div>
  );
};

export default EmployeeBasicCard;