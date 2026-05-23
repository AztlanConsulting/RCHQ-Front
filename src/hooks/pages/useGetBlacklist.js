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
  const [page, setPage] = useState(1);
  const limit = 7;

  const fetchBlacklist = async (pageNum = 1, curp = "") => {
    setLoading(true);
    setError(null);

    try {
      const result = await getBlacklist(pageNum, limit, curp);
      setEmployees(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching blacklist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlacklist(1, searchQuery);
    setPage(1);
  }, [searchQuery]);

  const handleNextPage = () => {
    if (page < pagination.totalPages) {
      const newPage = page + 1;
      setPage(newPage);
      fetchBlacklist(newPage, searchQuery);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      fetchBlacklist(newPage, searchQuery);
    }
  };

  const refresh = () => {
    fetchBlacklist(page, searchQuery);
  };

  return {
    employees,
    pagination,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    page,
    handleNextPage,
    handlePrevPage,
    refresh,
  };
};