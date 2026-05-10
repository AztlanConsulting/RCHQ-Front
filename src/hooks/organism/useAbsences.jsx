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

  // Filtros
  const [searchName, setSearchName]         = useState("");
  const [filterStatus, setFilterStatus]     = useState("");
  const [filterHouse, setFilterHouse]       = useState("");
  const [filterEvidence, setFilterEvidence] = useState("");
  const [filterStart, setFilterStart]       = useState("");
  const [filterEnd, setFilterEnd]           = useState("");
  const [filtersEnabled, setFiltersEnabled] = useState(true);

  // Modal de detalle
  const [selectedAbsence, setSelectedAbsence] = useState(null);

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

  const toggleFilters = useCallback(() => {
    setFiltersEnabled((v) => !v);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchName("");
    setFilterStatus("");
    setFilterHouse("");
    setFilterEvidence("");
    setFilterStart("");
    setFilterEnd("");
  }, []);

  // Filtrado local (los filtros se aplican sobre los datos ya traídos del back)
  const filteredAbsences = filtersEnabled
    ? absences.filter((a) => {
        const fullName = `${a.employee?.name ?? ""}`.toLowerCase();
        const house    = (a.employee?.house?.name ?? "").toLowerCase();

        if (searchName && !fullName.includes(searchName.toLowerCase())) return false;
        if (filterHouse && !house.includes(filterHouse.toLowerCase())) return false;
        if (filterStatus) {
          const hasEvidence = !!a.url;
          if (filterStatus === "con" && !hasEvidence) return false;
          if (filterStatus === "sin" && hasEvidence) return false;
        }
        if (filterEvidence) {
          if (filterEvidence === "con" && !a.url) return false;
          if (filterEvidence === "sin" && a.url) return false;
        }
        if (filterStart && a.start < filterStart) return false;
        if (filterEnd   && a.end   > filterEnd)   return false;
        return true;
      })
    : absences;

  return {
    absences: filteredAbsences,
    loading,
    error,
    page,
    totalPages,
    total,
    goNextPage,
    goPrevPage,
    // filtros
    filtersEnabled,
    toggleFilters,
    resetFilters,
    searchName,    setSearchName,
    filterStatus,  setFilterStatus,
    filterHouse,   setFilterHouse,
    filterEvidence,setFilterEvidence,
    filterStart,   setFilterStart,
    filterEnd,     setFilterEnd,
    // modal
    selectedAbsence,
    openDetail:  setSelectedAbsence,
    closeDetail: () => setSelectedAbsence(null),
  };
};