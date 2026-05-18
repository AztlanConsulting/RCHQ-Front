import { useEffect, useMemo, useState } from "react";
import {
  downloadHouseLogsReportService,
  getHouseLogsService,
  getLogsActionsService,
} from "../../services/logsService";
import { useDebouncedVacationSearch } from "../molecules/useDebouncedVacationSearch";

const LIMIT = 10;
const DEFAULT_PAGINATION = {
  page: 1,
  limit: LIMIT,
  total: 0,
  totalPages: 0,
};

export const formatLogMoment = (momentValue) => {
  if (!momentValue) return "—";

  const date = new Date(momentValue);

  if (Number.isNaN(date.getTime())) {
    return String(momentValue);
  }

  const datePart = new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);

  const timePart = new Intl.DateTimeFormat("es-MX", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .replace(/\s+/g, " ")
    .replace(/\b(a\. m\.|a. m.|AM)\b/i, "am")
    .replace(/\b(p\. m\.|p. m.|PM)\b/i, "pm");

  return `${datePart} a las ${timePart}`;
};

export const useHouseLogs = () => {
  const [serverLogs, setServerLogs] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionOptions, setActionOptions] = useState([]);
  const [selectedActionIds, setSelectedActionIds] = useState([]);
  const [actionSearch, setActionSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const {
    inputValue: responsibleInput,
    setInputValue: setResponsibleQuery,
    debouncedSearch: responsibleSearch,
  } = useDebouncedVacationSearch("", {
    minSearchLength: 3,
    debounceMs: 400,
  });
  const {
    inputValue: affectedInput,
    setInputValue: setAffectedQuery,
    debouncedSearch: affectedSearch,
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

  const effectiveStartDate = dateFilter || "";
  const effectiveEndDate = dateFilter || "";

  const fetchLogs = async (pageToFetch = 1) => {
    setLoading(true);
    setError("");

    try {
      const result = await getHouseLogsService({
        page: pageToFetch,
        limit: LIMIT,
        responsible: responsibleSearch,
        affected: affectedSearch,
        actionIds: selectedActionIds,
        startDate: effectiveStartDate,
        endDate: effectiveEndDate,
      });

      setServerLogs(result.logs);
      setPagination(result.pagination);
      setPage(result.pagination.page || pageToFetch);
    } catch (err) {
      setServerLogs([]);
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
  }, [page, responsibleSearch, affectedSearch, selectedActionIds, effectiveStartDate, effectiveEndDate]);

  useEffect(() => {
    setPage(1);
  }, [responsibleSearch, affectedSearch, selectedActionIds, effectiveStartDate, effectiveEndDate]);

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
    logs: serverLogs,
    pagination,
    totalLogs: pagination.total,
    totalPages: pagination.totalPages,
    page,
    loading,
    error,
    clearError,
    handleNextPage,
    handlePrevPage,
    filteredActionOptions,
    selectedActionIds,
    actionSearch,
    setActionSearch,
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
    responsibleQuery: responsibleInput,
    setResponsibleQuery,
    affectedQuery: affectedInput,
    setAffectedQuery,
    dateFilter,
    setDateFilter,
    actionOptions,
  };
};
