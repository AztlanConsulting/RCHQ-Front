import VacationDateField from "../atoms/vacationDateField";
import SelectField from "../atoms/selectField";
import TextField from "../atoms/textField";
import Button from "../atoms/button";
import { sanitizeSearchInput } from "../../utils/searchInput";

const VacationRequestFilters = ({
    view,
    searchQuery,
    setSearchQuery,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    statusFilter,
    setStatusFilter,
    clearFilters,
}) => {
    const handleSearchChange = (value) => {
        setSearchQuery(sanitizeSearchInput(value));
    };

    const handleStartDateChange = (event) => {
        setStartDate(event.target.value);
    };

    const handleEndDateChange = (event) => {
        setEndDate(event.target.value);
    };

    const gridColumns =
        view === "reviewed"
            ? "lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]"
            : "lg:grid-cols-[1.4fr_1fr_1fr_auto]";

    return (
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
            <div className={`grid grid-cols-1 gap-6 ${gridColumns}`}>
                <TextField
                    id="vacation-search"
                    text="Buscar empleado"
                    placeholder="Ingresa nombre, apellido o CURP"
                    value={searchQuery}
                    setValue={handleSearchChange}
                    maxLength={100}
                    labelClassName="text-sm font-bold text-[#121212]"
                />

                {view === "reviewed" && (
                    <SelectField
                        id="status"
                        name="status"
                        label="Filtrar por estado"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        options={[
                            { value: "all", label: "Todas" },
                            { value: "approved", label: "Aprobadas" },
                            { value: "rejected", label: "Rechazadas" },
                        ]}
                        labelColor="text-[#121212]"
                    />
                )}

                <VacationDateField
                    label="Fecha de inicio"
                    name="startDate"
                    value={startDate}
                    onChange={handleStartDateChange}
                    maxDate={endDate ? new Date(`${endDate}T12:00:00`) : undefined}
                />

                <VacationDateField
                    label="Fecha de término"
                    name="endDate"
                    value={endDate}
                    onChange={handleEndDateChange}
                    minDate={startDate ? new Date(`${startDate}T12:00:00`) : undefined}
                    calendarStartDate={
                        startDate ? new Date(`${startDate}T12:00:00`) : undefined
                    }
                />

                <div className="flex flex-col justify-end">
                    <Button
                        text="Limpiar"
                        onClick={clearFilters}
                        bgColor="bg-[#24375e]"
                        hoverColor="hover:bg-[#162d4a]"
                        activeColor="active:bg-[#0f2035]"
                        textColor="text-white"
                        width="w-full lg:w-28"
                        height="h-[50px]"
                        textSize="text-sm"
                        className="px-4"
                    />
                </div>
            </div>
        </div>
    );
};

export default VacationRequestFilters;
