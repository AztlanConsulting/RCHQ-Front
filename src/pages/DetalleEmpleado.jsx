import { useParams, useNavigate } from "react-router-dom";
import Loader from "../components/atoms/loader";
import Drawer from "../components/atoms/drawer";
import { useDrawer } from "@/hooks/atoms/useDrawer";
import { Tabs } from "../components/molecules/tabs";
import NativeSelect from "../components/atoms/nativeSelect";
import Chip from "../components/atoms/chip";
import Alert from "../components/atoms/alerts";
import Type from "../components/atoms/type";
import { 
  totalWorkDaysFromApprovedVacationRequests,
  countWorkdayDays,
  countWorkdaysHours,
  parseUTCDateToHours,
} from "@/utils/detalle-empleado.utils";
import { useEmployeeDetail } from "@/hooks/pages/useEmployeeDetail";
import DocumentsSection from "../components/organism/documentsSection";
import { useDocuments } from "../hooks/organism/useDocuments";

const AVATAR_PLACEHOLDER = "/user-circle.svg";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "expediente", label: "Expediente" },
];

const DetalleEmpleado = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const {
    employee,
    employeeAddress,
    employeeHouse,
    employeeFaults,
    employeeWorkdays,
    employeeVacationRequests,
    isLoading,
    currentTab,
    setCurrentTab,
    error,
    alert,
  } = useEmployeeDetail(employeeId);
  const {
    documents,
    loadingDocs,
    fetchError,
    showUploadModal,
    modalLoading,
    modalError,
    docToDelete,
    deletingId,
    successMessage,
    canModify,
    conflictDocument,
    setDocToDelete,
    handleDeleteConfirm,
    handleOpenEdit,
    handleOpenUpload,
    handleCloseModal,
    handleConflictConfirm,
    handleConflictCancel,
    isEditing,
    documentType,
    fileName,
    handleFileChange,
    displayError,
    handleModalSubmit,
  } = useDocuments(employeeId);
  const infoDrawer = useDrawer();
  const workdaysDrawer = useDrawer();

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
      <div className="flex items-baseline gap-2">
        <div>
          <button
            type="button"
            onClick={() => navigate("/app/personal")}
            className="rounded-lg p-2 hover:bg-slate-100 transition-colors"
            // aria-label={isDrawerOpen ? "Cerrar información adicional" : "Ver más información"}
          >
            <svg
              className={`w-5 h-5 text-slate-600 transition-transform duration-300 rotate-90`}
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
          onSelectionChange={(key) => setCurrentTab(key)}
          className="w-max max-md:hidden ml-6"
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
                employee?.picture?.trim()
                  ? employee.picture
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
              <Chip active={employee?.isActive ?? false} />
            </div>
          </div>
        </div>

        {/* Second column for the text information, broken into 2 columns */}
        <div className="flex min-w-0 flex-1 flex-col gap-6 justify-between">
          {/* Top row for name/house and edit button, columns */}
          <div className="h-full flex justify-between">
            {/* Name/House */}
            <div className="w-full min-w-0">
              <Type variant="page-title" as="h2">
                {`${employee?.name ?? ""} ${employee?.surname ?? ""}`}
              </Type>
              <Type variant="subtitle" as="p" className="mt-1">
                {employeeHouse?.name
                  ? "Casa - " + String(employeeHouse.name)
                  : ""}
                {/* `${employee?.role ?? "Sin role"} - ${employeeHouse?.name}`} */}
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
          <div className="w-[97%] mr-auto flex flex-wrap justify-between">
            <div className="basis-1/4">
              <Type variant="metric-label" as="p">
                Puesto
              </Type>
              <Type variant="metric-value" as="p" className="mt-0.5">
                {employee?.role
                  ? String(employee.role).slice(0, 1).toUpperCase() +
                    String(employee.role).slice(1)
                  : "N/A"}
              </Type>
            </div>
            <div className="basis-1/4">
              <Type variant="metric-label" as="p">
                Fecha de Nacimiento
              </Type>
              <Type variant="metric-value" as="p" className="mt-0.5">
                {employee?.birthDate
                  ? String(employee.birthDate).slice(0, 10)
                  : "N/A"}
              </Type>
            </div>
            <div className="basis-1/4">
              <Type variant="metric-label" as="p">
                Fecha de Inicio
              </Type>
              <Type variant="metric-value" as="p" className="mt-0.5">
                {/* {employee?.startDate ?? "Sin fecha de I"} */}
                {employee?.startDate
                  ? String(employee.startDate).slice(0, 10)
                  : "Sin fecha de Inicio"}
              </Type>
            </div>
            <div className="basis-1/4">
              <Type variant="metric-label" as="p">
                Fecha de Terminación
              </Type>
              <Type variant="metric-value" as="p" className="mt-0.5">
                {employee?.endDate ?? "N/A"}
              </Type>
            </div>
          </div>

          {/* Collapsible Drawer */}
          <Drawer isOpen={infoDrawer.isOpen} className={infoDrawer.isOpen ? "mt-4" : ""}>
            <div className="pt-4 border-t border-slate-200">
              <div className="w-[97%] mr-auto flex flex-wrap justify-between">
              {/* gap-x-4 gap-y-3 */}
                <div className="basis-1/4">
                  <Type variant="metric-label" as="p">
                    CURP
                  </Type>
                  <Type variant="metric-value" as="p" className="mt-0.5">
                    {employee?.curp ?? "N/A"}
                  </Type>
                </div>
                <div className="basis-1/4">
                  <Type variant="metric-label" as="p">
                    NSS
                  </Type>
                  <Type variant="metric-value" as="p" className="mt-0.5">
                    {employee?.nss ?? "N/A"}
                  </Type>
                </div>
                <div className="basis-1/4">
                  <Type variant="metric-label" as="p">
                    RFC
                  </Type>
                  <Type variant="metric-value" as="p" className="mt-0.5">
                    {employee?.rfc ?? "N/A"}
                  </Type>
                </div>
                <div className="basis-1/4">
                  <Type variant="metric-label" as="p">
                    Cuenta Bancaria
                  </Type>
                  <Type variant="metric-value" as="p" className="mt-0.5">
                    {employee?.bankAccount ?? "N/A"}
                  </Type>
                </div>
              </div>
            </div>
          </Drawer>
        </div>

        {/* Toggle Button */}
        <Drawer.Toggle
          isOpen={infoDrawer.isOpen}
          onToggle={infoDrawer.toggle}
          ariaLabel={infoDrawer.isOpen ? "Cerrar información adicional" : "Ver más información"}
          className="absolute bottom-2 right-2"
        />
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
                    {employee?.email ?? "N/A"}
                  </Type>
                </div>
              </div>
              <div className="min-w-[12rem] flex-1">
                <Type variant="metric-label" as="p" className="mb-1.5">
                  Número de Telefono
                </Type>
                <div className="flex items-center rounded-lg bg-neutral-50 px-4 py-3 shadow-[inset_0px_4px_4px_#00000040]">
                  <Type variant="metric-value" as="p">
                    {employee?.phoneNumber ?? "N/A"}
                  </Type>
                </div>
              </div>
              <div className="min-w-[12rem] flex-1">
                <Type variant="metric-label" as="p" className="mb-1.5">
                  Dirección
                </Type>
                <div className="flex items-center rounded-lg bg-neutral-50 px-4 py-3 shadow-[inset_0px_4px_4px_#00000040]">
                  <Type variant="metric-value" as="p">
                    {employeeAddress?.street ?? "N/A"}
                  </Type>
                </div>
              </div>
              <div className="min-w-[12rem] flex-1">
                <Type variant="metric-label" as="p" className="mb-1.5">
                  Código Postal
                </Type>
                <div className="flex items-center rounded-lg bg-neutral-50 px-4 py-3 shadow-[inset_0px_4px_4px_#00000040]">
                  <Type variant="metric-value" as="p">
                    {employeeAddress?.postalCode ?? "N/A"}
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
                    {employee?.type
                      ? String(employee.type)
                          .slice(0, 1)
                          .toUpperCase() +
                        String(employee.type).slice(1)
                      : "N/A"}
                  </Type>
                </div>
                <div className="text-right">
                  <Type variant="metric-label" as="p">
                    Salario
                  </Type>
                  <Type variant="metric-value" as="p" className="mt-0.5">
                    {employee?.salary
                      ? "$" + employee.salary
                      : "N/A"}
                  </Type>
                </div>
              </div>

              <div className="w-full flex justify-between">
                <div>
                  <Type variant="metric-label" as="p">
                    Días Trabajados
                  </Type>
                  <Type variant="metric-value" as="p" className="mt-0.5">
                      {employeeWorkdays ? countWorkdayDays(employeeWorkdays) : 0}
                  </Type>
                </div>
                <div className="flex items-start gap-2 text-right">
                  <Drawer.Toggle
                    isOpen={workdaysDrawer.isOpen}
                    onToggle={workdaysDrawer.toggle}
                    ariaLabel={workdaysDrawer.isOpen ? "Cerrar horario" : "Ver horario"}
                  />
                  <div>
                    <Type variant="metric-label" as="p">
                      Horas Semanales
                    </Type>
                    <Type variant="metric-value" as="p" className="mt-0.5">
                      {employeeWorkdays ? countWorkdaysHours(employeeWorkdays) : 0}
                    </Type>
                  </div>
                </div>
              </div>

              <Drawer isOpen={workdaysDrawer.isOpen} className={workdaysDrawer.isOpen ? "mt-1" : ""}>
                    <ul>
                      {employeeWorkdays?.length > 0 && (
                        employeeWorkdays.map(workday => (
                           (
                            <div className="w-full flex justify-between">
                              <Type variant="metric-label">
                                {workday.name}  
                              </Type>
                              <Type variant="metric-label">
                                {`${parseUTCDateToHours(workday.start)} - ${parseUTCDateToHours(workday.end)}`}
                              </Type>
                            </div>
                          )
                        ))
                      )}
                      <div className="w-full flex">

                      </div>
                    </ul>
                </Drawer>

              <div className="w-full flex justify-between">
                <div>
                  <Type variant="metric-label" as="p">
                    Vacaciones
                  </Type>
                  <Type variant="metric-value" as="p" className="mt-0.5">
                    {`${employeeVacationRequests?.length ?? 0} Solicitudes`}
                  </Type>
                </div>
                <div className="text-right">
                  <Type variant="metric-label" as="p">
                    Días
                  </Type>
                  <Type variant="metric-value" as="p" className="mt-0.5">
                    {`${
                      employeeVacationRequests
                        ? totalWorkDaysFromApprovedVacationRequests(
                            employeeVacationRequests,
                            employeeWorkdays,
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
                    {employeeFaults?.length ?? 0}
                  </Type>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      )}
      {currentTab == "expediente" && (
        <DocumentsSection
          documents={documents}
          loadingDocs={loadingDocs}
          fetchError={fetchError}
          successMessage={successMessage}
          canModify={canModify}
          deletingId={deletingId}
          docToDelete={docToDelete}
          conflictDocument={conflictDocument}
          showUploadModal={showUploadModal}
          isEditing={isEditing}
          documentType={documentType}
          fileName={fileName}
          displayError={displayError}
          modalError={modalError}
          modalLoading={modalLoading}
          handleOpenUpload={handleOpenUpload}
          handleCloseModal={handleCloseModal}
          handleFileChange={handleFileChange}
          handleSubmit={handleModalSubmit}
          handleOpenEdit={handleOpenEdit}
          setDocToDelete={setDocToDelete}
          handleDeleteConfirm={handleDeleteConfirm}
          handleConflictConfirm={handleConflictConfirm}
          handleConflictCancel={handleConflictCancel}
        />
      )}
    </div>
  );
};

export default DetalleEmpleado;
