import Type from "../atoms/type";
import Loader from "../atoms/loader";
import Drawer from "../atoms/drawer";
import SelectField from "../atoms/selectField";
import TextField from "../atoms/textField";
import EmployeeScheduleCalendar from "./employeeScheduleCalendar";
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

const formatContractTypeLabel = (value) => {
  if (!value) return "N/A";
  if (value === "Nomina") return "Nómina";
  return value;
};

const EmployeeAdminCard = ({
  employee,
  employeeWorkdays,
  employeeVacationRequests,
  employeeAbsenceUsedDays,
  referenceSchedules,
  visibleReferenceEmployeeIds,
  workdaysDrawer,
  isEditing,
  loadingCatalogues,
  adminForm,
  roles,
  frecuentPaymentTypes,
  setAdminField,
  toggleWorkday,
  setWorkdayTime,
  toggleReferenceSchedule,
  copyReferenceSchedule,
  applyScheduleSelection,
  clearScheduleSelection,
  saving,
  saveError,
  onOpenEdit,
  onSubmit,
  onCancel,
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
      <div className="flex justify-between items-start">
        <Type variant="section-title" as="h3" className="tracking-[-0.02em]">Información Administrativa</Type>

        {isEditing ? (
          <div className="flex gap-2 shrink-0">
            <button
              type="button" onClick={onCancel} disabled={saving}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#24375e] hover:bg-[#eef3fb] disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button" onClick={onSubmit} disabled={saving || loadingCatalogues}
              className="flex items-center gap-1.5 rounded-lg bg-[#24375e] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#162d4a] active:bg-[#0f2035] disabled:opacity-50"
            >
              {saving && <Loader size="sm" />}
              Guardar
            </button>
          </div>
        ) : (
          <button
            type="button" aria-label="Editar información administrativa"
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

      {/* Modo lectura */}
      {!isEditing && (
        <div className="mt-6 w-full flex flex-col gap-7">

          {/* Fila 1: Tipo | Salario */}
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

          {/* Fila 2: Frecuencia de Pago */}
          <div className="min-w-0">
            <Type variant="metric-label" as="p" className="text-[1.05rem] font-semibold text-slate-400">Frecuencia de pago</Type>
            <Type variant="metric-value" as="p" className="mt-1 text-[1.15rem]">
              {employee?.frequencyOfPaymentName ?? "N/A"}
            </Type>
          </div>

          {/* Fila 3: Resumen de horario */}
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

          {/* Drawer días */}
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

          {/* Fila 4: Ausencias justificadas | número */}
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

          {/* Fila 5: Vacaciones | Días usados */}
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
      {isEditing && (
        loadingCatalogues ? (
          <div className="py-8 flex justify-center"><Loader size="lg" /></div>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField
                label="Puesto" id="roleId"
                value={adminForm.roleId}
                onChange={(e) => setAdminField("roleId", e.target.value)}
                options={roleOptions}
                placeholder="Selecciona un puesto"
                labelColor="text-slate-500"
              />
              <SelectField
                label="Tipo de contrato" id="type"
                value={adminForm.type}
                onChange={(e) => setAdminField("type", e.target.value)}
                options={TIPOS}
                placeholder="Selecciona tipo"
                labelColor="text-slate-500"
              />
              <div className="flex flex-col gap-1">
                <Type variant="metric-label" as="p">Salario (MXN)</Type>
                <TextField
                  id="salary" inputMode="numeric"
                  value={adminForm.salary}
                  setValue={(v) => setAdminField("salary", v)}
                  placeholder="Ej: 15000"
                  labelClassName="hidden" text=""
                />
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
                />
              </div>
            </div>
            {adminForm.selectedWorkdays.length > 0 && (
              <EmployeeScheduleCalendar
                assignedWorkdays={adminForm.selectedWorkdays}
                referenceSchedules={referenceSchedules}
                visibleReferenceEmployeeIds={visibleReferenceEmployeeIds}
                onToggleReference={toggleReferenceSchedule}
                onCopySchedule={copyReferenceSchedule}
                onSelectRange={applyScheduleSelection}
                onClearDay={clearScheduleSelection}
              />
            )}
          </div>
        )
      )}
    </div>
  );
};

export default EmployeeAdminCard;
