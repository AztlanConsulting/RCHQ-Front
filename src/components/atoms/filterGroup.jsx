import { useState } from "react";
import Type from "./type";

const FilterGroup = ({
  label,
  name,
  options = [],
  values = [],
  setValues,
  onChange,
  disabled = false,
  labelColor = "text-[#121212]",
  className = "w-full",
  defaultOpen = true,
  children
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const emit = (next) => {
    if (onChange) onChange(next);
    else setValues?.(next);
  };

  const toggle = (optionValue, checked) => {
    if (checked) {
      if (!values.includes(optionValue)) emit([...values, optionValue]);
    } else {
      emit(values.filter((v) => v !== optionValue));
    }
  };

  return (
    <fieldset
      className={`border-0 p-0 m-0 min-w-0 ${className}`}
      disabled={disabled}
    >
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between cursor-pointer"
      >
        {label && (
          <Type variant="metric-label" className="text-sm" as="p">
            {label}
          </Type>
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="flex flex-col gap-1.5 mt-2">
          {options.map((opt) => {
            const baseId = name || "filter";
            const inputId = `${baseId}-${String(opt.value)}`;
            return (
              <label
                key={String(opt.value)}
                htmlFor={inputId}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2 cursor-pointer">
                  <input
                    id={inputId}
                    type="checkbox"
                    name={name}
                    value={String(opt.value)}
                    checked={values.includes(opt.value)}
                    onChange={(e) => toggle(opt.value, e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={disabled}
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {opt.label}
                  </span>
                </div>
                <div>
                  {children}
                </div>
              </label>
            );
          })}
        </div>
      )}
    </fieldset>
  );
};

export default FilterGroup;
