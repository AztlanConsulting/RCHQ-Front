import TextField from "../../Components/Atoms/TextField";
import SelectField from "../../Components/Atoms/SelectField";

const EmployeeFilters = ({
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
}) => {
    return (
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <TextField
                    id="search"
                    text="Buscar por Nombre"
                    placeholder="Ingresa nombre o apellido"
                    value={searchQuery}
                    setValue={(value) => {
                        const onlyLetters = value.replace(
                            /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
                            "",
                        );
                        setSearchQuery(onlyLetters);
                    }}
                    labelClassName="text-sm font-bold text-[#121212]"
                />

                <SelectField
                    label="Estado (Activo/Inactivo)"
                    name="status"
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                    options={[
                        { value: "true", label: "Activos" },
                        { value: "false", label: "Inactivos" },
                    ]}
                    labelColor="text-[#121212]"
                />
            </div>
        </div>
    );
};

export default EmployeeFilters;
