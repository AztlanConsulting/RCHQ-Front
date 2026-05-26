import TextField from "../atoms/textField";
import SelectField from "../atoms/selectField";
import useSearch from "../../hooks/molecules/useSearch";
import Button from "../atoms/button";
import { useEffect, useRef, useState } from "react";

const CURP_MAX_LENGTH = 18;
const CURP_ALLOWED_REGEX = /^[A-ZÑ0-9]{0,18}$/i;

const EmployeeFilters = ({
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  isBlacklistMode = false,
  onToggleBlacklistMode,
  isBlacklistedFilter,
  setIsBlacklistedFilter,
}) => {
  const { inputValue, handleChange, handleKeyDown } = useSearch(
    searchQuery,
    setSearchQuery,
  );
  const [blacklistCurpInput, setBlacklistCurpInput] = useState(searchQuery);
  const lastBlacklistSearch = useRef(searchQuery);

  useEffect(() => {
    setBlacklistCurpInput(searchQuery);
    lastBlacklistSearch.current = searchQuery;
  }, [searchQuery]);

  const searchBlacklist = (value) => {
    if (lastBlacklistSearch.current === value) return;

    lastBlacklistSearch.current = value;
    setSearchQuery(value);
  };

  const handleCurpChange = (val) => {
    const upper = val.toUpperCase();
    if (upper.length <= CURP_MAX_LENGTH && CURP_ALLOWED_REGEX.test(upper)) {
      setBlacklistCurpInput(upper);

      if (upper.length === 0) {
        searchBlacklist("");
        return;
      }

      if (upper.length % 3 === 0) {
        searchBlacklist(upper);
      }
    }
  };

  const handleBlacklistKeyDown = (event) => {
    if (event.key === "Enter") {
      searchBlacklist(blacklistCurpInput);
    }
  };

  const blacklistFilterOptions = [
    { value: "", label: "Todos" },
    { value: "true", label: "En lista negra" },
    { value: "false", label: "Fuera de lista negra" },
  ];

  const statusOptions = [
    { value: "true", label: "Activos" },
    { value: "false", label: "Inactivos" },
  ];

  const handleBlacklistFilterChange = (e) => {
    const val = e.target.value;
    setIsBlacklistedFilter(val === "" ? undefined : val === "true");
  };

  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
      <div className="hidden md:flex items-end gap-4">
        <div className="flex-1 grid grid-cols-2 gap-6">
          {isBlacklistMode ? (
            <>
              <TextField
                id="search-curp"
                text="Buscar por CURP"
                placeholder="Ingresa la CURP"
                value={blacklistCurpInput}
                setValue={handleCurpChange}
                onKeyDown={handleBlacklistKeyDown}
                labelClassName="text-sm font-bold text-[#121212]"
              />
              <SelectField
                label="Filtrar"
                name="blacklisted-filter"
                value={isBlacklistedFilter === undefined ? "" : String(isBlacklistedFilter)}
                onChange={handleBlacklistFilterChange}
                options={blacklistFilterOptions}
                labelColor="text-[#121212]"
              />
            </>
          ) : (
            <>
              <TextField
                id="search"
                text="Buscar empleado"
                placeholder="Ingresa nombre o apellido"
                value={inputValue}
                setValue={handleChange}
                onKeyDown={handleKeyDown}
                labelClassName="text-sm font-bold text-[#121212]"
              />
              <SelectField
                label="Estado (activo/inactivo)"
                name="status"
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                options={statusOptions}
                labelColor="text-[#121212]"
              />
            </>
          )}
        </div>

        <Button
          text={isBlacklistMode ? "Lista Empleados" : "Lista Negra"}
          onClick={onToggleBlacklistMode}
          bgColor="bg-[#24375e]"
          hoverColor="hover:bg-[#162d4a]"
          activeColor="active:bg-[#0f2035]"
          textColor="text-white"
          width="w-auto"
          height="h-[50px]"
          className="px-6 shrink-0"
        />
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {isBlacklistMode ? (
          <TextField
            id="search-curp-mobile"
            text="Buscar por CURP"
            placeholder="Ingresa la CURP"
            value={blacklistCurpInput}
            setValue={handleCurpChange}
            onKeyDown={handleBlacklistKeyDown}
            labelClassName="text-sm font-bold text-[#121212]"
          />
        ) : (
          <TextField
            id="search-mobile"
            text="Buscar empleado"
            placeholder="Ingresa nombre o apellido"
            value={inputValue}
            setValue={handleChange}
            onKeyDown={handleKeyDown}
            labelClassName="text-sm font-bold text-[#121212]"
          />
        )}

        {isBlacklistMode ? (
          <SelectField
            label="Filtrar"
            name="blacklisted-filter-mobile"
            value={isBlacklistedFilter === undefined ? "" : String(isBlacklistedFilter)}
            onChange={handleBlacklistFilterChange}
            options={blacklistFilterOptions}
            labelColor="text-[#121212]"
          />
        ) : (
          <SelectField
            label="Estado (activo/inactivo)"
            name="status-mobile"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            options={statusOptions}
            labelColor="text-[#121212]"
          />
        )}

        <Button
          text={isBlacklistMode ? "Lista Empleados" : "Lista Negra"}
          onClick={onToggleBlacklistMode}
          bgColor="bg-[#24375e]"
          hoverColor="hover:bg-[#162d4a]"
          activeColor="active:bg-[#0f2035]"
          textColor="text-white"
          width="w-full"
          height="h-[50px]"
          className="mt-1"
        />
      </div>
    </div>
  );
};

export default EmployeeFilters;