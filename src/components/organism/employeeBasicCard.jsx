import Type from "../atoms/type";
import Loader from "../atoms/loader";
import TextField from "../atoms/textField";
import Drawer from "../atoms/drawer";
import Chip from "../atoms/chip";

const API_URL = import.meta.env.VITE_API_URL;
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
  const image_url = `${API_URL}/${employee.picture}`;

  return (
    <div className="relative w-full flex flex-col items-stretch gap-4 p-3 sm:flex-row sm:items-start sm:gap-0 rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex shrink-0 justify-center mt-1 sm:mr-8 sm:justify-start">
        <div className="relative h-28 w-28 shrink-0 sm:h-32 sm:w-32">
          <img
            src={image_url?.trim() ? image_url : AVATAR_PLACEHOLDER}
            alt=""
            className="h-full w-full object-cover rounded-full ring-1 ring-slate-200"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = AVATAR_PLACEHOLDER; }}
          />
          <div className="absolute bottom-1 right-1 z-10">
            <Chip active={employee?.isActive ?? false} />
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap justify-between items-start gap-2">
          <div className="min-w-0">
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
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#24375e] hover:bg-[#eef3fb] disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button" onClick={onSubmit} disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-[#24375e] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#162d4a] active:bg-[#0f2035] disabled:opacity-50"
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
          <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {saveError}
          </p>
        )}

        {!isEditing && (
          <>
            <div className="w-full max-w-[97%] mr-auto flex flex-wrap gap-y-3 justify-between gap-x-2">
              {[
                { label: "Puesto",              value: employee?.role },
                { label: "Fecha de Nacimiento", value: employee?.birthDate ? String(employee.birthDate).slice(0, 10) : null },
                { label: "Fecha de Inicio",     value: employee?.startDate ? String(employee.startDate).slice(0, 10) : "Sin fecha" },
                { label: "Fecha de Terminación", value: employee?.endDate ?? "N/A" },
              ].map(({ label, value }) => (
                <div key={label} className="basis-[calc(50%-0.25rem)] lg:basis-[calc(25%-0.375rem)] min-w-0">
                  <Type variant="metric-label" as="p">{label}</Type>
                  <Type variant="metric-value" as="p" className="mt-0.5">{value ?? "N/A"}</Type>
                </div>
              ))}
            </div>

            <Drawer isOpen={infoDrawer.isOpen} className={infoDrawer.isOpen ? "mt-2" : ""}>
              <div className="pt-4 border-t border-slate-200">
                <div className="w-full max-w-[97%] mr-auto flex flex-wrap gap-y-3 justify-between gap-x-2">
                  {[
                    { label: "CURP",            value: employee?.curp },
                    { label: "NSS",             value: employee?.nss },
                    { label: "RFC",             value: employee?.rfc },
                    { label: "Cuenta Bancaria", value: employee?.bankAccount },
                  ].map(({ label, value }) => (
                    <div key={label} className="basis-[calc(50%-0.25rem)] lg:basis-[calc(25%-0.375rem)] min-w-0">
                      <Type variant="metric-label" as="p">{label}</Type>
                      <Type variant="metric-value" as="p" className="mt-0.5">{value ?? "N/A"}</Type>
                    </div>
                  ))}
                </div>
              </div>
            </Drawer>
          </>
        )}

        {isEditing && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: "Nombre",   field: "name", type: "text" },
                { label: "Apellido", field: "surname", type: "text" },
                { label: "CURP",     field: "curp", type: "text" },
                { label: "RFC",      field: "rfc", type: "text" },
                { label: "NSS",      field: "nss", type: "text" },
                { label: "Cuenta Bancaria (CLABE)", field: "bankAccount", type: "text" },
                { label: "Fecha de Nacimiento", field: "birthDate", type: "date" },
              ].map(({ label, field, type }) => (
                <div key={field} className="flex flex-col gap-1">
                  <Type variant="metric-label" as="p">{label}</Type>
                  <TextField
                    id={field}
                    type={type}
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
