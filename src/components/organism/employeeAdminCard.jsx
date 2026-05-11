import Type from "../atoms/type";
import Loader from "../atoms/loader";
import SelectField from "../atoms/selectField";
import TextField from "../atoms/textField";
import Drawer from "../atoms/drawer";
import WorkdayScheduleGrid from "./workdayScheduleGrid";
import {
  countWorkdayDays,
  countWorkdaysHours,
  parseUTCDateToHours,
  totalWorkDaysFromApprovedVacationRequests,
} from "@/utils/detalle-empleado.utils";

const TIPOS = [
  { value: "Nomina",       label: "Nómina" },
  { value: "Asalariado",   label: "Asalariado" },
  { value: "Honorarios",   label: "Honorarios" },
  { value: "Voluntariado", label: "Voluntariado" },
];

const EmployeeAdminCard = ({
  employee,
  employeeWorkdays,
  employeeVacationRequests,
  employeeFaults,
  workdaysDrawer,
  isEditing,
  loadingCatalogues,
  adminForm,
  setAdminFormState,
  roles,
  houses,
  frecuentPaymentTypes,
  setAdminField,
  saving,
  saveError,
  onOpenEdit,
  onSubmit,
  onCancel,
  houseEmployees,
}) => {
  return (
    <div className="basis-2/3 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex justify-between items-start">
        <Type variant="section-title" as="h3">Información Administrativa</Type>

        {isEditing ? (
          <div className="flex gap-2 shrink-0">
            <button
              type="button" onClick={onCancel} disabled={saving}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button" onClick={onSubmit} disabled={saving || loadingCatalogues}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
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

      {/* ── Modo lectura ── */}
      {!isEditing && (
        <div className="mt-4 w-full flex flex-col gap-4">
          <div className="w-full flex justify-between">
            <div>
              <Type variant="metric-label" as="p">Tipo</Type>
              <Type variant="metric-value" as="p" className="mt-0.5">
                {employee?.type ?? "N/A"}
              </Type>
            </div>
            <div className="text-right">
              <Type variant="metric-label" as="p">Frecuencia de Pago</Type>
              <Type variant="metric-value" as="p" className="mt-0.5">
                {employee?.frequencyOfPaymentName ?? "N/A"}
              </Type>
            </div>
            <div className="text-right">
              <Type variant="metric-label" as="p">Salario</Type>
              <Type variant="metric-value" as="p" className="mt-0.5">
                {employee?.salary ? `$${employee.salary}` : "N/A"}
              </Type>
            </div>
          </div>

          <div className="w-full flex justify-between">
            <div>
              <Type variant="metric-label" as="p">Días Trabajados</Type>
              <Type variant="metric-value" as="p" className="mt-0.5">
                {countWorkdayDays(employeeWorkdays)}
              </Type>
            </div>
            <div className="flex items-start gap-2 text-right">
              <Drawer.Toggle
                isOpen={workdaysDrawer.isOpen}
                onToggle={workdaysDrawer.toggle}
                ariaLabel={workdaysDrawer.isOpen ? "Cerrar horario" : "Ver horario"}
              />
              <div>
                <Type variant="metric-label" as="p">Horas Semanales</Type>
                <Type variant="metric-value" as="p" className="mt-0.5">
                  {countWorkdaysHours(employeeWorkdays)}
                </Type>
              </div>
            </div>
          </div>

          <Drawer isOpen={workdaysDrawer.isOpen} className={workdaysDrawer.isOpen ? "mt-1" : ""}>
            <div className="flex flex-col gap-1">
              {employeeWorkdays?.length > 0 && employeeWorkdays.map((w) => (
                <div key={w.workdayId} className="w-full flex justify-between">
                  <Type variant="metric-label">{w.name}</Type>
                  <Type variant="metric-label">
                    {`${parseUTCDateToHours(w.start)} – ${parseUTCDateToHours(w.end)}`}
                  </Type>
                </div>
              ))}
            </div>
          </Drawer>

          <div className="w-full flex justify-between">
            <div>
              <Type variant="metric-label" as="p">Vacaciones</Type>
              <Type variant="metric-value" as="p" className="mt-0.5">
                {`${employeeVacationRequests?.length ?? 0} Solicitudes`}
              </Type>
            </div>
            <div className="text-right">
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

      {/* ── Modo edición ── */}
      {isEditing && (
        loadingCatalogues ? (
          <div className="py-8 flex justify-center"><Loader size="lg" /></div>
        ) : (
          <div className="mt-4 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Casa" id="houseId"
                value={adminForm.houseId}
                onChange={(e) => setAdminField("houseId", e.target.value)}
                options={houses.map((h) => ({ value: h.houseId, label: h.name }))}
                placeholder="Selecciona una casa"
                labelColor="text-slate-500"
              />
              <SelectField
                label="Puesto" id="roleId"
                value={adminForm.roleId}
                onChange={(e) => setAdminField("roleId", e.target.value)}
                options={roles.map((r) => ({ value: r.roleId, label: r.name }))}
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

              <div className="flex flex-col gap-2">
              <Type variant="metric-label" as="p">Días y horario de trabajo</Type>
              <WorkdayScheduleGrid
                adminForm={adminForm}
                setAdminFormState={setAdminFormState}
                houseEmployees={houseEmployees ?? []}
              />
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default EmployeeAdminCard;