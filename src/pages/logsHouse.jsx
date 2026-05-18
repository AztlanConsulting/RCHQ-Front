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
    <div className="p-4 sm:p-8 md:flex md:h-full md:flex-col">
      <h1 className="text-3xl font-bold text-[#121212] sm:text-4xl">
        Acciones registradas dentro de app de la casa
      </h1>

      <div className="mt-6">
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
      </div>

      <div className="mt-6 md:min-h-0 md:flex-1 md:overflow-y-auto">
        <HouseLogsTable logs={logs} loading={loading} error={error} />
      </div>

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
  );
};

export default LogsHouse;
