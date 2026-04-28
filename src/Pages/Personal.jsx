import { useNavigate } from "react-router-dom";
import Button from "../Components/Atoms/Button";
import EmployeeFilters from "../Components/Molecules/EmployeeFilters";
import EmployeeTable from "../Components/Molecules/EmployeeTable";
import Pagination from "../Components/Molecules/Pagination";
import { useEmployees } from "../hooks/Pages/useGetAllEmployees";

const Personal = () => {
    const navigate = useNavigate();
    const {
        employees,
        pagination,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        activeFilter,
        setActiveFilter,
        page,
        handleNextPage,
        handlePrevPage,
    } = useEmployees();

    return (
        <div className="p-8 bg-white min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <h1 className="font-bold text-4xl text-[#121212]">
                    Usuarios de la casa
                </h1>
                <Button
                    text="Añadir nuevo usuario"
                    onClick={() => navigate("/app/personal/nuevo")}
                    bgColor="bg-[#24375e]"
                    hoverColor="hover:bg-[#162d4a]"
                    activeColor="active:bg-[#0f2035]"
                    textColor="text-white"
                    width="w-auto"
                    className="px-6"
                />
            </div>

            <EmployeeFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
            />

            <EmployeeTable
                employees={employees}
                loading={loading}
                error={error}
            />

            <Pagination
                page={page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
                loading={loading}
                hasEmployees={employees.length > 0}
            />
        </div>
    );
};

export default Personal;
