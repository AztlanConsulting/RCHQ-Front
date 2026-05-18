import { useCallback, useEffect, useMemo, useState } from "react";
import { getHouseLogsService } from "../../services/logsService";

const PAGE_SIZE = 10;

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
  const actionOptions = useMemo(() => ([
    { value: "all", label: "Todas las acciones" },
  ]), []);
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [responsibleQuery, setResponsibleQuery] = useState("");
  const [affectedQuery, setAffectedQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getHouseLogsService(page, PAGE_SIZE);

      setServerLogs(response.data);
      setTotalLogs(response.totalRecords);
      setTotalPages(response.totalPages);
    } catch (fetchError) {
      setError(fetchError?.message || "No se pudieron obtener los registros.");
      setServerLogs([]);
      setTotalLogs(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((currentPage) => currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((currentPage) => currentPage - 1);
    }
  };

  return {
    logs: serverLogs,
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
  };
};
