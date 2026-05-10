//useAbsences
import { useState, useEffect, useCallback } from "react";
import { getAllAbsencesService } from "../../services/absenceService";

const PAGE_LIMIT = 6;

export const useAbsences = () => {
  const [absences, setAbsences]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);

  const fetchAbsences = useCallback(async (currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllAbsencesService(currentPage, PAGE_LIMIT);
      setAbsences(res.data ?? []);
      setTotalPages(res.pagination?.totalPages ?? 1);
      setTotal(res.pagination?.total ?? 0);
    } catch (err) {
      setError(err.message ?? "Error al cargar las ausencias");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAbsences(page);
  }, [page, fetchAbsences]);

  const goNextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const goPrevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1));
  }, []);


  return {
    absences,
    loading,
    error,
    page,
    totalPages,
    total,
    goNextPage,
    goPrevPage,
  };
};