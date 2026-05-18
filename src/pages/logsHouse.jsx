import Button from "../components/atoms/button";
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
    isReportModalOpen,
    openReportModal,
    closeReportModal,
    reportMonth,
    setReportMonth,
    reportYear,
    setReportYear,
    yearOptions,
    isDownloadingReport,
    handleDownloadReport,
    handleNextPage,
    handlePrevPage,
  } = useHouseLogs();

  return (
    <div className="p-8 md:flex md:h-full md:flex-col">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#121212]">
            Historial de actividades en Tochan
          </h1>
        </div>

        <Button
          text="Generar reporte"
          onClick={openReportModal}
          bgColor="bg-[#24375e]"
          hoverColor="hover:bg-[#162d4a]"
          activeColor="active:bg-[#0f2035]"
          textColor="text-white"
          width="w-full md:w-56"
          className="px-6"
        />
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

      <LogReportModal
        open={isReportModalOpen}
        onClose={closeReportModal}
        month={reportMonth}
        onMonthChange={setReportMonth}
        year={reportYear}
        onYearChange={setReportYear}
        yearOptions={yearOptions}
        onConfirm={handleDownloadReport}
        loading={isDownloadingReport}
      />
    </div>
  );
};

export default LogsHouse;
