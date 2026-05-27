import VacationDateField from "../atoms/vacationDateField";
import SelectField from "../atoms/selectField";
import TextField from "../atoms/textField";
import BigButton from "../atoms/bigButton";
import { sanitizeSearchInput } from "../../utils/searchInput";
import {
    getEarlierDate,
    getLaterDate,
    getYearRangeDates,
    toFilterDate,
} from "../../utils/dateRange";

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

    const { minDate: minFilterDate, maxDate: maxFilterDate } =
        getYearRangeDates();
    const selectedStartDate = toFilterDate(startDate);
    const selectedEndDate = toFilterDate(endDate, true);

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
                    minDate={minFilterDate}
                    maxDate={getEarlierDate(selectedEndDate, maxFilterDate)}
                />

                <VacationDateField
                    label="Fecha de término"
                    name="endDate"
                    value={endDate}
                    onChange={handleEndDateChange}
                    minDate={getLaterDate(selectedStartDate, minFilterDate)}
                    maxDate={maxFilterDate}
                    calendarStartDate={selectedStartDate}
                />

                <div className="flex flex-col justify-end">
                    <BigButton
                        text="Limpiar"
                        onClick={clearFilters}
                        className="w-full min-w-0 px-4 lg:w-28"
                    />
                </div>
            </div>
        </div>
    );
};

export default VacationRequestFilters;
