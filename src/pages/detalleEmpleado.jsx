import { useParams, useNavigate } from "react-router-dom";
import Loader from "../components/atoms/loader";
import Alert from "../components/atoms/alerts";
import Type from "../components/atoms/type";
import { Tabs } from "../components/molecules/tabs";
import NativeSelect from "../components/atoms/nativeSelect";
import BigButton from "../components/atoms/bigButton";
import EmployeeBasicCard from "../components/organism/employeeBasicCard";
import EmployeeContactCard from "../components/organism/employeeContactCard";
import EmployeeAdminCard from "../components/organism/employeeAdminCard";
import DocumentsSection from "../components/organism/documentsSection";
import TrainingsSection from "../components/organism/trainingsSection";
import ReasonCard from "../components/organism/reasonCard";
import { useDrawer } from "@/hooks/atoms/useDrawer";
import { useEmployeeDetail } from "@/hooks/pages/useEmployeeDetail";
import { useEditEmployee } from "@/hooks/organism/useEditEmployee";
import { useDocuments } from "../hooks/organism/useDocuments";
import { useTrainings } from "../hooks/organism/useTrainings";
import { useDeactivateEmployee } from "@/hooks/organism/useDeactivateEmployee";
import { getStoredUser } from "@/utils/authStorage";

const tabs = [
  { id: "overview",   label: "Resumen" },
  { id: "expediente", label: "Expediente" },
];

const DetalleEmpleado = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const user = getStoredUser();

  const canEdit = user?.role == "Coordinador";

  const {
    employee, employeeAddress, employeeHouse,
    employeeWorkdays, employeeVacationRequests, employeeAbsenceUsedDays,
    isLoading, currentTab, setCurrentTab,
    alert, setAlert, getEmployeeDetail,
  } = useEmployeeDetail(employeeId);

  const {
    editSection, saving, saveError, loadingCatalogues,
    basicErrors, contactErrors, adminErrors,
    basicForm, contactForm, adminForm,
    basicPicturePreview,
    roles,
    frecuentPaymentTypes,
    openBasicEdit, openContactEdit, openAdminEdit, closeEdit,
    setBasicField, setBasicPicture, setContactField, setAdminField,
    toggleWorkday, setWorkdayTime, setWorkdayAllDay,
    submitBasic, submitContact, submitAdmin,
  } = useEditEmployee(employeeId, (msg) => {
    setAlert({ type: "success", message: msg });
    getEmployeeDetail();
  });

  const {
    documents,
    documentTypes,
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
    clearFetchError,
    clearSuccessMessage,
    clearUploadError,
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

  const {
    trainings,
    loadingTrainings,
    fetchError: trainingsFetchError,
    clearFetchError: clearTrainingsFetchError,
    selectedTraining,
    openTrainingDetail,
    closeTrainingDetail,
    viewerRole,
    calendarTimeZone,
  } = useTrainings(employeeId);

  const infoDrawer     = useDrawer();
  const workdaysDrawer = useDrawer();

  const employeeFullName = employee
    ? `${employee.name ?? ""} ${employee.lastName ?? ""}`.trim()
    : "";

  const {
    isModalOpen,
    openModal,
    closeModal,
    reason,
    handleReasonChange,
    addToBlacklist,
    setAddToBlacklist,
    fieldError,
    isSubmitting,
    handleSubmit,
  } = useDeactivateEmployee(
    employeeId,
    employeeFullName,
    setAlert,
    employee?.isActive !== false,
    getEmployeeDetail,
  );

  if (isLoading) return <Loader />;

  return (
    <div className="flex flex-col gap-4 overflow-x-hidden text-black">
      {alert?.message && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({})}
          />
        </div>
      )}

      <ReasonCard
        isOpen={isModalOpen}
        employeeName={employeeFullName}
        reason={reason}
        onReasonChange={handleReasonChange}
        addToBlacklist={addToBlacklist}
        onBlacklistChange={setAddToBlacklist}
        fieldError={fieldError}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={closeModal}
      />

      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/app/personal")}
            className="shrink-0 rounded-lg p-2 transition-colors hover:bg-slate-100"
          >
            <svg
              className="h-5 w-5 rotate-90 text-slate-600"
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

          <Type
            variant="page-title"
            as="h2"
            className="min-w-0 flex-1 truncate text-[1rem] leading-tight sm:text-[1.15rem]"
          >
            Gestión de Empleados
          </Type>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <div className="w-full">
            <NativeSelect
              size="sm"
              aria-label="Tabs"
              value={currentTab}
              onChange={(e) => setCurrentTab(e.target.value)}
              options={tabs.map((t) => ({ label: t.label, value: t.id }))}
            />
          </div>

          {canEdit ? (
            <BigButton
              text="Dar de baja"
              onClick={openModal}
              hasNoRollback
              className="w-full whitespace-nowrap px-3 !text-sm"
            />
          ) : null}
        </div>
      </div>

      <div className="hidden min-w-0 items-center gap-2 md:flex md:flex-wrap">
        <button
          type="button"
          onClick={() => navigate("/app/personal")}
          className="rounded-lg p-2 hover:bg-slate-100 transition-colors shrink-0"
        >
          <svg
            className="w-5 h-5 text-slate-600 rotate-90"
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

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-3 md:gap-x-8">
          <Type
            variant="page-title"
            as="h2"
            className="min-w-0 shrink-0 truncate"
          >
            Gestión de Empleados
          </Type>

          <Tabs
            selectedKey={currentTab}
            onSelectionChange={(key) => setCurrentTab(key)}
            className="w-max shrink-0"
          >
            <Tabs.List type="underline">
              {tabs.map((tab) => (
                <Tabs.Item key={tab.id} id={tab.id} label={tab.label} />
              ))}
            </Tabs.List>
          </Tabs>
        </div>

        {canEdit ? (
          <BigButton
            text="Dar de baja"
            onClick={openModal}
            hasNoRollback
            className="ml-auto mr-2 min-w-[8.75rem] shrink-0 whitespace-nowrap px-5"
          />
        ) : null}
      </div>

      <EmployeeBasicCard
        employee={employee}
        employeeHouse={employeeHouse}
        isEditing={editSection === "basic"}
        basicForm={basicForm}
        basicPicturePreview={basicPicturePreview}
        setBasicField={setBasicField}
        setBasicPicture={setBasicPicture}
        saving={saving}
        saveError={editSection === "basic" ? saveError : null}
        errors={editSection === "basic" ? basicErrors : {}}
        infoDrawer={infoDrawer}
        onOpenEdit={() => openBasicEdit(employee)}
        onSubmit={submitBasic}
        onCancel={closeEdit}
        canEdit={canEdit}
      />

      {currentTab === "overview" && (
        <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-4">
          <EmployeeContactCard
            employee={employee}
            employeeAddress={employeeAddress}
            isEditing={editSection === "contact"}
            contactForm={contactForm}
            setContactField={setContactField}
            saving={saving}
            saveError={editSection === "contact" ? saveError : null}
            errors={editSection === "contact" ? contactErrors : {}}
            onOpenEdit={() => openContactEdit(employee, employeeAddress)}
            onSubmit={submitContact}
            onCancel={closeEdit}
            canEdit={canEdit}
          />

          <EmployeeAdminCard
            employee={employee}
            employeeWorkdays={employeeWorkdays}
            employeeVacationRequests={employeeVacationRequests}
            employeeAbsenceUsedDays={employeeAbsenceUsedDays}
            workdaysDrawer={workdaysDrawer}
            isEditing={editSection === "Administrador"}
            loadingCatalogues={loadingCatalogues}
            adminForm={adminForm}
            roles={roles}
            frecuentPaymentTypes={frecuentPaymentTypes}
            setAdminField={setAdminField}
            toggleWorkday={toggleWorkday}
            setWorkdayTime={setWorkdayTime}
            setWorkdayAllDay={setWorkdayAllDay}
            saving={saving}
            saveError={editSection === "Administrador" ? saveError : null}
            errors={editSection === "Administrador" ? adminErrors : {}}
            onOpenEdit={() => openAdminEdit(employee, employeeWorkdays)}
            onSubmit={submitAdmin}
            onCancel={closeEdit}
            canEdit={canEdit}
          />
        </div>
      )}

      {currentTab === "expediente" && (
        <div className="flex flex-col gap-10">
          <DocumentsSection
            documents={documents}
            loadingDocs={loadingDocs}
            fetchError={fetchError}
            onFetchErrorClose={clearFetchError}
            successMessage={successMessage}
            onSuccessMessageClose={clearSuccessMessage}
            canModify={canModify}
            deletingId={deletingId}
            docToDelete={docToDelete}
            conflictDocument={conflictDocument}
            showUploadModal={showUploadModal}
            isEditing={isEditing}
            documentTypes={documentTypes}
            documentType={documentType}
            fileName={fileName}
            displayError={displayError}
            onUploadErrorClose={clearUploadError}
            modalError={modalError}
            modalLoading={modalLoading}
            handleOpenUpload={handleOpenUpload}
            handleCloseModal={handleCloseModal}
            handleFileChange={handleFileChange}
            handleModalSubmit={handleModalSubmit}
            handleOpenEdit={handleOpenEdit}
            setDocToDelete={setDocToDelete}
            handleDeleteConfirm={handleDeleteConfirm}
            handleConflictConfirm={handleConflictConfirm}
            handleConflictCancel={handleConflictCancel}
          />

          <TrainingsSection
            trainings={trainings}
            loadingTrainings={loadingTrainings}
            fetchError={trainingsFetchError}
            onFetchErrorClose={clearTrainingsFetchError}
            selectedTraining={selectedTraining}
            onOpenTraining={openTrainingDetail}
            onCloseTraining={closeTrainingDetail}
            viewerRole={viewerRole}
            calendarTimeZone={calendarTimeZone}
          />
        </div>
      )}
    </div>
  );
};

export default DetalleEmpleado;
