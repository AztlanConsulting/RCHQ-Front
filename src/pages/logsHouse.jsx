import BigButton from "../components/atoms/bigButton";
import Pagination from "../components/molecules/pagination";
import HouseLogsFilters from "../components/molecules/houseLogsFilters";
import HouseLogsTable from "../components/molecules/houseLogsTable";
import LogReportModal from "../components/organism/logReportModal";
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
    minLogsDate,
    maxLogsDate,
    isReportModalOpen,
    openReportModal,
    closeReportModal,
    reportYear,
    setReportYear,
    currentYear,
    yearOptions,
    isDownloadingReport,
    handleDownloadReport,
    handleNextPage,
    handlePrevPage,
    isMobileFiltersExpanded,
    toggleMobileFilters,
  } = useHouseLogs();

  return (
    <div className="flex h-full flex-col p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#121212]">
            Historial de actividades en Tochan
          </h1>
        </div>

        <BigButton
          text="Generar reporte"
          onClick={openReportModal}
          className="w-full md:w-56"
        />
      </div>

      <div className="mb-4">
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
          minDate={minLogsDate}
          maxDate={maxLogsDate}
          isMobileExpanded={isMobileFiltersExpanded}
          onToggleMobileFilters={toggleMobileFilters}
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

      <LogReportModal
        open={isReportModalOpen}
        onClose={closeReportModal}
        year={reportYear}
        onYearChange={setReportYear}
        currentYear={currentYear}
        yearOptions={yearOptions}
        onConfirm={handleDownloadReport}
        loading={isDownloadingReport}
      />
    </div>
  );
};

export default LogsHouse;
