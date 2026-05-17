import { Checkbox, Dropdown } from "flowbite-react";
import Type from "../atoms/type";

const SearchableCheckboxDropdown = ({
  label,
  name,
  filteredOptions = [],
  values = [],
  search = "",
  selectedLabel = "Todos",
  onSearchChange,
  onToggleValue,
  onClearSelection,
  searchPlaceholder = "Buscar",
  triggerClassName = "",
  menuClassName = "",
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Type variant="metric-label" className="text-sm" as="p">
          {label}
        </Type>
      </div>

      <Dropdown
        inline
        arrowIcon={false}
        dismissOnClick={false}
        enableTypeAhead={false}
        placement="bottom-start"
        renderTrigger={() => (
          <button
            type="button"
            className={`inline-flex min-h-[50px] w-full items-center justify-between rounded-lg border border-slate-200 bg-neutral-50 px-4 py-2 text-left text-sm font-medium text-slate-700 shadow-[inset_0px_4px_4px_#00000020] transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1F3664]/20 sm:text-base ${triggerClassName}`}
          >
            <span className="min-w-0 flex-1 truncate pr-3">{selectedLabel}</span>
            <svg
              className="h-4 w-4 shrink-0 text-slate-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 9-7 7-7-7"
              />
            </svg>
          </button>
        )}
      >
        <div className={`w-[min(22rem,calc(100vw-2rem))] max-w-full sm:min-w-[17rem] ${menuClassName}`}>
          <div className="px-2 pt-2">
            <label htmlFor={`${name}-search`} className="sr-only">
              {searchPlaceholder}
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
                <svg
                  className="h-4 w-4 text-slate-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2"
                    d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                id={`${name}-search`}
                type="text"
                value={search}
                onChange={(event) => onSearchChange?.(event.target.value)}
                onKeyDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
                placeholder={searchPlaceholder}
                className="block w-full rounded-md border border-slate-300 bg-slate-50 py-2 pe-3 ps-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1F3664] focus:outline-none focus:ring-2 focus:ring-[#1F3664]/20"
              />
            </div>
          </div>

          <ul className="max-h-48 overflow-y-auto p-2 text-sm font-medium text-slate-700">
            {filteredOptions.map((option) => {
              const inputId = `${name}-${option.value}`;

              return (
                <li key={String(option.value)}>
                  <label
                    htmlFor={inputId}
                    className="inline-flex w-full cursor-pointer items-center rounded-md p-2 hover:bg-slate-100"
                  >
                    <Checkbox
                      id={inputId}
                      checked={values.includes(option.value)}
                      onChange={(event) =>
                        onToggleValue?.(option.value, event.target.checked)
                      }
                    />
                    <span className="ms-2 w-full text-sm font-medium text-slate-800">
                      {option.label}
                    </span>
                  </label>
                </li>
              );
            })}

            {filteredOptions.length === 0 ? (
              <li className="px-2 py-3 text-sm text-slate-500">
                Sin coincidencias
              </li>
            ) : null}
          </ul>

          <div className="p-2">
            <button
              type="button"
              onClick={onClearSelection}
              className="inline-flex w-full items-center justify-center rounded-md bg-[#C20000] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#930000] focus:outline-none focus:ring-2 focus:ring-[#C20000]/25"
            >
              Limpiar selección
            </button>
          </div>
        </div>
      </Dropdown>
    </div>
  );
};

export default SearchableCheckboxDropdown;
