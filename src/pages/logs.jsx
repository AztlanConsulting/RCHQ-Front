import Alert from "../components/atoms/alerts";
import BigButton from "../components/atoms/bigButton";
import Pagination from "../components/molecules/pagination";
import LogsFilters from "../components/molecules/logsFilters";
import LogsTable from "../components/molecules/logsTable";
import LogReportModal from "../components/organism/logReportModal";
import { useHouseLogs } from "../hooks/pages/useHouseLogs";

const Logs = () => {
  const {
    logs,
    pagination,
    page,
    loading,
    error,
    clearError,
    handleNextPage,
    handlePrevPage,
    searchInput,
    setSearchInput,
    filteredActionOptions,
    selectedActionIds,
    actionSearch,
    setActionSearch,
    startDate,
    endDate,
    handleStartDateChange,
    handleEndDateChange,
    selectedActionLabel,
    toggleActionValue,
    clearActionSelection,
    isReportModalOpen,
    openReportModal,
    closeReportModal,
    reportYear,
    setReportYear,
    currentYear,
    yearOptions,
    isDownloadingReport,
    handleDownloadReport,
    isMobileFiltersExpanded,
    toggleMobileFilters,
  } = useHouseLogs();

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#121212]">Historial de actividades en Tochan</h1>
          <p className="mt-2 text-sm text-slate-600">
            Consulta el historial de acciones registradas en tu casa hogar.
          </p>
        </div>

        <BigButton
          text="Generar reporte"
          onClick={openReportModal}
          className="w-full md:w-56"
        />
      </div>

      <LogsFilters
        searchQuery={searchInput}
        setSearchQuery={setSearchInput}
        actionOptions={filteredActionOptions}
        selectedActionIds={selectedActionIds}
        actionSearch={actionSearch}
        setActionSearch={setActionSearch}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        selectedActionLabel={selectedActionLabel}
        toggleActionValue={toggleActionValue}
        clearActionSelection={clearActionSelection}
        isMobileExpanded={isMobileFiltersExpanded}
        onToggleMobileFilters={toggleMobileFilters}
      />

      {error ? (
        <div className="mb-5">
          <Alert type="error" message={error} onClose={clearError} />
        </div>
      ) : null}

      <LogsTable logs={logs} loading={loading} />

      <Pagination
        page={page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        loading={loading}
        hasItems={pagination.total > 0}
        itemLabel="logs"
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

export default Logs;
