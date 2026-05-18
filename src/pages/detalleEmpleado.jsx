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
import { useDrawer } from "@/hooks/atoms/useDrawer";
import { useEmployeeDetail } from "@/hooks/pages/useEmployeeDetail";
import { useEditEmployee } from "@/hooks/organism/useEditEmployee";
import { useDocuments } from "../hooks/organism/useDocuments";
import { useDeactivateEmployee } from "@/hooks/organism/useDeactivateEmployee";

const tabs = [
  { id: "overview",   label: "Overview" },
  { id: "expediente", label: "Expediente" },
];

const DetalleEmpleado = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const {
    employee, employeeAddress, employeeHouse,
    employeeFaults, employeeWorkdays, employeeVacationRequests,
    isLoading, currentTab, setCurrentTab,
    alert, setAlert, getEmployeeDetail,
  } = useEmployeeDetail(employeeId);

  const {
    editSection, saving, saveError, loadingCatalogues,
    basicForm, contactForm, adminForm,
    roles, houses,
    frecuentPaymentTypes,
    openBasicEdit, openContactEdit, openAdminEdit, closeEdit,
    setBasicField, setContactField, setAdminField,
    toggleWorkday, setWorkdayTime,
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
  );

  if (isLoading) return <Loader />;

  return (
    <div className="flex flex-col gap-4 text-black">

      {alert?.message && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <Alert type={alert.type} message={alert.message} />
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

      <div className="flex flex-nowrap items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={() => navigate("/app/personal")}
          className="rounded-lg p-2 hover:bg-slate-100 transition-colors shrink-0"
        >
          <svg className="w-5 h-5 text-slate-600 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <Type variant="page-title" as="h2" className="min-w-0 flex-1 truncate">
          Gestión de Empleados
        </Type>

        <div className="min-w-0 shrink md:hidden max-w-[min(11rem,38%)]">
          <NativeSelect
            size="sm" aria-label="Tabs" value={currentTab}
            onChange={(e) => setCurrentTab(e.target.value)}
            options={tabs.map((t) => ({ label: t.label, value: t.id }))}
          />
        </div>
        <Tabs
          selectedKey={currentTab}
          onSelectionChange={(key) => setCurrentTab(key)}
          className="w-max max-md:hidden shrink-0 ml-0 md:ml-6"
        >
          <Tabs.List type="underline">
            {tabs.map((tab) => (
              <Tabs.Item key={tab.id} id={tab.id} label={tab.label} />
            ))}
          </Tabs.List>
        </Tabs>

        {currentTab === "overview" && (
          <button
            type="button"
            onClick={openModal}
            className="ml-auto shrink-0 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold
              text-white hover:bg-red-700 active:bg-red-800 transition-colors"
          >
            Dar de baja
          </button>
        )}
      </div>

      <EmployeeBasicCard
        employee={employee}
        employeeHouse={employeeHouse}
        isEditing={editSection === "basic"}
        basicForm={basicForm}
        setBasicField={setBasicField}
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
            employeeFaults={employeeFaults}
            workdaysDrawer={workdaysDrawer}
            isEditing={editSection === "admin"}
            loadingCatalogues={loadingCatalogues}
            adminForm={adminForm}
            roles={roles}
            houses={houses}
            frecuentPaymentTypes={frecuentPaymentTypes}
            setAdminField={setAdminField}
            toggleWorkday={toggleWorkday}
            setWorkdayTime={setWorkdayTime}
            saving={saving}
            saveError={editSection === "admin" ? saveError : null}
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