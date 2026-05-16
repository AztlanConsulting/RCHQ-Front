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
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={id} className={`font-semibold text-sm ${labelColor}`}>
          {label}
          {required && (
            <span className="text-red-600 ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative h-[50px] w-full rounded-lg bg-neutral-50 shadow-[inset_0px_4px_4px_#00000040]">
        <select
          id={id}
          name={name || id}
          value={value}
          onChange={
            onChange ? onChange : (e) => setValue && setValue(e.target.value)
          }
          disabled={disabled}
          className="h-full w-full cursor-pointer appearance-none rounded-lg border-0 bg-transparent py-0 pl-[19px] pr-10 text-base font-medium outline-none disabled:cursor-not-allowed disabled:opacity-60"
          style={{ color: value ? "#121212" : "#aaaaaa" }}
        >
          <option value="" disabled hidden>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              style={{ color: "#121212" }}
            >
              {opt.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute right-[13px] top-1/2 -translate-y-1/2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-gray-400"
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
        </div>
      </div>
    </div>
  );
};

export default SelectField;
