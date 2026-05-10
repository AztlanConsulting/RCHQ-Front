import TextField from "../atoms/textField";
import SelectField from "../atoms/selectField";
import useSearch from "../../hooks/molecules/useSearch";

const EmployeeFilters = ({
  cols = 2,
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  searchLabel = "Buscar empleado",
  searchPlaceholder = "Ingresa nombre o apellido",
  statusOptions = [
    { value: "true",  label: "Activos" },
    { value: "false", label: "Inactivos" },
  ],
  statusLabel = "Estado (activo/inactivo)",
  children,
}) => {
  const { inputValue, handleChange, handleKeyDown } = useSearch(searchQuery, setSearchQuery);

  const gridClass = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  }[cols] ?? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm border border-gray-200">
      <div className={`grid ${gridClass} gap-4`}>
        <TextField
          id="search"
          text={searchLabel}
          placeholder={searchPlaceholder}
          value={inputValue}
          setValue={handleChange}
          onKeyDown={handleKeyDown}
          labelClassName="text-sm font-bold text-[#121212]"
        />
        <SelectField
          label={statusLabel}
          name="status"
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          options={statusOptions}
          labelColor="text-[#121212]"
        />
        {children}
      </div>
    </div>
  );
};

export default EmployeeFilters;