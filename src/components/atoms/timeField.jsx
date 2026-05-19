import { createPortal } from "react-dom";
import { useTimeField } from "../../hooks/atoms/useTimeField";
import clockIcon from "/time.svg";
import chevronDownIcon from "/chevron-down.svg";

const TimeField = ({
    value = "",
    onChange,
    placeholder = "Hora",
    error,
    disabled = false,
    minTime,
}) => {
    const {
        isOpen,
        dropdownPos,
        containerRef,
        dropdownRef,
        listRef,
        times,
        selectedLabel,
        handleOpen,
        handleSelect,
    } = useTimeField({
        value,
        minTime,
        disabled,
        onChange,
    });

    return (
        <div ref={containerRef} className="relative w-full">
            <button
                type="button"
                disabled={disabled}
                onClick={handleOpen}
                className={`flex min-h-12.5 w-full cursor-pointer items-center gap-3 rounded-lg bg-neutral-50 px-4 shadow-[inset_0px_4px_4px_#00000040] ${
                    disabled ? "cursor-not-allowed opacity-50" : ""
                } ${error ? "ring-2 ring-red-400" : ""}`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <img
                    src={clockIcon}
                    alt=""
                    aria-hidden="true"
                    className="h-6 w-6 shrink-0 opacity-60"
                />

                <span
                    className={`flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left text-base font-medium ${
                        value ? "text-[#222]" : "text-[#aaaaaa]"
                    }`}
                >
                    {selectedLabel || placeholder}
                </span>

                <img
                    src={chevronDownIcon}
                    alt=""
                    aria-hidden="true"
                    className={`h-3.5 w-3.5 shrink-0 opacity-60 transition-transform duration-150 ${
                        isOpen ? "rotate-180" : "rotate-0"
                    }`}
                />
            </button>

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

            {isOpen &&
                createPortal(
                    <div
                        ref={dropdownRef}
                        style={{
                            position: "fixed",
                            top: dropdownPos.top,
                            left: dropdownPos.left,
                            width: dropdownPos.width,
                            zIndex: 9999,
                            background: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                            overflow: "hidden",
                        }}
                    >
                        <ul
                            ref={listRef}
                            role="listbox"
                            style={{
                                maxHeight: "200px",
                                overflowY: "auto",
                                margin: 0,
                                padding: "4px 8px",
                                listStyle: "none",
                            }}
                        >
                            {times.map((time) => {
                                const isSelected = time.value === value;

                                return (
                                    <li
                                        key={time.value}
                                        role="option"
                                        aria-selected={isSelected}
                                        data-active={isSelected}
                                        onClick={() => handleSelect(time.value)}
                                        style={{
                                            padding: "8px 10px",
                                            fontSize: "13px",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            background: isSelected
                                                ? "#1E3A5F"
                                                : "transparent",
                                            color: isSelected
                                                ? "#ffffff"
                                                : "#111827",
                                            fontWeight: isSelected
                                                ? "500"
                                                : "400",
                                            transition: "background 0.1s",
                                        }}
                                    >
                                        {time.label}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>,
                    document.body,
                )}
        </div>
    );
};

export default TimeField;
