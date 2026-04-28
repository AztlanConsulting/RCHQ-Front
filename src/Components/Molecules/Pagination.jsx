import Button from "../../Components/Atoms/Button";

const Pagination = ({
    page,
    totalPages,
    total,
    onPrevPage,
    onNextPage,
    loading,
    hasEmployees,
}) => {
    if (loading || !hasEmployees) {
        return null;
    }

    return (
        <div className="flex items-center justify-between mt-6">
            <Button
                text="Anterior"
                onClick={onPrevPage}
                disabled={page === 1}
                bgColor="bg-[#24375e]"
                hoverColor="hover:bg-[#162d4a]"
                activeColor="active:bg-[#0f2035]"
                textColor="text-white"
                width="w-32"
                className="disabled:opacity-50 disabled:cursor-not-allowed"
            />

            <div className="flex items-center justify-center gap-4">
                <span className="text-sm text-gray-600">
                    Página {page} de {totalPages} | Total: {total} empleados
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
                width="w-32"
                className="disabled:opacity-50 disabled:cursor-not-allowed"
            />
        </div>
    );
};

export default Pagination;
