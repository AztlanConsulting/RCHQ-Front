import { useEffect, useRef } from "react";

const SingleSelectDropdown = ({
    id,
    label,
    labelColor = "text-[#374151]",
    placeholder,
    value,
    options,
    isOpen,
    disabled = false,
    emptyText = "Sin opciones",
    onToggle,
    onChange,
    onClose,
    renderOption,
    renderSelected,
}) => {
    const dropdownRef = useRef(null);
    const selectedOption = options.find(
        (option) => String(option.value) === String(value),
    );

    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideClick = (event) => {
            if (!dropdownRef.current?.contains(event.target)) {
                onClose?.();
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [isOpen, onClose]);

    return (
        <div ref={dropdownRef} className="relative flex w-full flex-col gap-1.5">
            {label ? (
                <label className={`text-sm font-bold sm:text-base ${labelColor}`}>
                    {label}
                </label>
            ) : null}

            <button
                type="button"
                id={id}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={`${id}-listbox`}
                disabled={disabled}
                onClick={onToggle}
                className="flex min-h-[50px] w-full items-center justify-between rounded-lg bg-neutral-50 px-4 text-left shadow-[inset_0px_4px_4px_#00000040] outline-none transition focus:ring-2 focus:ring-[#1E3A5F]/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
                <span
                    className={`min-w-0 flex-1 truncate text-sm font-medium sm:text-base ${
                        selectedOption ? "text-[#222]" : "text-[#aaaaaa]"
                    }`}
                >
                    {selectedOption
                        ? (renderSelected?.(selectedOption) ??
                            selectedOption.label)
                        : placeholder}
                </span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-3 h-4 w-4 shrink-0 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {isOpen && (
                <ul
                    id={`${id}-listbox`}
                    role="listbox"
                    aria-labelledby={id}
                    className="absolute left-0 right-0 top-[54px] z-30 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg"
                >
                    {options.map((option) => {
                        const isSelected =
                            String(option.value) === String(value);

                        return (
                            <li
                                key={String(option.value)}
                                role="option"
                                aria-selected={isSelected}
                                aria-label={option.label}
                                tabIndex={0}
                                onClick={() => onChange(option.value)}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === "Enter" ||
                                        event.key === " "
                                    ) {
                                        event.preventDefault();
                                        onChange(option.value);
                                    }
                                }}
                                className={`cursor-pointer px-3 py-2 outline-none hover:bg-slate-100 focus:bg-slate-100 ${
                                    isSelected
                                        ? "bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]"
                                        : "text-slate-800"
                                }`}
                            >
                                {renderOption?.(option) ?? option.label}
                            </li>
                        );
                    })}

                    {options.length === 0 ? (
                        <li className="px-3 py-3 text-sm text-slate-500">
                            {emptyText}
                        </li>
                    ) : null}
                </ul>
            )}
        </div>
    );
};

export default SingleSelectDropdown;
