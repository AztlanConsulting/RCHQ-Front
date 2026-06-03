import Type from "../atoms/type";
import Loader from "../atoms/loader";
import TextField from "../atoms/textField";
import DateField from "../atoms/dateField";
import Drawer from "../atoms/drawer";
import Chip from "../atoms/chip";
import ErrorText from "../atoms/errorText";
import SmallButton from "../atoms/smallButton";
import Alert from "../atoms/alerts";

const API_URL = import.meta.env.VITE_API_URL;
const AVATAR_PLACEHOLDER = "/user-circle.svg";

const EmployeeBasicCard = ({
  employee,
  employeeHouse,
  isEditing,
  basicForm,
  basicPicturePreview,
  setBasicField,
  setBasicPicture,
  saving,
  saveError,
  validationAlert,
  onValidationAlertClose,
  errors = {},
  infoDrawer,
  onOpenEdit,
  onSubmit,
  onCancel,
  canEdit = true,
}) => {
  const currentImageUrl = employee?.picture ? `${API_URL}/${employee.picture}` : null;
  const displayImageUrl = basicPicturePreview || currentImageUrl || AVATAR_PLACEHOLDER;

  return (
    <div className="relative flex w-full flex-col gap-5 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-start sm:gap-7 sm:px-6 sm:py-5">
      <div className="mt-1 flex shrink-0 justify-center sm:justify-start">
        <div className="relative h-28 w-28 shrink-0 sm:h-32 sm:w-32">
          <img
            src={displayImageUrl}
            alt=""
            className="h-full w-full object-cover rounded-full ring-1 ring-slate-200"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = AVATAR_PLACEHOLDER; }}
          />
          <div className="absolute -bottom-1 left-1/2 z-10 -translate-x-1/2 sm:left-auto sm:right-1 sm:translate-x-0">
            <Chip active={employee?.isActive ?? false} />
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <Type variant="page-title" as="h2" className="text-[2rem] leading-none tracking-[-0.02em]">
              {`${employee?.name ?? ""} ${employee?.surname ?? ""}`}
            </Type>
            <Type variant="subtitle" as="p" className="mt-2 text-lg font-semibold text-slate-500">
              {employeeHouse?.name ? `Casa - ${employeeHouse.name}` : ""}
            </Type>
          </div>

          {isEditing ? (
            <div className="flex gap-2 shrink-0">
              <SmallButton text="Cancelar" onClick={onCancel} disabled={saving} cancel />
              {canEdit ? (
                <SmallButton
                  text="Guardar"
                  onClick={onSubmit}
                  disabled={saving}
                  leadingIcon={saving ? <Loader size="sm" /> : null}
                />
              ) : null}
            </div>
          ) : canEdit ? (
            <button
              type="button" aria-label="Editar información básica"
              className="rounded-lg p-2 hover:bg-slate-100 shrink-0"
              onClick={onOpenEdit}
            >
              <img src="/edit.svg" alt="" className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        {saveError && isEditing && canEdit && (
          <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {saveError}
          </p>
        )}

        {validationAlert && isEditing && canEdit && (
          <Alert
            type="error"
            message={validationAlert}
            duration={3000}
            onClose={onValidationAlertClose}
          />
        )}

        {!isEditing && (
          <>
            <div className="grid w-full grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Puesto",              value: employee?.role },
                { label: "Fecha de Nacimiento", value: employee?.birthDate ? String(employee.birthDate).slice(0, 10) : null },
                { label: "Fecha de Inicio",     value: employee?.startDate ? String(employee.startDate).slice(0, 10) : "Sin fecha" },
                { label: "Fecha de Terminación", value: employee?.endDate ?? "N/A" },
              ].map(({ label, value }) => (
                <div key={label} className="min-w-0">
                  <Type variant="metric-label" as="p" className="text-[1.05rem] text-slate-500">{label}</Type>
                  <Type variant="metric-value" as="p" className="mt-1 text-[1.05rem]">{value ?? "N/A"}</Type>
                </div>
              ))}
            </div>

            <Drawer isOpen={infoDrawer.isOpen} className={infoDrawer.isOpen ? "mt-2" : ""}>
              <div className="pt-4 border-t border-slate-200">
                <div className="grid w-full grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "CURP",            value: employee?.curp },
                    { label: "NSS",             value: employee?.nss },
                    { label: "RFC",             value: employee?.rfc },
                    { label: "Cuenta Bancaria", value: employee?.bankAccount },
                  ].map(({ label, value }) => (
                    <div key={label} className="min-w-0">
                      <Type variant="metric-label" as="p" className="text-slate-500">{label}</Type>
                      <Type variant="metric-value" as="p" className="mt-0.5">{value ?? "N/A"}</Type>
                    </div>
                  ))}
                </div>
              </div>
            </Drawer>
          </>
        )}

        {isEditing && canEdit && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Type variant="metric-label" as="p" className="mb-2">Foto de perfil</Type>
                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center">
                  <div className="mx-auto h-20 w-20 overflow-hidden rounded-full ring-1 ring-slate-200 sm:mx-0">
                    <img
                      src={displayImageUrl}
                      alt="Vista previa de foto de perfil"
                      className="h-full w-full object-cover"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = AVATAR_PLACEHOLDER; }}
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <label
                      htmlFor="basic-picture"
                      className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg bg-[#24375e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#162d4a] sm:w-fit"
                    >
                      Cambiar foto
                    </label>
                    <input
                      id="basic-picture"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      onChange={(e) => setBasicPicture(e.target.files?.[0] ?? null)}
                    />
                    <p className="text-xs text-slate-500">
                      JPG o PNG, máximo 5MB.
                    </p>
                  </div>
                </div>
              </div>
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
                  {field === "birthDate" ? (
                    <DateField
                      label={label}
                      name={field}
                      value={basicForm[field]}
                      onChange={(e) => setBasicField(field, e.target.value)}
                      minDate={new Date("1900-01-01")}
                      maxDate={new Date()}
                    />
                  ) : (
                    <>
                      <Type variant="metric-label" as="p">{label}</Type>
                      <TextField
                        id={field}
                        type={type}
                        value={basicForm[field]}
                        setValue={(v) => setBasicField(field, v)}
                        labelClassName="hidden"
                        text=""
                      />
                    </>
                  )}
                  <div className="min-h-5">
                    {errors[field] && <ErrorText>{errors[field]}</ErrorText>}
                  </div>
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
