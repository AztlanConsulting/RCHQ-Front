import { useEffect, useMemo, useState } from "react";
import {
  downloadHouseLogsReportService,
  getHouseLogsService,
  getLogsActionsService,
} from "../../services/logsService";
import { useDebouncedVacationSearch } from "../molecules/useDebouncedVacationSearch";

const LIMIT = 6;
const DEFAULT_PAGINATION = {
  page: 1,
  limit: LIMIT,
  total: 0,
  totalPages: 0,
};

export const useHouseLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionOptions, setActionOptions] = useState([]);
  const [selectedActionIds, setSelectedActionIds] = useState([]);
  const [actionSearch, setActionSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const {
    inputValue: searchInput,
    setInputValue: setSearchInput,
    debouncedSearch: searchQuery,
  } = useDebouncedVacationSearch("", {
    minSearchLength: 3,
    debounceMs: 400,
  });

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);

  const now = useMemo(() => new Date(), []);
  const [reportMonth, setReportMonth] = useState(now.getMonth() + 1);
  const [reportYear, setReportYear] = useState(now.getFullYear());

  const yearOptions = useMemo(() => {
    const currentYear = now.getFullYear();
    return Array.from({ length: 11 }, (_, index) => currentYear - 5 + index);
  }, [now]);

  const filteredActionOptions = useMemo(() => {
    const normalizedSearch = actionSearch.trim().toLowerCase();
    if (!normalizedSearch) return actionOptions;

    return actionOptions.filter((option) =>
      option.label.toLowerCase().includes(normalizedSearch),
    );
  }, [actionOptions, actionSearch]);

  const selectedActionLabel = useMemo(() => {
    if (selectedActionIds.length === 0) return "Todas las acciones";
    if (selectedActionIds.length === 1) {
      return actionOptions.find((option) => option.value === selectedActionIds[0])?.label || "1 accion";
    }
    return `${selectedActionIds.length} acciones seleccionadas`;
  }, [actionOptions, selectedActionIds]);

  const fetchLogs = async (pageToFetch = 1) => {
    setLoading(true);
    setError("");

    try {
      const result = await getHouseLogsService({
        page: pageToFetch,
        limit: LIMIT,
        search: searchQuery,
        actionIds: selectedActionIds,
        startDate,
        endDate,
      });
      setLogs(result.logs);
      setPagination(result.pagination);
      setPage(result.pagination.page || pageToFetch);
    } catch (err) {
      setLogs([]);
      setPagination(DEFAULT_PAGINATION);
      setError(err.message || "No se pudieron cargar los logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchActions = async () => {
      try {
        const actions = await getLogsActionsService();
        setActionOptions(
          actions.map((action) => ({
            value: action.actionId,
            label: action.description,
          })),
        );
      } catch (err) {
        setError(err.message || "No se pudieron cargar las acciones");
      }
    };

    fetchActions();
  }, []);

  useEffect(() => {
    fetchLogs(page);
  }, [page, searchQuery, selectedActionIds, startDate, endDate]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedActionIds, startDate, endDate]);

  const handleNextPage = () => {
    if (page < pagination.totalPages) {
      setPage((currentPage) => currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((currentPage) => currentPage - 1);
    }
  };

  const toggleActionValue = (actionId, checked) => {
    setSelectedActionIds((currentValues) => {
      if (checked) {
        return currentValues.includes(actionId)
          ? currentValues
          : [...currentValues, actionId];
      }

      return currentValues.filter((value) => value !== actionId);
    });
  };

  const clearActionSelection = () => {
    setSelectedActionIds([]);
    setActionSearch("");
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const clearError = () => setError("");

  const openReportModal = () => {
    clearError();
    setIsReportModalOpen(true);
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
  };

  const handleDownloadReport = async () => {
    setIsDownloadingReport(true);
    setError("");

    try {
      const { blob, fileName } = await downloadHouseLogsReportService({
        month: reportMonth,
        year: reportYear,
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setIsReportModalOpen(false);
    } catch (err) {
      setError(err.message || "No se pudo generar el reporte");
    } finally {
      setIsDownloadingReport(false);
    }
  };

  return {
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
    reportMonth,
    setReportMonth,
    reportYear,
    setReportYear,
    yearOptions,
    isDownloadingReport,
    handleDownloadReport,
  };
};
