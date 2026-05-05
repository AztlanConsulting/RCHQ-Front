import Type from "../atoms/type";
import Loader from "../atoms/loader";
import TextField from "../atoms/textField";

const EmployeeContactCard = ({
  employee,
  employeeAddress,
  isEditing,
  contactForm,
  setContactField,
  saving,
  saveError,
  onOpenEdit,
  onSubmit,
  onCancel,
}) => {
  return (
    <div className="basis-1/3 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex justify-between items-start">
        <Type variant="section-title" as="h3">Contacto</Type>

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
            type="button" aria-label="Editar contacto"
            className="rounded-lg p-2 hover:bg-slate-100 shrink-0"
            onClick={onOpenEdit}
          >
            <img src="/edit.svg" alt="" className="h-5 w-5" />
          </button>
        )}
      </div>

      {saveError && isEditing && (
        <p className="mt-2 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{saveError}</p>
      )}

      {!isEditing && (
        <div className="mt-4 flex flex-col gap-4">
          {[
            { label: "Correo Electrónico",  value: employee?.email },
            { label: "Número de Teléfono",  value: employee?.phoneNumber },
            { 
              label: "Dirección",           
              value: [employeeAddress?.street, employeeAddress?.municipio, employeeAddress?.city]
                       .filter(Boolean)
                       .join(", ") 
            },
            { label: "Código Postal",       value: employeeAddress?.postalCode },
          ].map(({ label, value }) => (
            <div key={label} className="min-w-[12rem] flex-1">
              <Type variant="metric-label" as="p" className="mb-1.5">{label}</Type>
              <div className="flex items-center rounded-lg bg-neutral-50 px-4 py-2 shadow-[inset_0px_4px_4px_#00000040]">
                <Type variant="metric-value" as="p">{value ?? "N/A"}</Type>
              </div>
            </div>
          ))}
        </div>
      )}

      {isEditing && (
        <div className="mt-4 flex flex-col gap-4">
          {[
            { label: "Correo Electrónico",  field: "email" },
            { label: "Número de Teléfono",  field: "phoneNumber" },
            { label: "Calle y número",      field: "street" },
            { label: "Municipio",           field: "municipio" },
            { label: "Ciudad",              field: "city" },
            { label: "Código Postal",       field: "postalCode" },
          ].map(({ label, field }) => (
            <div key={field} className="flex flex-col gap-1">
              <Type variant="metric-label" as="p">{label}</Type>
              <TextField
                id={field}
                value={contactForm[field]}
                setValue={(v) => setContactField(field, v)}
                labelClassName="hidden"
                text=""
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeContactCard;