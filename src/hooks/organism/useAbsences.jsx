import { useState, useEffect, useCallback, useRef } from "react";
import { getAllAbsencesService } from "../../services/absenceService";

const PAGE_LIMIT = 6;

const sanitizeName = (value) =>
  value
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñÜü\s]/g, "");

export const useAbsences = () => {
  const [absences,   setAbsences]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);

  const [searchName,     setSearchNameRaw]  = useState("");
  const [filterEvidence, setFilterEvidence] = useState("");
  const [filterHouseId,  setFilterHouseId]  = useState("");
  const [filterStart,    setFilterStart]    = useState("");
  const [filterEnd,      setFilterEnd]      = useState("");
  const [filterDeleted,  setFilterDeleted]  = useState("false");

  const [activeFilters, setActiveFilters] = useState({ deleted: "false" });

  const nameDebounce = useRef(null);

  const setSearchName = useCallback((value) => setSearchNameRaw(sanitizeName(value)), []);

  const fetchAbsences = useCallback(async (currentPage, filters) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllAbsencesService(currentPage, PAGE_LIMIT, filters);
      setAbsences(res.data ?? []);
      setTotalPages(res.pagination?.totalPages ?? 1);
      setTotal(res.pagination?.total ?? 0);
    } catch (err) {
      setError(err.message ?? "Error al cargar las ausencias");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAbsences(page, activeFilters); }, [page, activeFilters, fetchAbsences]);

  useEffect(() => {
    clearTimeout(nameDebounce.current);
    nameDebounce.current = setTimeout(() => {
      setPage(1);
      setActiveFilters((prev) => {
        const next = { ...prev };
        if (searchName) next.name = searchName; else delete next.name;
        return next;
      });
    }, 500);
    return () => clearTimeout(nameDebounce.current);
  }, [searchName]);

  useEffect(() => {
    setPage(1);
    setActiveFilters((prev) => {
      const next = { ...prev };
      if (filterHouseId) next.houseId = filterHouseId; else delete next.houseId;
      return next;
    });
  }, [filterHouseId]);

  useEffect(() => {
    setPage(1);
    setActiveFilters((prev) => {
      const next = { ...prev };
      if (filterEvidence) next.evidence = filterEvidence; else delete next.evidence;
      return next;
    });
  }, [filterEvidence]);

  useEffect(() => {
    setPage(1);
    setActiveFilters((prev) => {
      const next = { ...prev };
      if (filterStart) next.startFrom = filterStart; else delete next.startFrom;
      return next;
    });
  }, [filterStart]);

  useEffect(() => {
    setPage(1);
    setActiveFilters((prev) => {
      const next = { ...prev };
      if (filterEnd) next.endTo = filterEnd; else delete next.endTo;
      return next;
    });
  }, [filterEnd]);

  useEffect(() => {
    setPage(1);
    setActiveFilters((prev) => ({ ...prev, deleted: filterDeleted }));
  }, [filterDeleted]);

  const clearFilters = useCallback(() => {
    setSearchNameRaw("");
    setFilterEvidence("");
    setFilterHouseId("");
    setFilterStart("");
    setFilterEnd("");
    setFilterDeleted("false");
    setActiveFilters({ deleted: "false" });
    setPage(1);
  }, []);

  const goNextPage = useCallback(() => setPage((p) => Math.min(p + 1, totalPages)), [totalPages]);
  const goPrevPage = useCallback(() => setPage((p) => Math.max(p - 1, 1)), []);

  return {
    absences, loading, error,
    page, totalPages, total,
    goNextPage, goPrevPage,
    searchName,    setSearchName,
    filterEvidence, setFilterEvidence,
    filterHouseId,  setFilterHouseId,
    filterStart,    setFilterStart,
    filterEnd,      setFilterEnd,
    filterDeleted,  setFilterDeleted,
    clearFilters,
  };
};