import { useState } from "react";
import Button from "../components/atoms/button";
import Pagination from "../components/molecules/pagination";
import VacationRequestFilters from "../components/molecules/vacationRequestFilters";
import VacationRequestTable from "../components/molecules/vacationRequestTable";
import ConfirmApproveVacationModal from "../components/molecules/confirmApproveVacationModal";
import ConfirmRejectVacationModal from "../components/molecules/confirmRejectVacationModal";
import { useVacationRequests } from "../hooks/pages/useVacationRequests";
import Alert from "../components/atoms/alerts";

const VacationRequests = () => {
    const {
        view,
        setView,
        requests,
        pagination,
        page,
        searchInput,
        setSearchInput,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        statusFilter,
        setStatusFilter,
        setSelectedRequest,
        loading,
        error,
        clearError,
        approvingRequestId,
        handleApproveRequest,
        rejectingRequestId,
        handleRejectRequest,
        handleNextPage,
        handlePrevPage,
        clearFilters,
    } = useVacationRequests();

    const [requestToApprove, setRequestToApprove] = useState(null);
    const [approveModalError, setApproveModalError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [requestToReject, setRequestToReject] = useState(null);
    const [rejectModalError, setRejectModalError] = useState("");

    const isPendingView = view === "pending";

    const handleOpenApproveModal = (request) => {
        clearError();
        setApproveModalError("");
        setSuccessMessage("");
        setRequestToApprove(request);
    };

    const handleCloseApproveModal = () => {
        if (approvingRequestId) return;

        setApproveModalError("");
        clearError();
        setRequestToApprove(null);
    };

    const handleConfirmApprove = async () => {
        if (!requestToApprove?.vacationRequestId) return;

        setApproveModalError("");
        setSuccessMessage("");

        try {
            await handleApproveRequest(requestToApprove.vacationRequestId);
            setRequestToApprove(null);
            setSuccessMessage("Solicitud de vacaciones aprobada con éxito");
        } catch (err) {
            clearError();
            setApproveModalError(err.message || "No se pudo aprobar la solicitud");
        }
    };

    const handleOpenRejectModal = (request) => {
        clearError();
        setRejectModalError("");
        setSuccessMessage("");
        setRequestToReject(request);
    };

    const handleCloseRejectModal = () => {
        if (rejectingRequestId) return;

        setRejectModalError("");
        clearError();
        setRequestToReject(null);
    };

    const handleConfirmReject = async () => {
        if (!requestToReject?.vacationRequestId) return;

        setRejectModalError("");
        setSuccessMessage("");

        try {
            await handleRejectRequest(requestToReject.vacationRequestId);
            setRequestToReject(null);
            setSuccessMessage("Solicitud de vacaciones rechazada con éxito");
        } catch (err) {
            clearError();
            setRejectModalError(err.message || "No se pudo rechazar la solicitud");
        }
    };

    return (
        <div className="p-8 md:flex md:flex-col md:h-full">
            {successMessage && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                    <Alert
                        type="success"
                        message={successMessage}
                        onClose={() => setSuccessMessage("")}
                    />
                </div>
            )}
            <div className="flex items-center justify-between mb-8">
                <h1 className="font-bold text-4xl text-[#121212]">
                    {isPendingView
                        ? "Solicitudes de vacaciones pendientes"
                        : "Solicitudes de vacaciones revisadas"}
                </h1>

                <Button
                    text={
                        isPendingView
                            ? "Solicitudes revisadas"
                            : "Regresar a pendientes"
                    }
                    onClick={() => setView(isPendingView ? "reviewed" : "pending")}
                    bgColor="bg-[#24375e]"
                    hoverColor="hover:bg-[#162d4a]"
                    activeColor="active:bg-[#0f2035]"
                    textColor="text-white"
                    width="w-auto"
                    className="px-6"
                />
            </div>

            <VacationRequestFilters
                view={view}
                searchQuery={searchInput}
                setSearchQuery={setSearchInput}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                clearFilters={clearFilters}
            />

            {error && !requestToApprove && !requestToReject && (
                <div className="mb-5">
                    <Alert
                        type="error"
                        message={error}
                        onClose={clearError}
                    />
                </div>
            )}

            <VacationRequestTable
                requests={requests}
                view={view}
                loading={loading}
                approvingRequestId={approvingRequestId}
                rejectingRequestId={rejectingRequestId}
                onViewDetail={(request) => {
                    setSelectedRequest(request);
                }}
                onOpenApproveModal={handleOpenApproveModal}
                onOpenRejectModal={handleOpenRejectModal}
            />

            <Pagination
                page={page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
                loading={loading}
                hasEmployees={requests.length > 0}
                itemLabel="solicitudes"
            />

            <ConfirmApproveVacationModal
                request={requestToApprove}
                loading={Boolean(approvingRequestId)}
                error={approveModalError}
                onCancel={handleCloseApproveModal}
                onConfirm={handleConfirmApprove}
            />

            <ConfirmRejectVacationModal
                request={requestToReject}
                loading={Boolean(rejectingRequestId)}
                error={rejectModalError}
                onCancel={handleCloseRejectModal}
                onConfirm={handleConfirmReject}
            />
        </div>
    );
};

export default VacationRequests;
