import { useCallback, useMemo } from "react";
import useSearch from "./useSearch";

const CURP_MAX_LENGTH = 18;
const CURP_ALLOWED_REGEX = /^[A-ZÑ0-9]{0,18}$/i;

const useEmployeeFilters = ({
  searchQuery,
  setSearchQuery,
  setIsBlacklistedFilter,
}) => {
  const { inputValue, handleChange, handleKeyDown } = useSearch(
    searchQuery,
    setSearchQuery,
  );

  const handleCurpChange = useCallback((val) => {
    const upper = val.toUpperCase();
    if (upper.length <= CURP_MAX_LENGTH && CURP_ALLOWED_REGEX.test(upper)) {
      setSearchQuery(upper);
    }
  }, [setSearchQuery]);

  const handleBlacklistFilterChange = useCallback((e) => {
    const val = e.target.value;
    setIsBlacklistedFilter(val === "" ? undefined : val === "true");
  }, [setIsBlacklistedFilter]);

  const blacklistFilterOptions = useMemo(() => [
    { value: "", label: "Todos" },
    { value: "true", label: "En lista negra" },
    { value: "false", label: "Fuera de lista negra" },
  ], []);

  const statusOptions = useMemo(() => [
    { value: "true", label: "Activos" },
    { value: "false", label: "Inactivos" },
  ], []);

  return {
    inputValue,
    handleChange,
    handleKeyDown,
    handleCurpChange,
    handleBlacklistFilterChange,
    blacklistFilterOptions,
    statusOptions,
  };
};

export default useEmployeeFilters;