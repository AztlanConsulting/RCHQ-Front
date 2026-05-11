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
}) => {
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
      {label && (
        <legend className={`font-semibold text-sm mb-2 ${labelColor}`}>
          {label}
        </legend>
      )}
      <div className="flex flex-col gap-1.5">
        {options.map((opt) => {
          const baseId = name || "filter";
          const inputId = `${baseId}-${String(opt.value)}`;
          return (
            <label
              key={String(opt.value)}
              htmlFor={inputId}
              className="flex items-center gap-2 cursor-pointer"
            >
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
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};

export default FilterGroup;
