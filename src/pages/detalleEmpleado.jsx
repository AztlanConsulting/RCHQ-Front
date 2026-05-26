import { useParams, useNavigate } from "react-router-dom";
import Loader from "../components/atoms/loader";
import Alert from "../components/atoms/alerts";
import Type from "../components/atoms/type";
import { Tabs } from "../components/molecules/tabs";
import NativeSelect from "../components/atoms/nativeSelect";
import EmployeeBasicCard from "../components/organism/employeeBasicCard";
import EmployeeContactCard from "../components/organism/employeeContactCard";
import EmployeeAdminCard from "../components/organism/employeeAdminCard";
import DocumentsSection from "../components/organism/documentsSection";
import ReasonCard from "../components/organism/reasonCard";
import ReactivateCard from "../components/organism/reactivateCard";
import { useDrawer } from "@/hooks/atoms/useDrawer";
import { useEmployeeDetail } from "@/hooks/pages/useEmployeeDetail";
import { useEditEmployee } from "@/hooks/organism/useEditEmployee";
import { useDocuments } from "../hooks/organism/useDocuments";
import { useDeactivateEmployee } from "@/hooks/organism/useDeactivateEmployee";

const tabs = [
  { id: "overview",   label: "Resumen" },
  { id: "expediente", label: "Expediente" },
];

const DetalleEmpleado = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const {
    employee, employeeAddress, employeeHouse,
    employeeWorkdays, employeeVacationRequests, employeeAbsenceUsedDays,
    isLoading, currentTab, setCurrentTab,
    alert, setAlert, getEmployeeDetail,
  } = useEmployeeDetail(employeeId);

  const {
    editSection, saving, saveError, loadingCatalogues,
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
    documents, documentTypes, loadingDocs, fetchError, showUploadModal,
    modalLoading, modalError, docToDelete, deletingId,
    successMessage, canModify, conflictDocument,
    setDocToDelete, handleDeleteConfirm, handleOpenEdit,
    handleOpenUpload, handleCloseModal, handleConflictConfirm,
    handleConflictCancel, isEditing, documentType, fileName,
    handleFileChange, displayError, handleModalSubmit,
  } = useDocuments(employeeId);

  const infoDrawer     = useDrawer();
  const workdaysDrawer = useDrawer();

  const employeeFullName = employee
    ? `${employee.name ?? ""} ${employee.lastName ?? ""}`.trim()
    : "";

  const {
    isDeactivateModalOpen,
    openDeactivateModal,
    closeDeactivateModal,
    reason,
    handleReasonChange,
    addToBlacklist,
    setAddToBlacklist,
    deactivateFieldError,
    isSubmittingDeactivate,
    handleSubmitDeactivate,
  } = useDeactivateEmployee(
    employeeId,
    employeeFullName,
    setAlert,
    employee?.isActive !== false,
    getEmployeeDetail
  );

  const {
    isReactivateModalOpen,
    openReactivateModal,
    closeReactivateModal,
    reactivateFieldError,
    isSubmittingReactivate,
    handleSubmitReactivate,
  } = useReactivateModal(
    
  )

  if (isLoading) return <Loader />;

  return (
    <div className="flex flex-col gap-4 overflow-x-hidden text-black">

      {alert?.message && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <Alert type={alert.type} message={alert.message} />
        </div>
      )}

      <ReasonCard
        isOpen={isDeactivateModalOpen}
        employeeName={employeeFullName}
        reason={reason}
        onReasonChange={handleReasonChange}
        addToBlacklist={addToBlacklist}
        onBlacklistChange={setAddToBlacklist}
        fieldError={deactivateFieldError}
        isSubmitting={isSubmittingDeactivate}
        onSubmit={handleSubmitDeactivate}
        onCancel={closeDeactivateModal}
      />

      <ReactivateCard 
        isOpen={isReactivateModalOpen}
        employee={employee}
        fieldError={reactivateFieldError}
        isSubmitting={isSubmittingReactivate}
        onSubmit={handleSubmitReactivate}
        onCancel={closeReactivateModal}
      />

      <div className="flex items-center gap-2 md:hidden">
        <button
          type="button"
          onClick={() => navigate("/app/personal")}
          className="rounded-lg p-2 hover:bg-slate-100 transition-colors shrink-0"
        >
          <svg className="w-5 h-5 text-slate-600 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <Type variant="page-title" as="h2" className="min-w-0 flex-1 truncate text-[1rem] leading-tight sm:text-[1.15rem]">
          Gestión de Empleados
        </Type>

        <div className="w-28 shrink-0">
          <NativeSelect
            size="sm" aria-label="Tabs" value={currentTab}
            onChange={(e) => setCurrentTab(e.target.value)}
            options={tabs.map((t) => ({ label: t.label, value: t.id }))}
          />
        </div>

        {employee?.isActive ? (
          <button
            type="button"
            onClick={openDeactivateModal}
            className="shrink-0 rounded-lg bg-[#9b1c1c] px-3 py-2 text-xs font-semibold
              text-white hover:bg-[#7a1616] active:bg-[#5c1010] transition-colors"
          >
            Dar de baja
          </button>
        ): (
          <button
            type="button"
            onClick={openReactivateModal}
            className="shrink-0 rounded-lg bg-[#9b1c1c] px-3 py-2 text-xs font-semibold
              text-white hover:bg-[#7a1616] active:bg-[#5c1010] transition-colors"
          >
            Reactivar
          </button>
        )}
      </div>

      <div className="hidden min-w-0 items-center gap-2 md:flex md:flex-nowrap">
        <button
          type="button"
          onClick={() => navigate("/app/personal")}
          className="rounded-lg p-2 hover:bg-slate-100 transition-colors shrink-0"
        >
          <svg className="w-5 h-5 text-slate-600 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-8">
          <Type variant="page-title" as="h2" className="min-w-0 shrink-0 truncate">
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

        <button
          type="button"
          onClick={openDeactivateModal}
          className="ml-auto mr-2 shrink-0 rounded-xl bg-[#b42318] px-5 py-2.5 text-sm font-semibold
            text-white shadow-sm hover:bg-[#8f1c13] active:bg-[#73170f] transition-colors"
        >
          Dar de baja
        </button>
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
        infoDrawer={infoDrawer}
        onOpenEdit={() => openBasicEdit(employee)}
        onSubmit={submitBasic}
        onCancel={closeEdit}
      />

      {currentTab === "overview" && (
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-4">
          <EmployeeContactCard
            employee={employee}
            employeeAddress={employeeAddress}
            isEditing={editSection === "contact"}
            contactForm={contactForm}
            setContactField={setContactField}
            saving={saving}
            saveError={editSection === "contact" ? saveError : null}
            onOpenEdit={() => openContactEdit(employee, employeeAddress)}
            onSubmit={submitContact}
            onCancel={closeEdit}
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
            onOpenEdit={() => openAdminEdit(employee, employeeWorkdays)}
            onSubmit={submitAdmin}
            onCancel={closeEdit}
          />
        </div>
      )}

      {currentTab === "expediente" && (
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
          documentTypes={documentTypes}
          documentType={documentType}
          fileName={fileName}
          displayError={displayError}
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
      )}
    </div>
  );
};

export default DetalleEmpleado;
