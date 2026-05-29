import { useRef } from "react";
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
    placeholder = "dd / mm / yyyy",
    native = false,
    popupAlign = "left",
    popupSize = "default",
    popupPlacement = "bottom",
    popupStrategy = "absolute",
    wrapperClassName = "",
    inputWrapperClassName = "",
    inputClassName = "",
    labelClassName = "",
    error = false,
    filterDate,
}) => {
    const dateValue = value ? new Date(`${value}T12:00:00`) : null;
    const isCompactPopup = popupSize === "compact";
    const wrapperRef = useRef(null);
    const shouldUseFixedPopup = popupStrategy === "fixed";

    useDateField(!native);

    const wrappedFilterDate = (date, view) => {
        if (!filterDate) return true;

        if (view === "days") return filterDate(date, "days");

        if (view === "months") {
            const year = date.getFullYear();
            const month = date.getMonth();
            const lastDay = new Date(year, month + 1, 0).getDate();

            for (let d = 1; d <= lastDay; d++) {
                const testDate = new Date(year, month, d, 12, 0, 0);
                if (filterDate(testDate, "days")) return true;
            }
            return false;
        }
        return filterDate(date, view);
    };

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
        if (!wrappedFilterDate(date, "days")) return;

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

    const updateFixedPopupPosition = () => {
        if (!shouldUseFixedPopup || !wrapperRef.current) return;

        const rect = wrapperRef.current.getBoundingClientRect();
        const gap = 12;
        const viewportPadding = 24;
        const popupWidth = isCompactPopup ? 248 : 280;
        const popupHeight = isCompactPopup ? 300 : 340;

        const minLeft = viewportPadding;
        const maxLeft = window.innerWidth - popupWidth - viewportPadding;

        const preferredLeft =
            popupAlign === "right"
                ? rect.right - popupWidth
                : rect.left;

        const left = Math.min(Math.max(preferredLeft, minLeft), maxLeft);

        const hasEnoughBottomSpace =
            window.innerHeight - rect.bottom >= popupHeight + gap;

        const preferredBottomTop = rect.bottom + gap;
        const preferredTopTop = rect.top - popupHeight - gap;

        const top =
            popupPlacement === "top" && rect.top >= popupHeight + gap
                ? preferredTopTop
                : Math.min(
                    preferredBottomTop,
                    window.innerHeight - popupHeight - viewportPadding,
                );

        wrapperRef.current.style.setProperty("--datepicker-fixed-left", `${left}px`);
        wrapperRef.current.style.setProperty("--datepicker-fixed-top", `${top}px`);
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
            <div className={`date-field-wrapper flex w-full flex-col gap-1.5 ${wrapperClassName}`}>
                <label
                    className={`text-sm font-bold sm:text-base ${labelColor} ${labelClassName}`}
                >
                    {label}
                </label>

                <div className={`flex min-h-[50px] w-full items-center rounded-lg bg-neutral-50 px-4 ${inputWrapperClassName}`} style={{ boxShadow: error ? "inset 0 0 0 2px #f87171, inset 0px 4px 4px #00000040" : "inset 0px 4px 4px #00000040" }}>
                    <input
                        type="date"
                        name={name}
                        value={value ?? ""}
                        placeholder={placeholder}
                        min={minValue}
                        max={maxValue}
                        onChange={onChange}
                        className={`h-full w-full flex-1 border-0 bg-transparent text-sm font-medium text-[#222] outline-none sm:text-base ${inputClassName}`}
                    />
                </div>
            </div>
        );
    }

    const popupHorizontalClass = popupAlign === "right" ? "right-0" : "left-0";

    const popupVerticalClass =
        popupPlacement === "top"
            ? "!top-auto !bottom-full mb-2"
            : "!top-10 !bottom-auto pt-2";

    const popupPositionClass = shouldUseFixedPopup
        ? "fixed !top-[var(--datepicker-fixed-top)] !left-[var(--datepicker-fixed-left)] !right-auto !bottom-auto z-[9999]"
        : `absolute ${popupVerticalClass} ${popupHorizontalClass} z-[80]`;

    return (
        <div
            ref={wrapperRef}
            onFocusCapture={updateFixedPopupPosition}
            onClickCapture={updateFixedPopupPosition}
            className={`date-field-wrapper relative flex w-full flex-col gap-1.5 ${wrapperClassName}`}
        >
            <label className={`text-sm font-bold sm:text-base ${labelColor} ${labelClassName}`}>
                {label}
            </label>

            <Datepicker
                key={value ?? "empty-date"}
                language="es-ES"
                value={dateValue ?? null}
                onChange={handleDateChange}
                placeholder={placeholder}
                showTodayButton={false}
                showClearButton={false}
                minDate={minDate}
                maxDate={maxDate}
                filterDate={wrappedFilterDate}
                theme={{
                    root: {
                        input: {
                            field: {
                                base: `flex min-h-[50px] w-full cursor-text items-center overflow-hidden rounded-lg bg-neutral-50 ${error ? "[box-shadow:inset_0_0_0_2px_#f87171,inset_0px_4px_4px_#00000040]" : "shadow-[inset_0px_4px_4px_#00000040]"} ${inputWrapperClassName}`,

                                input: {
                                    base: `h-full w-full flex-1 border-0 bg-transparent px-4 text-sm font-medium text-[#222] outline-none placeholder-[#aaaaaa] focus:ring-0 sm:text-base ${inputClassName}`,

                                    colors: {
                                        gray: "bg-transparent text-[#222] focus:border-transparent focus:ring-0",
                                    },
                                },
                            },
                        },
                    },

                    popup: {
                        root: {
                            base: `${popupPositionClass} block`,
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
                                    disabled:
                                        "cursor-not-allowed text-slate-300! opacity-100! line-through hover:bg-transparent",
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
