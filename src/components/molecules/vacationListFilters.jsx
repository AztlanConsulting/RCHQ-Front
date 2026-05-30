import VacationDateField from "../atoms/vacationDateField";
import SelectField from "../atoms/selectField";
import BigButton from "../atoms/bigButton";

const VacationListFilters = ({
    view,
    setView,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    statusFilter,
    setStatusFilter,
    clearFilters,
    isMobileExpanded,
    onToggleMobileFilters,
}) => {
    const handleStartDateChange = (event) => {
        setStartDate(event.target.value);
    };

    const handleEndDateChange = (event) => {
        setEndDate(event.target.value);
    };

    const statusOptions = [
        { value: "all", label: "Todas" },
        ...(view === "future"
            ? [{ value: "pending", label: "Pendientes" }]
            : []),
        { value: "approved", label: "Aprobadas" },
        { value: "rejected", label: "Rechazadas" },
    ];

    return (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
            <div className="mb-4 sm:hidden">
                <button
                    type="button"
                    onClick={onToggleMobileFilters}
                    className="flex w-full items-center justify-between rounded-lg bg-[#24375e] px-4 py-3 text-left text-sm font-semibold text-white"
                    aria-expanded={isMobileExpanded}
                    aria-controls="vacation-list-filters-panel"
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
                id="vacation-list-filters-panel"
                className={`${isMobileExpanded ? "grid" : "hidden"} grid-cols-1 gap-4 sm:grid sm:gap-6 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]`}
            >
                <SelectField
                    id="vacation-view"
                    name="vacation-view"
                    label="Vista de vacaciones"
                    value={view}
                    onChange={(event) => setView(event.target.value)}
                    options={[
                        { value: "future", label: "Vacaciones futuras" },
                        { value: "past", label: "Vacaciones pasadas" },
                    ]}
                    labelColor="text-[#121212]"
                />

                <SelectField
                    id="status"
                    name="status"
                    label="Filtrar por estado"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={statusOptions}
                    labelColor="text-[#121212]"
                />

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

export default VacationListFilters;
