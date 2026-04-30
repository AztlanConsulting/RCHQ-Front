import { useParams } from "react-router-dom";
import { useState } from "react";
import Loader from "../Components/Atoms/Loader";
import { Tabs } from "../Components/Molecules/Tabs";
import NativeSelect from "../Components/Atoms/NativeSelect";
import Chip from "../Components/Atoms/Chip";
import Alert from "../Components/Atoms/Alerts";
import Type from "../Components/Atoms/Type";
import { totalWorkDaysFromApprovedVacationRequests } from "@/utils/detalle-empleado.utils";
import { useEmployeeDetail } from "@/hooks/Pages/useEmployeeDetail";

const AVATAR_PLACEHOLDER = "/user-circle.svg";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "expediente", label: "Expediente" },
];

const DetalleEmpleado = () => {
  const { employeeId } = useParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    employeeBasicInfo,
    employeeAdminInfo,
    employeeRecord,
    isLoading,
    currentTab,
    setCurrentTab,
    error,
    alert,
  } = useEmployeeDetail(employeeId);

  if (isLoading) return <Loader />;

  return (
    <div className="flex flex-col gap-4 text-black">
      {/* Notificación de éxito */}
      {alert && alert.message && (
        <div className="mb-4 fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <Alert type={alert?.type} message={alert?.message} />
        </div>
      )}

      {/* Row for Page Title and Tabs */}
      <div className="flex items-end gap-4">
        <Type variant="page-title" as="h2">
          Gestión de Empleados
        </Type>

        <NativeSelect
          size="sm"
          aria-label="Tabs"
          value={currentTab}
          onChange={(event) => setCurrentTab(event.target.value)}
          options={tabs.map((tab) => ({ label: tab.label, value: tab.id }))}
          className="w-80 md:hidden"
        />
        <Tabs
          selectedKey={currentTab}
          onSelectionChange={setCurrentTab}
          className="w-max max-md:hidden"
        >
          <Tabs.List type="underline" items={tabs}>
            {(tab) => <Tabs.Item {...tab} />}
          </Tabs.List>
        </Tabs>
      </div>

      {/* Box/Section for Basic Employee Info, Persistent across tabs */}
      <div className="relative w-full flex p-3 items-center rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* First column: avatar + status chip; second: text metrics */}
        <div className="flex shrink-0 mr-8">
          <div className="relative h-28 w-28 shrink-0 sm:h-32 sm:w-32">
            <img
              src={
                employeeBasicInfo?.picture?.trim()
                  ? employeeBasicInfo.picture
                  : AVATAR_PLACEHOLDER
              }
              alt=""
              className="h-full w-full object-cover rounded-full ring-1 ring-slate-200"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = AVATAR_PLACEHOLDER;
              }}
            />
            <div className="absolute bottom-1 right-1 z-10">
              <Chip active={employeeBasicInfo?.isActive ?? false} />
            </div>
          </div>
        </div>

        {/* Second column for the text information, broken into 2 columns */}
        <div className="flex min-w-0 flex-1 flex-col gap-6 justify-between">
          {/* Top row for name/house and edit button, columns */}
          <div className="h-full flex justify-between">
            {/* Name/House */}
            <div className="w-full min-w-0">
              <Type variant="display-name" as="h3">
                {`${employeeBasicInfo?.name ?? ""} ${employeeBasicInfo?.surname ?? ""}`}
              </Type>
              <Type variant="subtitle" as="p" className="mt-1">
                {employeeBasicInfo?.house?.name
                  ? "Casa - " + String(employeeBasicInfo.house.name)
                  : ""}
                {/* `${employeeBasicInfo?.role ?? "Sin role"} - ${employeeBasicInfo?.house?.name}`} */}
              </Type>
            </div>

            {/* Edit button */}
            <div>
              <button
                type="button"
                aria-label="Editar"
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <img src="/edit.svg" alt="" className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Bottom Row for text-like metrics */}
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-3">
            <div>
              <Type variant="metric-label" as="p">
                Puesto
              </Type>
              <Type variant="metric-value" as="p" className="mt-0.5">
                {employeeBasicInfo?.role
                  ? String(employeeBasicInfo.role).slice(0, 1).toUpperCase() + String(employeeBasicInfo.role).slice(1)
                  : "N/A"}
              </Type>
            </div>
            <div>
              <Type variant="metric-label" as="p">
                Fecha de Nacimiento
              </Type>
              <Type variant="metric-value" as="p" className="mt-0.5">
                {employeeBasicInfo?.birthDate
                  ? String(employeeBasicInfo.birthDate).slice(0, 10)
                  : "N/A"}
              </Type>
            </div>
            <div>
              <Type variant="metric-label" as="p">
                Fecha de Inicio
              </Type>
              <Type variant="metric-value" as="p" className="mt-0.5">
                {/* {employeeBasicInfo?.startDate ?? "Sin fecha de I"} */}
                {employeeBasicInfo?.startDate
                  ? String(employeeBasicInfo.startDate).slice(0, 10)
                  : "Sin fecha de Inicio"}
              </Type>
            </div>
            <div>
              <Type variant="metric-label" as="p">
                Fecha de Terminación
              </Type>
              <Type variant="metric-value" as="p" className="mt-0.5">
                {employeeBasicInfo?.end ?? "N/A"}
              </Type>
            </div>
          </div>

          {/* Collapsible Drawer */}
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isDrawerOpen ? "max-h-32 opacity-100 mt-4" : "max-h-0 opacity-0"
            }`}
          >
            <div className="pt-4 border-t border-slate-200">
              <div className="flex flex-wrap justify-between gap-x-4 gap-y-3">
                <div>
                  <Type variant="metric-label" as="p">
                    NSS
                  </Type>
                  <Type variant="metric-value" as="p" className="mt-0.5">
                    {employeeBasicInfo?.nss ?? "N/A"}
                  </Type>
                </div>
                <div>
                  <Type variant="metric-label" as="p">
                    RFC
                  </Type>
                  <Type variant="metric-value" as="p" className="mt-0.5">
                    {employeeBasicInfo?.rfc ?? "N/A"}
                  </Type>
                </div>
                <div>
                  <Type variant="metric-label" as="p">
                    CURP
                  </Type>
                  <Type variant="metric-value" as="p" className="mt-0.5">
                    {employeeBasicInfo?.curp ?? "N/A"}
                  </Type>
                </div>
                <div>
                  <Type variant="metric-label" as="p">
                    Cuenta Bancaria
                  </Type>
                  <Type variant="metric-value" as="p" className="mt-0.5">
                    {employeeBasicInfo?.bankAccount ?? "N/A"}
                  </Type>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="absolute bottom-2 right-2 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label={isDrawerOpen ? "Cerrar información adicional" : "Ver más información"}
        >
          <svg
            className={`w-5 h-5 text-slate-600 transition-transform duration-300 ${
              isDrawerOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Final row, box depends on currentTab */}
      {/* Either the basic/admin info boxes or record/expediente box */}
      {currentTab == "overview" && (
        <div className="flex gap-4">
          {/* Basic Info Box */}
          <div className="basis-1/3 p-2 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex justify-between">
              <Type variant="section-title" as="h3">
                Contacto
              </Type>
              <div>
                <button
                  type="button"
                  aria-label="Editar"
                  className="rounded-lg p-2 hover:bg-slate-100"
                >
                  <img src="/edit.svg" alt="" className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              <div className="min-w-[12rem] flex-1">
                <Type variant="metric-label" as="p" className="mb-1.5">
                  Correo Electronico
                </Type>
                <div className="flex items-center rounded-lg bg-neutral-50 px-4 py-2 shadow-[inset_0px_4px_4px_#00000040]">
                  <Type variant="metric-value" as="p">
                    {employeeBasicInfo?.email ?? "N/A"}
                  </Type>
                </div>
              </div>
              <div className="min-w-[12rem] flex-1">
                <Type variant="metric-label" as="p" className="mb-1.5">
                  Número de Telefono
                </Type>
                <div className="flex items-center rounded-lg bg-neutral-50 px-4 py-3 shadow-[inset_0px_4px_4px_#00000040]">
                  <Type variant="metric-value" as="p">
                    {employeeBasicInfo?.phoneNumber ?? "N/A"}
                  </Type>
                </div>
              </div>
              <div className="min-w-[12rem] flex-1">
                <Type variant="metric-label" as="p" className="mb-1.5">
                  Dirección
                </Type>
                <div className="flex items-center rounded-lg bg-neutral-50 px-4 py-3 shadow-[inset_0px_4px_4px_#00000040]">
                  <Type variant="metric-value" as="p">
                    {employeeBasicInfo?.address?.street ?? "N/A"}
                  </Type>
                </div>
              </div>
              <div className="min-w-[12rem] flex-1">
                <Type variant="metric-label" as="p" className="mb-1.5">
                  Código Postal
                </Type>
                <div className="flex items-center rounded-lg bg-neutral-50 px-4 py-3 shadow-[inset_0px_4px_4px_#00000040]">
                  <Type variant="metric-value" as="p">
                    {employeeBasicInfo?.address?.postalCode ?? "N/A"}
                  </Type>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Info Box */}
          <div className="basis-2/3 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex justify-between">
              <Type variant="section-title" as="h3">
                Información Administrativa
              </Type>
              <div>
                <button
                  type="button"
                  aria-label="Editar"
                  className="rounded-lg p-2 hover:bg-slate-100"
                >
                  <img src="/edit.svg" alt="" className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 w-full flex flex-col gap-4">
              <div className="w-full flex justify-between">
                <div>
                  <Type variant="metric-label" as="p">
                    Tipo
                  </Type>
                  <Type variant="metric-value" as="p" className="mt-0.5">
                    {employeeBasicInfo?.type
                      ? String(employeeBasicInfo.type)
                          .slice(0, 1)
                          .toUpperCase() +
                        String(employeeBasicInfo.type).slice(1)
                      : "N/A"}
                  </Type>
                </div>
                <div className="text-right">
                  <Type variant="metric-label" as="p">
                    Salario
                  </Type>
                  <Type variant="metric-value" as="p" className="mt-0.5">
                    {employeeBasicInfo?.salary
                      ? "$" + employeeBasicInfo.salary
                      : "N/A"}
                  </Type>
                </div>
              </div>

              <div className="w-full flex justify-between">
                <div>
                  <Type variant="metric-label" as="p">
                    Horario
                  </Type>
                  <Type variant="metric-value" as="p" className="mt-0.5">
                    {employeeAdminInfo?.workdays?.[0]?.name ?? "Sin horario definido"}
                  </Type>
                </div>
                <div className="text-right">
                  <Type variant="metric-label" as="p">
                    Horas
                  </Type>
                  <Type variant="metric-value" as="p" className="mt-0.5">
                    {employeeAdminInfo?.workdays?.[0]?.start
                      ? String(employeeAdminInfo.workdays[0].start).slice(
                          12,
                          16,
                        ) + " - "
                      : "N/A - "}
                    {employeeAdminInfo?.workdays?.[0]?.end
                      ? String(employeeAdminInfo.workdays[0].start).slice(
                          12,
                          16,
                        )
                      : "N/A"}
                  </Type>
                </div>
              </div>

              {/* <div className="w-full flex justify-between">
                                    <div>
                                        <Type variant="metric-label" as="p">
                                            Ausencias
                                        </Type>
                                        <Type variant="metric-value" as="p" className="mt-0.5">
                                            {employeeAdminInfo?.start ?? "Sin fecha de I"}
                                        </Type>
                                    </div>
                                    <div>
                                        <Type variant="metric-label" as="p">
                                            Numero
                                        </Type>
                                        <Type variant="metric-value" as="p" className="mt-0.5">
                                            {employeeAdminInfo?.start ?? "Sin fecha de I"}
                                        </Type>
                                    </div>
                                </div> */}

              <div className="w-full flex justify-between">
                <div>
                  <Type variant="metric-label" as="p">
                    Vacaciones
                  </Type>
                  <Type variant="metric-value" as="p" className="mt-0.5">
                    {`${employeeAdminInfo?.vacationRequests?.length ?? 0} Solicitudes`}
                  </Type>
                </div>
                <div className="text-right">
                  <Type variant="metric-label" as="p">
                    Días
                  </Type>
                  <Type variant="metric-value" as="p" className="mt-0.5">
                    {`${
                      employeeAdminInfo?.vacationRequests
                        ? totalWorkDaysFromApprovedVacationRequests(
                            employeeAdminInfo.vacationRequests,
                          )
                        : "0"
                    } / 12 Usados`}
                  </Type>
                </div>
              </div>

              <div className="w-full flex justify-between">
                <div>
                  <Type variant="metric-label" as="p">
                    Faltas
                  </Type>
                  <Type variant="metric-value" as="p" className="mt-0.5">
                    {employeeAdminInfo?.faults?.length ?? 0}
                  </Type>
                </div>
                {/* <div>
                                        <Type variant="metric-label" as="p">
                                            Numero
                                        </Type>
                                        <Type variant="metric-value" as="p" className="mt-0.5">
                                            {employeeAdminInfo?.start ?? "Sin fecha de I"}
                                        </Type>
                                    </div> */}
              </div>
            </div>
          </div>
        </div>
      )}
      {currentTab == "expediente" && <div>Expediente</div>}
    </div>
  );
};

export default DetalleEmpleado;
