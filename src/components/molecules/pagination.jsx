import Button from "../atoms/button";

const Pagination = ({
  page,
  totalPages,
  total,
  onPrevPage,
  onNextPage,
  loading,
  hasEmployees,
  entityLabel = "empleados",
}) => {
  if (loading || !hasEmployees) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Button
        text="Anterior"
        onClick={onPrevPage}
        disabled={page === 1}
        bgColor="bg-[#24375e]"
        hoverColor="hover:bg-[#162d4a]"
        activeColor="active:bg-[#0f2035]"
        textColor="text-white"
        width="w-full sm:w-32"
        className="disabled:opacity-50 disabled:cursor-not-allowed"
      />

      <div className="flex items-center justify-center px-2 text-center">
        <span className="text-sm text-gray-600">
          Página {page} de {totalPages} | Total: {total}
          {entityLabel ? ` ${entityLabel}` : ""}
        </span>
      </div>

      <Button
        text="Siguiente"
        onClick={onNextPage}
        disabled={page === totalPages}
        bgColor="bg-[#24375e]"
        hoverColor="hover:bg-[#162d4a]"
        activeColor="active:bg-[#0f2035]"
        textColor="text-white"
        width="w-full sm:w-32"
        className="disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
};

export default Pagination;
