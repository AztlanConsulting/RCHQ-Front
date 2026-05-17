import { useEffect, useMemo, useState } from "react";
import { getHouseLogsService } from "../../services/logsService";

const SERVER_LIMIT = 50;
const UI_PAGE_SIZE = 6;

const normalizeText = (value) => String(value ?? "").trim().toLowerCase();

const getLogDateValue = (momentValue) => String(momentValue ?? "").slice(0, 10);

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
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [responsibleQuery, setResponsibleQuery] = useState("");
  const [affectedQuery, setAffectedQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const fetchAllLogs = async () => {
      setLoading(true);
      setError("");

      try {
        const firstPage = await getHouseLogsService(1, SERVER_LIMIT);
        const pageRequests = [];

        for (let currentPage = 2; currentPage <= firstPage.totalPages; currentPage += 1) {
          pageRequests.push(getHouseLogsService(currentPage, SERVER_LIMIT));
        }

        const extraPages = pageRequests.length > 0 ? await Promise.all(pageRequests) : [];
        const nextLogs = [
          ...firstPage.data,
          ...extraPages.flatMap((result) => result.data),
        ];

        if (!isCancelled) {
          setLogs(nextLogs);
        }
      } catch (fetchError) {
        if (!isCancelled) {
          setError(fetchError?.message || "No se pudieron obtener los registros.");
          setLogs([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchAllLogs();

    return () => {
      isCancelled = true;
    };
  }, []);

  const actionOptions = useMemo(() => {
    const uniqueActions = [...new Set(logs.map((log) => String(log.action ?? "").trim()).filter(Boolean))];

    return [
      { value: "all", label: "Todas las acciones" },
      ...uniqueActions
        .sort((a, b) => a.localeCompare(b, "es"))
        .map((action) => ({ value: action, label: action })),
    ];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const normalizedResponsibleQuery = normalizeText(responsibleQuery);
    const normalizedAffectedQuery = normalizeText(affectedQuery);

    return logs.filter((log) => {
      const matchesResponsible =
        normalizedResponsibleQuery === "" ||
        normalizeText(log.responsibleName).includes(normalizedResponsibleQuery);

      const matchesAffected =
        normalizedAffectedQuery === "" ||
        normalizeText(log.affectedName).includes(normalizedAffectedQuery);

      const matchesAction =
        actionFilter === "all" || String(log.action ?? "") === actionFilter;

      const matchesDate =
        dateFilter === "" || getLogDateValue(log.moment) === dateFilter;

      return matchesResponsible && matchesAffected && matchesAction && matchesDate;
    });
  }, [logs, responsibleQuery, affectedQuery, actionFilter, dateFilter]);

  const totalPages = Math.ceil(filteredLogs.length / UI_PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [responsibleQuery, affectedQuery, actionFilter, dateFilter]);

  useEffect(() => {
    if (totalPages === 0 && page !== 1) {
      setPage(1);
      return;
    }

    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (page - 1) * UI_PAGE_SIZE;
    return filteredLogs.slice(startIndex, startIndex + UI_PAGE_SIZE);
  }, [filteredLogs, page]);

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
    logs: paginatedLogs,
    totalLogs: filteredLogs.length,
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
