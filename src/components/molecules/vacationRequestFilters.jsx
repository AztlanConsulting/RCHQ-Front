import { useState } from "react";
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
    setView,
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
    const [isMobileExpanded, setIsMobileExpanded] = useState(false);

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

    return (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
            <div className="mb-4 sm:hidden">
                <button
                    type="button"
                    onClick={() => setIsMobileExpanded((current) => !current)}
                    className="flex w-full items-center justify-between rounded-lg bg-[#24375e] px-4 py-3 text-left text-sm font-semibold text-white"
                    aria-expanded={isMobileExpanded}
                    aria-controls="vacation-request-filters-panel"
                >
                    <span>
                        {isMobileExpanded
                            ? "Ocultar filtros"
                            : "Mostrar filtros"}
                    </span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 transition-transform ${isMobileExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </button>
            </div>

            <div
                id="vacation-request-filters-panel"
                className={`${isMobileExpanded ? "flex" : "hidden"} flex-col gap-4 sm:flex sm:gap-5`}
            >
                <div className="grid grid-cols-1 gap-4 sm:hidden">
                    <div className="min-w-0">
                        <TextField
                            id="vacation-search"
                            text="Buscar empleado"
                            placeholder="Ingresa nombre, apellido o CURP"
                            value={searchQuery}
                            setValue={handleSearchChange}
                            maxLength={100}
                            labelClassName="text-sm font-bold text-[#121212]"
                        />
                    </div>

                    <div className="min-w-0">
                        <SelectField
                            id="vacation-request-view"
                            name="vacation-request-view"
                            label="Vista de solicitudes"
                            value={view}
                            onChange={(event) => setView(event.target.value)}
                            options={[
                                { value: "pending", label: "Pendientes" },
                                { value: "reviewed", label: "Revisadas" },
                            ]}
                            labelColor="text-[#121212]"
                        />
                    </div>

                    {view === "reviewed" ? (
                        <div className="min-w-0">
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
                        </div>
                    ) : null}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:hidden">
                    <div className="min-w-0">
                        <VacationDateField
                            label="Fecha de inicio"
                            name="startDate"
                            value={startDate}
                            onChange={handleStartDateChange}
                            minDate={minFilterDate}
                            maxDate={getEarlierDate(selectedEndDate, maxFilterDate)}
                        />
                    </div>

                    <div className="min-w-0">
                        <VacationDateField
                            label="Fecha de término"
                            name="endDate"
                            value={endDate}
                            onChange={handleEndDateChange}
                            minDate={getLaterDate(selectedStartDate, minFilterDate)}
                            maxDate={maxFilterDate}
                            calendarStartDate={selectedStartDate}
                        />
                    </div>

                    <div className="flex flex-col justify-end">
                        <BigButton
                            text="Limpiar"
                            onClick={clearFilters}
                            className="w-full min-w-0 px-4"
                        />
                    </div>
                </div>

                <div className="hidden sm:block">
                    <div className="flex flex-row align-bottom content-end gap-3">
                        <TextField
                            id="vacation-search"
                            text="Buscar empleado"
                            placeholder="Ingresa nombre, apellido o CURP"
                            value={searchQuery}
                            setValue={handleSearchChange}
                            maxLength={100}
                            labelClassName="text-sm font-bold text-[#121212]"
                        />

                        <SelectField
                            id="vacation-request-view"
                            name="vacation-request-view"
                            label="Vista de solicitudes"
                            value={view}
                            onChange={(event) => setView(event.target.value)}
                            options={[
                                { value: "pending", label: "Pendientes" },
                                { value: "reviewed", label: "Revisadas" },
                            ]}
                            labelColor="text-[#121212]"
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
                    </div>

                    <div className="mt-2 flex flex-row align-bottom content-end gap-3">
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
            </div>
        </div>
    );
};

export default VacationRequestFilters;
