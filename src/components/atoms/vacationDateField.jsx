import { Datepicker } from "flowbite-react";
import { useDateField, toDateValue, toInputDate } from "../../hooks/atoms/useDateField";

const VacationDateField = ({
    label,
    name,
    value,
    onChange,
    labelColor = "text-[#121212]",
    minDate,
    maxDate,
    placeholder = "Selecciona una fecha",
    calendarStartDate,
}) => {
    useDateField(true);

    const dateValue = toDateValue(value);
    const initialCalendarDate = dateValue || calendarStartDate || null;

    const handleDateChange = (date) => {
        onChange({
            target: {
                name,
                value: date ? toInputDate(date) : "",
            },
        });
    };

    return (
        <div className="date-field-wrapper flex w-full flex-col gap-1">
            <label className={`font-semibold text-sm ${labelColor}`}>
                {label}
            </label>

            <Datepicker
                key={`${name}-${value || calendarStartDate?.toISOString() || "empty"}`}
                language="es-ES"
                value={dateValue}
                onChange={handleDateChange}
                placeholder={placeholder}
                showTodayButton={false}
                showClearButton={false}
                minDate={minDate}
                maxDate={maxDate}
                defaultDate={initialCalendarDate}
                theme={{
                    root: {
                        input: {
                            field: {
                                base: "flex h-[50px] w-full cursor-text items-center rounded-lg bg-neutral-50 shadow-[inset_0px_4px_4px_#00000040] overflow-hidden",
                                input: {
                                    base: "h-full w-full flex-1 bg-transparent border-0 outline-none text-base font-medium text-[#121212] placeholder-[#aaaaaa] focus:ring-0 px-4",
                                    colors: {
                                        gray: "bg-transparent text-[#121212] focus:border-transparent focus:ring-0",
                                    },
                                },
                            },
                        },
                    },
                    popup: {
                        body: {
                            view: {
                                items: {
                                    item: {
                                        base: "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium hover:bg-gray-100",
                                        selected:
                                            "!bg-[#24375e] !text-white hover:!bg-[#162d4a] focus:!bg-[#24375e]",
                                    },
                                },
                            },
                        },
                    },
                }}
            />
        </div>
    );
};

export default VacationDateField;