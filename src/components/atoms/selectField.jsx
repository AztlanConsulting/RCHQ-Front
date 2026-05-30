import { createPortal } from "react-dom";
import useSelectField from "../../hooks/atoms/useSelectField";

const SelectField = ({
  label,
  id,
  name,
  value,
  setValue,
  onChange,
  options = [],
  placeholder = "Selecciona una opción",
  required = false,
  labelColor = "text-[#121212]",
  disabled = false,
  error = false,
}) => {
  const {
    isOpen,
    setIsOpen,
    menuStyle,
    triggerRef,
    menuRef,
    fieldName,
    labelId,
    selectedOption,
    handleValueChange,
  } = useSelectField({
    id,
    name,
    value,
    setValue,
    onChange,
    options,
  });

  return (
    <div className="flex w-full flex-col gap-1">
      {label && (
        <label
          id={labelId}
          htmlFor={id}
          className={`font-semibold text-sm ${labelColor}`}
        >
          {label}
          {required && (
            <span className="ml-0.5 text-red-600" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <select
        id={id}
        name={fieldName}
        value={value}
        onChange={(e) => handleValueChange(e.target.value)}
        disabled={disabled}
        className="sr-only"
        aria-labelledby={label ? labelId : undefined}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <div
        ref={triggerRef}
        className="relative h-[50px] w-full rounded-lg bg-neutral-50"
        style={{
          boxShadow: error
            ? "inset 0 0 0 2px #f87171, inset 0px 4px 4px #00000040"
            : "inset 0px 4px 4px #00000040",
        }}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((currentValue) => !currentValue)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? `${labelId} ${id}-trigger-text` : `${id}-trigger-text`}
          className="flex h-full w-full items-center justify-between gap-3 rounded-lg bg-transparent py-0 pl-[19px] pr-3 text-left text-base font-medium outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span
            id={`${id}-trigger-text`}
            className={`${value !== "" ? "text-[#121212]" : "text-[#aaaaaa]"} min-w-0 flex-1 truncate`}
          >
            {selectedOption?.label || placeholder}
          </span>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
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

      {isOpen && menuStyle && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              className="fixed z-[9999] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
              style={{
                top: `${menuStyle.top}px`,
                left: `${menuStyle.left}px`,
                width: `${menuStyle.width}px`,
              }}
            >
              <ul role="listbox" aria-labelledby={label ? labelId : undefined}>
                {options.map((opt) => {
                  const isSelected = String(opt.value) === String(value);

                  return (
                    <li key={opt.value}>
                      <button
                        type="button"
                        onClick={() => handleValueChange(opt.value)}
                        className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-[#24375e] text-white"
                            : "bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected ? <span aria-hidden="true">✓</span> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};

export default SelectField;
