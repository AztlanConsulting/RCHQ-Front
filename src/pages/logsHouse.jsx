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
    filteredActionOptions,
    selectedActionIds,
    actionSearch,
    setActionSearch,
    selectedActionLabel,
    toggleActionValue,
    clearActionSelection,
    dateFilter,
    setDateFilter,
    handleNextPage,
    handlePrevPage,
  } = useHouseLogs();

  return (
    <div className="p-8 md:flex md:h-full md:flex-col">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#121212]">
          Acciones registradas dentro de app de la casa
        </h1>
      </div>

      <div className="mb-6">
        <HouseLogsFilters
          responsibleQuery={responsibleQuery}
          setResponsibleQuery={setResponsibleQuery}
          affectedQuery={affectedQuery}
          setAffectedQuery={setAffectedQuery}
          filteredActionOptions={filteredActionOptions}
          selectedActionIds={selectedActionIds}
          actionSearch={actionSearch}
          setActionSearch={setActionSearch}
          selectedActionLabel={selectedActionLabel}
          toggleActionValue={toggleActionValue}
          clearActionSelection={clearActionSelection}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
        />
      </div>

      <div className="md:min-h-0 md:flex-1 md:overflow-y-auto">
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
