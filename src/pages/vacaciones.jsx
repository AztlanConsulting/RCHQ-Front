import Button from "../components/atoms/button";
import Pagination from "../components/molecules/pagination";
import VacationListFilters from "../components/molecules/vacationListFilters";
import VacationListTable from "../components/molecules/vacationListTable";
import { useVacationList } from "../hooks/pages/useVacationRequests";
import Alert from "../components/atoms/alerts";

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
        handleNextPage,
        handlePrevPage,
        clearFilters,
    } = useVacationList();

    const isFutureView = view === "future";

    return (
        <div className="p-8 md:flex md:flex-col md:h-full">
            <div className="flex items-center justify-between mb-8">
                <h1 className="font-bold text-4xl text-[#121212]">
                    {isFutureView
                        ? "Vacaciones futuras"
                        : "Vacaciones pasadas"}
                </h1>

                <Button
                    text={
                        isFutureView
                            ? "Vacaciones pasadas"
                            : "Vacaciones futuras"
                    }
                    onClick={() => setView(isFutureView ? "past" : "future")}
                    bgColor="bg-[#24375e]"
                    hoverColor="hover:bg-[#162d4a]"
                    activeColor="active:bg-[#0f2035]"
                    textColor="text-white"
                    width="w-auto"
                    className="px-6"
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
                    <Alert
                        type="error"
                        message={error}
                        onClose={clearError}
                    />
                </div>
            )}

            <VacationListTable
                requests={requests}
                view={view}
                loading={loading}
                onViewDetail={() => {}}
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
        </div>
    );
};

export default VacationList;
