import FilterGroup from "../atoms/filterGroup";
import Type from "../atoms/type";

const CalendarFilters = ({ houseName, scopeFilters, setScopeFilters, typeFilters, setTypeFilters, className = "" }) => {
  return (
    <div
      className={`p-6 mb-6 ${className}`}
    >
      {houseName ? (
        <Type variant="section-title" as="h2" className="mb-4">
          {houseName}
        </Type>
      ) : null}
      <div className="flex flex-col gap-6">
        <FilterGroup {...scopeFilters} />
        <FilterGroup {...typeFilters} />
      </div>
    </div>
  );
};

export default CalendarFilters;
