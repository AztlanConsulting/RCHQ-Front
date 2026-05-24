import TextField from "../atoms/textField";
import SelectField from "../atoms/selectField";
import useEmployeeFilters from "../../hooks/molecules/useEmployeeFilters";
import Button from "../atoms/button";

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
  const {
    inputValue,
    handleChange,
    handleKeyDown,
    handleCurpChange,
    handleBlacklistFilterChange,
    blacklistFilterOptions,
    statusOptions,
  } = useEmployeeFilters({ searchQuery, setSearchQuery, setIsBlacklistedFilter });

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
                value={searchQuery}
                setValue={handleCurpChange}
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
            value={searchQuery}
            setValue={handleCurpChange}
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