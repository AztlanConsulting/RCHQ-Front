import { useEffect, useState } from "react";
import { getBlacklist } from "../../services/blacklistService";

export const useGetBlacklist = () => {
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 7,
    total: 0,
    totalPages: 0,
  });
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
        total: result.pagination.totalItems,
        totalPages: result.pagination.totalPages,
        currentPage: result.pagination.currentPage,
      });
    } catch (err) {
      setError(err.message);
      console.error("Error fetching blacklist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlacklist(1, searchQuery, isBlacklistedFilter);
    setPage(1);
  }, [searchQuery, isBlacklistedFilter]);

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