import { Datepicker } from "flowbite-react";
import { useDateField } from "../../hooks/atoms/useDateField";

const DateField = ({
    label,
    name,
    value,
    onChange,
    labelColor = "text-[#6b6b6b]",
    minDate,
    maxDate,
}) => {
    const dateValue = value ? new Date(`${value}T12:00:00`) : undefined;

    useDateField();

    const handleDateChange = (date) => {
        if (!date) {
            onChange({
                target: {
                    name,
                    value: "",
                },
            });
            return;
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        onChange({
            target: {
                name,
                value: `${year}-${month}-${day}`,
            },
        });
    };

    return (
        <div className="date-field-wrapper flex w-full flex-col gap-1.5">
            <label className={`text-sm font-bold sm:text-base ${labelColor}`}>
                {label}
            </label>

            <Datepicker
                language="es-ES"
                value={dateValue}
                onChange={handleDateChange}
                showTodayButton={false}
                showClearButton={false}
                minDate={minDate}
                maxDate={maxDate}
                theme={{
                    root: {
                        input: {
                            field: {
                                base: "flex min-h-[50px] w-full cursor-text items-center rounded-lg bg-neutral-50 shadow-[inset_0px_4px_4px_#00000040] overflow-hidden",

                                input: {
                                    base: "h-full w-full flex-1 bg-transparent border-0 outline-none text-sm font-medium text-[#222] placeholder-[#aaaaaa] sm:text-base focus:ring-0 px-4",

                                    colors: {
                                        gray: "bg-transparent text-[#222] focus:border-transparent focus:ring-0",
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
                                        base: "flex items-center justify-center rounded-lg text-sm font-medium w-9 h-9 hover:bg-gray-100",
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

export default DateField;
