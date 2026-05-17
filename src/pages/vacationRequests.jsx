import Button from "../components/atoms/button";
import Pagination from "../components/molecules/pagination";
import VacationRequestFilters from "../components/molecules/vacationRequestFilters";
import VacationRequestTable from "../components/molecules/vacationRequestTable";
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
        handleNextPage,
        handlePrevPage,
        clearFilters,
    } = useVacationRequests();

    const isPendingView = view === "pending";

    return (
        <div className="p-8 bg-white min-h-screen">
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

            {error && (
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
                onViewDetail={(request) => {
                    setSelectedRequest(request);
                }}
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
        </div>
    );
};

export default VacationRequests;
