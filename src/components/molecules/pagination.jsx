import BigButton from "../atoms/bigButton";

const Pagination = ({
  page,
  totalPages,
  total,
  onPrevPage,
  onNextPage,
  loading,
  hasItems,
  hasEmployees,
  entityLabel = "empleados",
  itemLabel,
}) => {
  const shouldShowPagination = hasItems ?? hasEmployees;
  const resolvedItemLabel = itemLabel ?? entityLabel;

  if (!shouldShowPagination) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
      <BigButton
        text="Anterior"
        onClick={onPrevPage}
        disabled={loading || page === 1}
        className="w-full min-w-0 sm:w-32"
      />

      <div className="flex items-center justify-center px-2 text-center">
        <span className="text-sm text-gray-600">
          Página {page} de {totalPages} | Total: {total}
          {resolvedItemLabel ? ` ${resolvedItemLabel}` : ""}
        </span>
      </div>

      <BigButton
        text="Siguiente"
        onClick={onNextPage}
        disabled={loading || page === totalPages}
        className="w-full min-w-0 sm:w-32"
      />
    </div>
  );
};

export default Pagination;
