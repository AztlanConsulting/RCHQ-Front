import Type from "../atoms/type";
import Loader from "../atoms/loader";
import TextField from "../atoms/textField";
import ErrorText from "../atoms/errorText";
import SmallButton from "../atoms/smallButton";

const EmployeeContactCard = ({
  employee,
  employeeAddress,
  isEditing,
  contactForm,
  setContactField,
  saving,
  saveError,
  errors = {},
  onOpenEdit,
  onSubmit,
  onCancel,
  canEdit = true,
}) => {

  const EMPTY_LABEL = "N/A";
  return (
    <div className="w-full min-w-0 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 md:flex md:basis-1/3 md:shrink-0 md:flex-col">
      <div
        className={
          isEditing
            ? "flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between"
            : "flex items-start justify-between gap-3"
        }
      >
        <Type variant="section-title" as="h3">Contacto</Type>

        {isEditing ? (
          <div className="flex w-full flex-col gap-2 xl:w-auto xl:shrink-0 xl:flex-row">
            <SmallButton
              text="Cancelar"
              onClick={onCancel}
              disabled={saving}
              cancel
              hasAdjustableWidth
            />
            {canEdit ? (
              <SmallButton
                text="Guardar"
                onClick={onSubmit}
                disabled={saving}
                leadingIcon={saving ? <Loader size="sm" /> : null}
                hasAdjustableWidth
              />
            ) : null}
          </div>
        ) : canEdit ? (
          <button
            type="button" aria-label="Editar contacto"
            className="rounded-lg p-2 hover:bg-slate-100 shrink-0"
            onClick={onOpenEdit}
          >
            <img src="/edit.svg" alt="" className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      {saveError && isEditing && canEdit && (
        <p className="mt-2 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{saveError}</p>
      )}

      {!isEditing && (
        <div className="mt-6 flex flex-col gap-6 md:flex-1 md:justify-start">
          {[
            { label: "Correo Electrónico",  value: employee?.email },
            { label: "Número de Teléfono",  value: employee?.phoneNumber },
            { 
              label: "Dirección",           
              value: [employeeAddress?.street, employeeAddress?.municipio, employeeAddress?.city]
                       .filter(Boolean)
                       .join(", ") || null
            },
            { label: "Código Postal",       value: employeeAddress?.postalCode },
          ].map(({ label, value }) => (
            <div key={label} className="min-w-0 w-full">
              <Type variant="metric-label" as="p" className="mb-2">{label}</Type>
              <div className="flex min-h-[50px] items-center rounded-lg bg-neutral-50 px-4 py-3 shadow-[inset_0px_4px_4px_#00000040]">
                <Type
                  variant="metric-value"
                  as="p"
                  className="min-w-0 w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
                >
                  {value ?? EMPTY_LABEL}
                </Type>
              </div>
            </div>
          ))}
        </div>
      )}

      {isEditing && canEdit && (
        <div className="mt-6 flex flex-col gap-5 md:flex-1">
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
              <div className="min-h-5">
                {errors[field] && <ErrorText>{errors[field]}</ErrorText>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeContactCard;