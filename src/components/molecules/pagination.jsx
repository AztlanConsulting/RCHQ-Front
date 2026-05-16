import Button from "../atoms/button";

const Pagination = ({
  page,
  totalPages,
  total,
  onPrevPage,
  onNextPage,
  loading,
  hasEmployees,
  itemLabel = "empleados",
}) => {
  if (loading || !hasEmployees) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Button
        text="Anterior"
        onClick={onPrevPage}
        disabled={page === 1}
        bgColor="bg-[#24375e]"
        hoverColor="hover:bg-[#162d4a]"
        activeColor="active:bg-[#0f2035]"
        textColor="text-white"
        // width="w-32"
        width="w-full sm:w-32"
        className="disabled:opacity-50 disabled:cursor-not-allowed"
      />

      <div className="flex items-center justify-center gap-4">
        {/* <span className="text-sm text-gray-600"> */}
        <span className="text-center text-sm text-gray-600">
          Página {page} de {totalPages} | Total: {total} {itemLabel}
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
        // width="w-32"
        width="w-full sm:w-32"
        className="disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
};

export default Pagination;
