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
    native = false,
    popupAlign = "left",
    popupSize = "default",
}) => {
    const dateValue = value ? new Date(`${value}T12:00:00`) : null;
    const isCompactPopup = popupSize === "compact";

    useDateField(!native);

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

        if (minDate && date < minDate) return;
        if (maxDate && date > maxDate) return;

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

    if (native) {
        const minValue =
            minDate instanceof Date
                ? minDate.toISOString().slice(0, 10)
                : undefined;
        const maxValue =
            maxDate instanceof Date
                ? maxDate.toISOString().slice(0, 10)
                : undefined;

        return (
            <div className="date-field-wrapper flex w-full flex-col gap-1.5">
                <label
                    className={`text-sm font-bold sm:text-base ${labelColor}`}
                >
                    {label}
                </label>

                <div className="flex min-h-[50px] w-full items-center rounded-lg bg-neutral-50 px-4 shadow-[inset_0px_4px_4px_#00000040]">
                    <input
                        type="date"
                        name={name}
                        value={value ?? ""}
                        placeholder="dd / mm / yyyy"
                        min={minValue}
                        max={maxValue}
                        onChange={onChange}
                        className="h-full w-full flex-1 bg-transparent border-0 outline-none text-sm font-medium text-[#222] sm:text-base"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="date-field-wrapper flex w-full flex-col gap-1.5">
            <label className={`text-sm font-bold sm:text-base ${labelColor}`}>
                {label}
            </label>

            <Datepicker
                language="es-ES"
                value={dateValue}
                onChange={handleDateChange}
                label="dd / mm / yyyy"
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
                        root: {
                            base: `absolute top-10 z-50 block pt-2 ${popupAlign === "right" ? "right-0" : "left-0"}`,
                            inline: "relative top-0 z-auto",
                            inner: `inline-block rounded-lg bg-white shadow-lg dark:bg-gray-700 ${isCompactPopup ? "p-3" : "p-4"}`,
                        },
                        header: {
                            selectors: {
                                button: {
                                    base: isCompactPopup
                                        ? "rounded-lg bg-white px-3 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                                        : "rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600",
                                },
                            },
                        },
                    },
                    views: {
                        days: {
                            items: {
                                base: isCompactPopup
                                    ? "grid w-56 grid-cols-7"
                                    : "grid w-64 grid-cols-7",
                                item: {
                                    base: isCompactPopup
                                        ? "block flex-1 cursor-pointer rounded-lg border-0 text-center text-xs font-semibold leading-8 text-gray-900 hover:bg-gray-100"
                                        : "block flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-semibold leading-9 text-gray-900 hover:bg-gray-100",
                                    selected:
                                        "!bg-[#24375e] !text-white hover:!bg-[#162d4a] focus:!bg-[#24375e]",
                                },
                            },
                        },
                        months: {
                            items: {
                                base: isCompactPopup
                                    ? "grid w-56 grid-cols-4"
                                    : "grid w-64 grid-cols-4",
                                item: {
                                    base: isCompactPopup
                                        ? "block flex-1 cursor-pointer rounded-lg border-0 text-center text-xs font-semibold leading-8 text-gray-900 hover:bg-gray-100"
                                        : "block flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-semibold leading-9 text-gray-900 hover:bg-gray-100",
                                    selected:
                                        "!bg-[#24375e] !text-white hover:!bg-[#162d4a] focus:!bg-[#24375e]",
                                },
                            },
                        },
                        years: {
                            items: {
                                base: isCompactPopup
                                    ? "grid w-56 grid-cols-4"
                                    : "grid w-64 grid-cols-4",
                                item: {
                                    base: isCompactPopup
                                        ? "block flex-1 cursor-pointer rounded-lg border-0 text-center text-xs font-semibold leading-8 text-gray-900 hover:bg-gray-100"
                                        : "block flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-semibold leading-9 text-gray-900 hover:bg-gray-100",
                                    selected:
                                        "!bg-[#24375e] !text-white hover:!bg-[#162d4a] focus:!bg-[#24375e]",
                                },
                            },
                        },
                        decades: {
                            items: {
                                base: isCompactPopup
                                    ? "grid w-56 grid-cols-4"
                                    : "grid w-64 grid-cols-4",
                                item: {
                                    base: isCompactPopup
                                        ? "block flex-1 cursor-pointer rounded-lg border-0 text-center text-xs font-semibold leading-8 text-gray-900 hover:bg-gray-100"
                                        : "block flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-semibold leading-9 text-gray-900 hover:bg-gray-100",
                                    selected:
                                        "!bg-[#24375e] !text-white hover:!bg-[#162d4a] focus:!bg-[#24375e]",
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
