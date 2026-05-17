import VacationDateField from "../atoms/vacationDateField";
import SelectField from "../atoms/selectField";
import TextField from "../atoms/textField";
import Button from "../atoms/button";

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
        <section className="mb-5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className={`grid grid-cols-1 items-end gap-4 ${gridColumns}`}>
                <TextField
                    id="vacation-search"
                    text="Buscar por nombre o CURP"
                    placeholder="Nombre, apellido o CURP"
                    value={searchQuery}
                    setValue={setSearchQuery}
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
        </section>
    );
};

export default VacationRequestFilters;