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
        searchQuery,
        setSearchQuery,
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
        <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
            <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#121212] sm:text-3xl lg:text-4xl">
                        {isPendingView
                            ? "Solicitudes de vacaciones pendientes"
                            : "Solicitudes de vacaciones revisadas"}
                    </h1>

                    <p className="mt-2 text-sm text-gray-600">
                        Consulta las solicitudes de vacaciones de empleados de tu casa hogar.
                    </p>
                </div>

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
                    width="w-full md:w-auto"
                    className="px-6"
                />
            </header>

            <VacationRequestFilters
                view={view}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
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
