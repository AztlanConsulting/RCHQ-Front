import BigButton from "../components/atoms/bigButton";
import Pagination from "../components/molecules/pagination";
import VacationListFilters from "../components/molecules/vacationListFilters";
import VacationListTable from "../components/molecules/vacationListTable";
import { useVacationList } from "../hooks/pages/useVacationRequests";
import Alert from "../components/atoms/alerts";
import Modal from "../components/atoms/modal";
import VacationEditForm from "../components/organism/evento/forms/vacationEditForm";
import ConfirmDeleteVacationModal from "../components/molecules/confirmDeleteVacationModal";
import VacationWorkerDetail from "../components/molecules/calendarCards/vacationWorkerDetail";

const VacationList = () => {
    const {
        view,
        setView,
        requests,
        pagination,
        page,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        statusFilter,
        setStatusFilter,
        loading,
        error,
        clearError,
        alert,
        clearAlert,
        handleNextPage,
        handlePrevPage,
        clearFilters,
        onViewDetail,
        selectedVacation,
        viewingVacation,
        closeViewingVacation,
        isVacationEditing,
        vacationForm,
        vacationEditError,
        isSavingVacation,
        vacationRemainingInfo,
        isLoadingVacationRemaining,
        handleEditVacation,
        cancelVacationEdit,
        submitVacationEdit,
        setVacationField,
        vacationToDelete,
        isDeletingVacation,
        deleteVacationError,
        openDeleteVacation,
        cancelDeleteVacation,
        confirmDeleteVacation,
    } = useVacationList();

    const isFutureView = view === "future";

    return (
        <div className="p-8 md:flex md:flex-col md:h-full">
            <div className="flex items-center justify-between mb-8">
                <h1 className="font-bold text-4xl text-[#121212]">
                    {isFutureView ? "Vacaciones futuras" : "Vacaciones pasadas"}
                </h1>

                <BigButton
                    text={
                        isFutureView
                            ? "Vacaciones pasadas"
                            : "Vacaciones futuras"
                    }
                    onClick={() => setView(isFutureView ? "past" : "future")}
                    className="min-w-0"
                />
            </div>

            <VacationListFilters
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                clearFilters={clearFilters}
            />

            {error && (
                <div className="mb-5">
                    <Alert type="error" message={error} onClose={clearError} />
                </div>
            )}

            {alert && (
                <div className="mb-5">
                    <Alert
                        type={alert.type}
                        message={alert.message}
                        onClose={clearAlert}
                    />
                </div>
            )}

            <VacationListTable
                requests={requests}
                view={view}
                loading={loading}
                onViewDetail={onViewDetail}
                onEdit={handleEditVacation}
                onDelete={openDeleteVacation}
            />

            <Pagination
                page={page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
                loading={loading}
                hasEmployees={requests.length > 0}
                itemLabel="vacaciones"
            />

            <Modal
                open={isVacationEditing}
                onClose={cancelVacationEdit}
                scrollable
                className="max-w-3xl max-h-[min(96vh,70rem)]"
            >
                <VacationEditForm
                    title="Editar vacaciones"
                    event={selectedVacation ?? {}}
                    vacationForm={vacationForm}
                    vacationEditError={vacationEditError}
                    vacationRemainingInfo={vacationRemainingInfo}
                    isLoadingVacationRemaining={isLoadingVacationRemaining}
                    isSaving={isSavingVacation}
                    onCancelEdit={cancelVacationEdit}
                    onSubmitEdit={submitVacationEdit}
                    onVacationFieldChange={setVacationField}
                    showEmployeeInfo={false}
                />
            </Modal>

            <Modal
                open={viewingVacation != null}
                onClose={closeViewingVacation}
                scrollable
                className="w-[92vw] max-w-[32rem] sm:max-w-[34rem] lg:max-w-[32rem] max-h-[min(96vh,70rem)]"
            >
                <VacationWorkerDetail
                    event={viewingVacation ?? {}}
                    onDelete={() => {
                        openDeleteVacation(viewingVacation);
                        closeViewingVacation();
                    }}
                />
            </Modal>

            <ConfirmDeleteVacationModal
                event={vacationToDelete}
                loading={isDeletingVacation}
                error={deleteVacationError}
                showEmployeeInfo={false}
                onCancel={cancelDeleteVacation}
                onConfirm={confirmDeleteVacation}
            />
        </div>
    );
};

export default VacationList;
