import Pagination from "../components/molecules/pagination";
import HouseLogsFilters from "../components/molecules/houseLogsFilters";
import HouseLogsTable from "../components/molecules/houseLogsTable";
import { useHouseLogs } from "../hooks/pages/useHouseLogs";

const LogsHouse = () => {
  const {
    logs,
    totalLogs,
    totalPages,
    page,
    loading,
    error,
    responsibleQuery,
    setResponsibleQuery,
    affectedQuery,
    setAffectedQuery,
    actionFilter,
    setActionFilter,
    dateFilter,
    setDateFilter,
    actionOptions,
    handleNextPage,
    handlePrevPage,
  } = useHouseLogs();

  return (
    <div className="flex min-h-full flex-col gap-6 p-4 sm:gap-8 sm:p-8">
      <h1 className="text-3xl font-bold text-[#121212] sm:text-4xl">
        Acciones registradas dentro de app de la casa
      </h1>

      <HouseLogsFilters
        responsibleQuery={responsibleQuery}
        setResponsibleQuery={setResponsibleQuery}
        affectedQuery={affectedQuery}
        setAffectedQuery={setAffectedQuery}
        actionFilter={actionFilter}
        setActionFilter={setActionFilter}
        actionOptions={actionOptions}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <HouseLogsTable logs={logs} loading={loading} error={error} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <Pagination
          page={page}
          totalPages={totalPages}
          total={totalLogs}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          loading={loading}
          hasEmployees={totalLogs > 0}
          entityLabel="registros"
        />
      </div>
    </div>
  );
};

export default LogsHouse;
