import Type from "../atoms/type";
import Loader from "../atoms/loader";
import Drawer from "../atoms/drawer";
import SelectField from "../atoms/selectField";
import TextField from "../atoms/textField";
import TimeField from "../atoms/timeField";
import CheckboxField from "../atoms/checkboxField";
import ErrorText from "../atoms/errorText";
import SmallButton from "../atoms/smallButton";
import Alert from "../atoms/alerts";
import {
  countWorkdayDays,
  countWorkdaysHours,
  parseUTCDateToHours,
  totalWorkDaysFromApprovedVacationRequests,
} from "@/utils/detalle-empleado.utils";

const TIPOS = [
  { value: "Nomina", label: "Nómina" },
  { value: "Asalariado", label: "Asalariado" },
  { value: "Honorarios", label: "Honorarios" },
  { value: "Voluntariado", label: "Voluntariado" },
];

const isAdminRole = (roleName = "") =>
  String(roleName)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .includes("Administrador");

const capitalizeFirstLetter = (value) => {
  if (value == null || value === "") return "N/A";

  const normalized = String(value);
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const formatContractTypeLabel = (value) => {
  if (!value) return "N/A";

  const matchedType = TIPOS.find(
    (type) => type.value.toLowerCase() === String(value).toLowerCase(),
  );
  if (matchedType) return matchedType.label;

  return capitalizeFirstLetter(value);
};

const EmployeeAdminCard = ({
  employee,
  employeeWorkdays,
  employeeVacationRequests,
  employeeAbsenceUsedDays,
  workdaysDrawer,
  isEditing,
  loadingCatalogues,
  adminForm,
  roles,
  frecuentPaymentTypes,
  setAdminField,
  toggleWorkday,
  setWorkdayTime,
  setWorkdayAllDay,
  saving,
  saveError,
  validationAlert,
  onValidationAlertClose,
  errors = {},
  onOpenEdit,
  onSubmit,
  onCancel,
  canEdit = true,
}) => {
  const currentRoleOption = roles.find(
    (role) => String(role.roleId) === String(adminForm.originalRoleId),
  );

  const editableRoles = roles.filter((role) => {
    const isCurrentRole = String(role.roleId) === String(adminForm.originalRoleId);
    return isCurrentRole || !isAdminRole(role.name);
  });

  const roleOptions = editableRoles.map((role) => ({
    value: role.roleId,
    label: role.name,
  }));

  if (
    currentRoleOption &&
    !roleOptions.some((option) => String(option.value) === String(currentRoleOption.roleId))
  ) {
    roleOptions.unshift({
      value: currentRoleOption.roleId,
      label: currentRoleOption.name,
    });
  }

  return (
    <div className="w-full min-w-0 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 md:basis-2/3 md:min-w-0 md:flex-1">
      <div
        className={
          isEditing
            ? "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
            : "flex items-start justify-between gap-3"
        }
      >
        <Type variant="section-title" as="h3" className="tracking-[-0.02em]">Información Administrativa</Type>

        {isEditing ? (
          <div className="flex w-full flex-col gap-2 [&>button]:w-full sm:w-auto sm:shrink-0 sm:flex-row sm:[&>button]:w-auto">
            <SmallButton
              text="Cancelar"
              onClick={onCancel}
              disabled={saving}
              cancel
            />
            {canEdit ? (
              <SmallButton
                text="Guardar"
                onClick={onSubmit}
                disabled={saving || loadingCatalogues}
                leadingIcon={saving ? <Loader size="sm" /> : null}
              />
            ) : null}
          </div>
        ) : canEdit ? (
          <button
            type="button" aria-label="Editar información administrativa"
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

      {validationAlert && isEditing && canEdit && (
        <div className="mt-2">
          <Alert
            type="error"
            message={validationAlert}
            duration={3000}
            onClose={onValidationAlertClose}
          />
        </div>
      )}

      {!isEditing && (
        <div className="mt-6 w-full flex flex-col gap-7">

          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
            <div className="min-w-0">
              <Type variant="metric-label" as="p" className="text-[1.05rem] font-semibold text-slate-400">Tipo</Type>
              <Type variant="metric-value" as="p" className="mt-1 text-[1.15rem]">
                {formatContractTypeLabel(employee?.type)}
              </Type>
            </div>
            <div className="min-w-0 sm:text-right">
              <Type variant="metric-label" as="p" className="text-[1.05rem] font-semibold text-slate-400">Salario</Type>
              <Type variant="metric-value" as="p" className="mt-1 text-[1.15rem] font-semibold">
                {employee?.salary ? `$${employee.salary}` : "N/A"}
              </Type>
            </div>
          </div>

          <div className="min-w-0">
            <Type variant="metric-label" as="p" className="text-[1.05rem] font-semibold text-slate-400">Frecuencia de pago</Type>
            <Type variant="metric-value" as="p" className="mt-1 text-[1.15rem]">
              {capitalizeFirstLetter(employee?.frequencyOfPaymentName)}
            </Type>
          </div>

          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
            <div className="min-w-0">
              <Type variant="metric-label" as="p" className="text-[1.05rem] font-semibold text-slate-400">Horario</Type>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-6 gap-y-1">
                <Type variant="metric-value" as="p" className="text-[1.15rem]">
                  {`${countWorkdayDays(employeeWorkdays)} días trabajados`}
                </Type>
                <Type variant="metric-value" as="p" className="text-[1.15rem]">
                  {`${countWorkdaysHours(employeeWorkdays)} horas semanales`}
                </Type>
              </div>
            </div>
            <div className="min-w-0 sm:text-right">
              <Drawer.Toggle
                isOpen={workdaysDrawer.isOpen}
                onToggle={workdaysDrawer.toggle}
                ariaLabel={workdaysDrawer.isOpen ? "Cerrar horario" : "Ver horario"}
                className="shrink-0"
              />
            </div>
          </div>

          {workdaysDrawer.isOpen && (
            <div className="-mt-3">
              <Drawer isOpen={workdaysDrawer.isOpen}>
                <div className="flex flex-col gap-1 rounded-lg bg-slate-50 px-4 py-3">
                  {employeeWorkdays?.length > 0 && employeeWorkdays.map((w) => (
                    <div key={w.workdayId} className="w-full flex justify-between">
                      <Type variant="metric-label" className="text-slate-500">{w.name}</Type>
                      <Type variant="metric-label" className="text-slate-500">
                        {`${parseUTCDateToHours(w.start)} - ${parseUTCDateToHours(w.end)}`}
                      </Type>
                    </div>
                  ))}
                </div>
              </Drawer>
            </div>
          )}

          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="min-w-0">
              <Type variant="metric-label" as="p" className="text-[1.05rem] font-semibold text-slate-400">Ausencias justificadas</Type>
              <Type variant="metric-value" as="p" className="mt-1 text-[1.15rem]">
                Días hábiles aplicados
              </Type>
            </div>
            <div className="min-w-0 sm:text-right">
              <Type variant="metric-value" as="p" className="text-[1.6rem] font-semibold leading-none text-[#a31111] sm:text-right">
                {employeeAbsenceUsedDays ?? 0}
              </Type>
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="min-w-0">
              <Type variant="metric-label" as="p" className="text-[1.05rem] font-semibold text-slate-400">Vacaciones</Type>
              <Type variant="metric-value" as="p" className="mt-1 text-[1.15rem]">
                {`${employeeVacationRequests?.length ?? 0} Solicitudes`}
              </Type>
            </div>
            <div className="min-w-0 sm:text-right">
              <Type variant="metric-value" as="p" className="text-[1.3rem] font-semibold leading-none text-[#24375e] sm:text-right">
                {`${totalWorkDaysFromApprovedVacationRequests(employeeVacationRequests, employeeWorkdays)} / 12`}
              </Type>
            </div>
          </div>

        </div>
      )}

      {/* Modo edición */}
      {isEditing && canEdit && (
        loadingCatalogues ? (
          <div className="py-8 flex justify-center"><Loader size="lg" /></div>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <SelectField
                  label="Puesto" id="roleId"
                  value={adminForm.roleId}
                  onChange={(e) => setAdminField("roleId", e.target.value)}
                  options={roleOptions}
                  placeholder="Selecciona un puesto"
                  labelColor="text-slate-500"
                  error={!!errors.roleId}
                />
                <div className="min-h-5">
                  {errors.roleId && <ErrorText>{errors.roleId}</ErrorText>}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <SelectField
                  label="Tipo de contrato" id="type"
                  value={adminForm.type}
                  onChange={(e) => setAdminField("type", e.target.value)}
                  options={TIPOS}
                  placeholder="Selecciona tipo"
                  labelColor="text-slate-500"
                  error={!!errors.type}
                />
                <div className="min-h-5">
                  {errors.type && <ErrorText>{errors.type}</ErrorText>}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Type variant="metric-label" as="p">Salario (MXN)</Type>
                <TextField
                  id="salary" inputMode="numeric"
                  value={adminForm.salary}
                  setValue={(v) => setAdminField("salary", v)}
                  placeholder="Ej: 15000"
                  labelClassName="hidden" text=""
                />
                <div className="min-h-5">
                  {errors.salary && <ErrorText>{errors.salary}</ErrorText>}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <SelectField
                  label="Frecuencia de pago" id="frequencyOfPaymentId"
                  value={adminForm.frequencyOfPaymentId}
                  onChange={(e) => setAdminField("frequencyOfPaymentId", e.target.value)}
                  options={[
                    { value: "", label: "Sin asignar" },
                    ...(frecuentPaymentTypes ?? []).map((f) => ({
                      value: f.optionId,
                      label: f.name.charAt(0).toUpperCase() + f.name.slice(1),
                    })),
                  ]}
                  placeholder="Selecciona frecuencia"
                  labelColor="text-slate-500"
                  error={!!errors.frequencyOfPaymentId}
                />
                <div className="min-h-5">
                  {errors.frequencyOfPaymentId && (
                    <ErrorText>{errors.frequencyOfPaymentId}</ErrorText>
                  )}
                </div>
              </div>
            </div>

            {adminForm.selectedWorkdays.length > 0 && (
              <div>
                <Type variant="metric-label" as="p" className="mb-2">
                  Días y horario de trabajo
                </Type>
                <div className="flex flex-col gap-1.5">
                  {adminForm.selectedWorkdays.map((w) => (
                    <div
                      key={w.workdayId}
                      className={`flex flex-col gap-3 rounded-lg px-3 py-3 transition-colors sm:flex-row sm:items-center ${
                        w.selected ? "bg-slate-50 border border-slate-200" : ""
                      }`}
                    >
                      <label className="flex w-full cursor-pointer items-center gap-2 sm:w-32 sm:shrink-0">
                        <input
                          type="checkbox"
                          checked={w.selected}
                          onChange={() => toggleWorkday(w.workdayId)}
                          className="h-4 w-4 rounded border-slate-300 accent-slate-800"
                        />
                        <span className="text-sm font-semibold text-slate-700">{w.name}</span>
                      </label>
                      {w.selected && (
                        <div className="grid w-full grid-cols-1 gap-2">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="w-full sm:w-[208px]">
                              <TimeField
                                value={w.start}
                                onChange={(value) => setWorkdayTime(w.workdayId, "start", value)}
                                placeholder="--:--"
                                stepMinutes={30}
                                disabled={w.allDay}
                              />
                            </div>
                            <span className="hidden text-slate-400 text-xs sm:inline">—</span>
                            <div className="w-full sm:w-[208px]">
                              <TimeField
                                value={w.end}
                                onChange={(value) => setWorkdayTime(w.workdayId, "end", value)}
                                minTime={w.start}
                                placeholder="--:--"
                                stepMinutes={30}
                                disabled={w.allDay}
                              />
                            </div>
                          </div>
                          <div className="pl-0 sm:pl-1">
                            <CheckboxField
                              id={`all-day-workday-${w.workdayId}`}
                              label="Turno de 24 horas"
                              checked={Boolean(w.allDay)}
                              onChange={(checked) => setWorkdayAllDay(w.workdayId, checked)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="min-h-5">
                  {errors.workdays && <ErrorText>{errors.workdays}</ErrorText>}
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default EmployeeAdminCard;
