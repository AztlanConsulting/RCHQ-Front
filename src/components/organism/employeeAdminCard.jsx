import Type from "../atoms/type";
import Loader from "../atoms/loader";
import Drawer from "../atoms/drawer";
import SelectField from "../atoms/selectField";
import TextField from "../atoms/textField";
import {
  countWorkdayDays,
  countWorkdaysHours,
  parseUTCDateToHours,
  totalWorkDaysFromApprovedVacationRequests,
} from "@/utils/detalle-empleado.utils";

const TIPOS = [
  { value: "Nomina", label: "Nómina" },
  { value: "Asalariado",    label: "Asalariado" },
  { value: "Honorarios",      label: "Honorarios" },
  { value: "Voluntariado",    label: "Voluntariado" },
];

const isAdminRole = (roleName = "") =>
  String(roleName)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .includes("Administrador");

const EmployeeAdminCard = ({
  employee,
  employeeWorkdays,
  employeeVacationRequests,
  employeeFaults,
  workdaysDrawer,
  isEditing,
  loadingCatalogues,
  adminForm,
  roles,
  frecuentPaymentTypes,
  setAdminField,
  toggleWorkday,
  setWorkdayTime,
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
        <Type variant="section-title" as="h3">Información Administrativa</Type>

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
        <div className="mt-4 w-full flex flex-col gap-4">
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-x-4">
            <div className="min-w-0">
              <Type variant="metric-label" as="p">Tipo</Type>
              <Type variant="metric-value" as="p" className="mt-0.5">
                {employee?.type ?? "N/A"}
              </Type>
            </div>
              <div className="min-w-0 sm:text-right">
              <Type variant="metric-label" as="p">Frecuencia de Pago</Type>
              <Type variant="metric-value" as="p" className="mt-0.5">
                {employee?.frequencyOfPaymentName ?? "N/A"}
              </Type>
            </div>
            <div className="min-w-0 sm:text-right">
              <Type variant="metric-label" as="p">Salario</Type>
              <Type variant="metric-value" as="p" className="mt-0.5">
                {employee?.salary ? `$${employee.salary}` : "N/A"}
              </Type>
            </div>
          </div>

          <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-between sm:gap-2">
            <div>
              <Type variant="metric-label" as="p">Días Trabajados</Type>
              <Type variant="metric-value" as="p" className="mt-0.5">
                {countWorkdayDays(employeeWorkdays)}
              </Type>
            </div>
            <div className="min-w-0 sm:ml-auto sm:text-right">
              <div className="flex flex-row items-center justify-between gap-2 sm:justify-end">
                <Type variant="metric-label" as="p">Horas Semanales</Type>
                <Drawer.Toggle
                  isOpen={workdaysDrawer.isOpen}
                  onToggle={workdaysDrawer.toggle}
                  ariaLabel={workdaysDrawer.isOpen ? "Cerrar horario" : "Ver horario"}
                  className="shrink-0"
                />
              </div>
              <Type variant="metric-value" as="p" className="mt-0.5 sm:text-right">
                {countWorkdaysHours(employeeWorkdays)}
              </Type>
            </div>
          </div>

          <Drawer isOpen={workdaysDrawer.isOpen} className={workdaysDrawer.isOpen ? "mt-1" : ""}>
            <div className="flex flex-col gap-1">
              {employeeWorkdays?.length > 0 && employeeWorkdays.map((w) => (
                <div key={w.workdayId} className="w-full flex justify-between">
                  <Type variant="metric-label">{w.name}</Type>
                  <Type variant="metric-label">
                    {`${parseUTCDateToHours(w.start)} - ${parseUTCDateToHours(w.end)}`}
                  </Type>
                </div>
              ))}
            </div>
          </Drawer>

          <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-between">
            <div className="min-w-0">
              <Type variant="metric-label" as="p">Vacaciones</Type>
              <Type variant="metric-value" as="p" className="mt-0.5">
                {`${employeeVacationRequests?.length ?? 0} Solicitudes`}
              </Type>
            </div>
            <div className="min-w-0 sm:text-right">
              <Type variant="metric-label" as="p">Días</Type>
              <Type variant="metric-value" as="p" className="mt-0.5">
                {`${totalWorkDaysFromApprovedVacationRequests(employeeVacationRequests, employeeWorkdays)} / 12 Usados`}
              </Type>
            </div>
          </div>

          <div>
            <Type variant="metric-label" as="p">Faltas</Type>
            <Type variant="metric-value" as="p" className="mt-0.5">
              {employeeFaults?.length ?? 0}
            </Type>
          </div>
        </div>
      )}

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
              <div>
                <Type variant="metric-label" as="p" className="mb-2">
                  Días y horario de trabajo
                </Type>
                <div className="flex flex-col gap-1.5">
                  {adminForm.selectedWorkdays.map((w) => (
                    <div
                      key={w.workdayId}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                        w.selected ? "bg-slate-50 border border-slate-200" : ""
                      }`}
                    >
                      <label className="flex items-center gap-2 cursor-pointer w-28 shrink-0">
                        <input
                          type="checkbox"
                          checked={w.selected}
                          onChange={() => toggleWorkday(w.workdayId)}
                          className="h-4 w-4 rounded border-slate-300 accent-slate-800"
                        />
                        <span className="text-sm font-semibold text-slate-700">{w.name}</span>
                      </label>
                      {w.selected && (
                        <div className="flex items-center gap-2">
                          <input
                            type="time" value={w.start}
                            onChange={(e) => setWorkdayTime(w.workdayId, "start", e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-slate-400"
                          />
                          <span className="text-slate-400 text-xs">—</span>
                          <input
                            type="time" value={w.end}
                            onChange={(e) => setWorkdayTime(w.workdayId, "end", e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-slate-400"
                          />
                        </div>
                      )}
                    </div>
                  ))}
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
