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
  { value: "nomina", label: "Nómina" },
  { value: "Asalariado",    label: "Asalariado" },
  { value: "Honorarios",      label: "Honorarios" },
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
  roles,
  houses,
  setAdminField,
  toggleWorkday,
  setWorkdayTime,
  saving,
  saveError,
  onOpenEdit,
  onSubmit,
  onCancel,
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

      {/* Modo lectura */}
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
                    {`${parseUTCDateToHours(w.start)} - ${parseUTCDateToHours(w.end)}`}
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

      {isEditing && (
        loadingCatalogues ? (
          <div className="py-8 flex justify-center"><Loader size="lg" /></div>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
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