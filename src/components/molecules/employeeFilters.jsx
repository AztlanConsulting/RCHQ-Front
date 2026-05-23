import TextField from "../atoms/textField";
import SelectField from "../atoms/selectField";
import useSearch from "../../hooks/molecules/useSearch";
import Button from "../atoms/button";

const EmployeeFilters = ({
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  isBlacklistMode = false,
  onToggleBlacklistMode,
}) => {
  const { inputValue, handleChange, handleKeyDown } = useSearch(
    searchQuery,
    setSearchQuery,
  );

  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
      <div className="flex items-end gap-4">
        <div className="flex-1 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TextField
            id="search"
            text="Buscar empleado"
            placeholder="Ingresa nombre o apellido"
            value={inputValue}
            setValue={handleChange}
            onKeyDown={handleKeyDown}
            labelClassName="text-sm font-bold text-[#121212]"
          />

          {!isBlacklistMode && (
            <SelectField
              label="Estado (activo/inactivo)"
              name="status"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              options={[
                { value: "true", label: "Activos" },
                { value: "false", label: "Inactivos" },
              ]}
              labelColor="text-[#121212]"
            />
          )}

          {isBlacklistMode && (
            <div className="hidden lg:block" />
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
    </div>
  );
};

export default EmployeeFilters;