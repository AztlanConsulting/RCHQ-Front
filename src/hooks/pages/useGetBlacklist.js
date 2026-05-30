import { useEffect, useState } from "react";
import { getBlacklist } from "../../services/blacklistService";

const EMPTY_PAGINATION = {
  page: 1,
  limit: 7,
  total: 0,
  totalPages: 0,
  currentPage: 1,
};

const isEmptyBlacklistResponse = (err) => {
  const message = String(err?.message || "").toLowerCase();

  return err?.status === 404 || message.includes("no hay personas en la lista negra");
};

export const useGetBlacklist = ({ enabled = true } = {}) => {
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBlacklistedFilter, setIsBlacklistedFilter] = useState(undefined);
  const [page, setPage] = useState(1);
  const limit = 7;

  const fetchBlacklist = async (pageNum = 1, curp = "", isBlacklisted = undefined) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getBlacklist(pageNum, limit, curp, isBlacklisted);
      setEmployees(result.data);
      setPagination({
        page: result.pagination.currentPage,
        limit,
        total: result.pagination.totalItems,
        totalPages: result.pagination.totalPages,
        currentPage: result.pagination.currentPage,
      });
    } catch (err) {
      if (isEmptyBlacklistResponse(err)) {
        setEmployees([]);
        setPagination({
          ...EMPTY_PAGINATION,
          page: 1,
          currentPage: 1,
        });
        setError(null);
        return;
      }

      setEmployees([]);
      setPagination(EMPTY_PAGINATION);
      setError(err.message);
      console.error("Error fetching blacklist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    fetchBlacklist(1, searchQuery, isBlacklistedFilter);
    setPage(1);
  }, [enabled, isBlacklistedFilter, searchQuery]);

  const handleNextPage = () => {
    if (page < pagination.totalPages) {
      const newPage = page + 1;
      setPage(newPage);
      fetchBlacklist(newPage, searchQuery, isBlacklistedFilter);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      fetchBlacklist(newPage, searchQuery, isBlacklistedFilter);
    }
  };

  const refresh = () => {
    if (!enabled) return;
    fetchBlacklist(page, searchQuery, isBlacklistedFilter);
  };

  return {
    employees,
    pagination,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    isBlacklistedFilter,
    setIsBlacklistedFilter,
    page,
    handleNextPage,
    handlePrevPage,
    refresh,
  };
};
