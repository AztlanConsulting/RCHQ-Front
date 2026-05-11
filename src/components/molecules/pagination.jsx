import Button from "../atoms/button";

const Pagination = ({
  page, totalPages, total,
  onPrevPage, onNextPage,
  loading, hasEmployees,
  itemLabel = "empleados",
}) => {
  if (loading || !hasEmployees) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 mt-6">
      <Button 
        text="Anterior" 
        onClick={onPrevPage} 
        disabled={page === 1}
        bgColor="bg-[#24375e]" 
        hoverColor="hover:bg-[#162d4a]" 
        activeColor="active:bg-[#0f2035]"
        textColor="text-white" 
        width="w-full sm:w-32"
        className="disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1" 
      />

      <span className="text-sm text-gray-600 text-center order-1 sm:order-2">
        Página {page} de {totalPages} | Total: {total} {itemLabel}
      </span>

      <Button 
        text="Siguiente" 
        onClick={onNextPage} 
        disabled={page === totalPages}
        bgColor="bg-[#24375e]" 
        hoverColor="hover:bg-[#162d4a]" 
        activeColor="active:bg-[#0f2035]"
        textColor="text-white" 
        width="w-full sm:w-32"
        className="disabled:opacity-50 disabled:cursor-not-allowed order-3" 
      />
    </div>
  );
};

export default Pagination;