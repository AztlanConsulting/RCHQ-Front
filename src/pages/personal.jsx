import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/atoms/button";
import EmployeeFilters from "../components/molecules/employeeFilters";
import EmployeeTable from "../components/molecules/employeeTable";
import Pagination from "../components/molecules/pagination";
import BlacklistModal from "../components/molecules/blacklistModal";
import Alert from "../components/atoms/alerts";
import { useEmployees } from "../hooks/pages/useGetAllEmployees";
import { useGetBlacklist } from "../hooks/pages/useGetBlacklist";
import { addToBlacklist } from "../services/blacklistService";

const Personal = () => {
    const navigate = useNavigate();
    const [isBlacklistMode, setIsBlacklistMode] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alert, setAlert] = useState(null);
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

    const {
        employees: blacklistEmployees,
        pagination: blacklistPagination,
        loading: blacklistLoading,
        error: blacklistError,
        searchQuery: blacklistSearchQuery,
        setSearchQuery: setBlacklistSearchQuery,
        page: blacklistPage,
        handleNextPage: blacklistNextPage,
        handlePrevPage: blacklistPrevPage,
        refresh: refreshBlacklist,
    } = useGetBlacklist();

    const showAlert = (type, message) => {
        setAlert({ type, message });
    };

    const handleToggleBlacklistMode = () => {
        setAlert(null);
        setIsBlacklistMode((prev) => !prev);
    };

    const handleAddToBlacklist = (employee) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        setSelectedEmployee(null);
    };

    const handleModalConfirm = async (reason) => {
        if (!selectedEmployee) return;
        setIsSubmitting(true);

        try {
            const data = await addToBlacklist(selectedEmployee.curp, reason);
            if (data.message?.toLowerCase().includes("falló")) {
                showAlert("warning", "Empleado agregado a la lista negra, pero falló el registro de auditoría.");
            } else {
                showAlert("success", "Empleado agregado a la lista negra correctamente.");
            }

            refreshBlacklist();
            setIsModalOpen(false);
            setSelectedEmployee(null);
        } catch (err) {
            const status = err.status;

            if (status === 400) {
                showAlert("error", "Datos inválidos. Verifica el formato de la CURP o la razón ingresada.");
            } else if (status === 403) {
                showAlert("error", err.message || "No tienes permisos para realizar esta acción.");
            } else if (status === 404) {
                showAlert("error", "Empleado no encontrado.");
            } else if (status === 409) {
                showAlert("error", "Este empleado ya se encuentra en la lista negra.");
            } else {
                showAlert("error", "Ocurrió un error interno. Intenta de nuevo más tarde.");
            }

            setIsModalOpen(false);
            setSelectedEmployee(null);
        } finally {
            setIsSubmitting(false);
        }
    };
    const activeEmployees = isBlacklistMode ? blacklistEmployees : employees;
    const activePagination = isBlacklistMode ? blacklistPagination : pagination;
    const activeLoading = isBlacklistMode ? blacklistLoading : loading;
    const activeError = isBlacklistMode ? blacklistError : error;
    const activePage = isBlacklistMode ? blacklistPage : page;
    const activeNextPage = isBlacklistMode ? blacklistNextPage : handleNextPage;
    const activePrevPage = isBlacklistMode ? blacklistPrevPage : handlePrevPage;
    const activeSearchQuery = isBlacklistMode ? blacklistSearchQuery : searchQuery;
    const activeSetSearchQuery = isBlacklistMode ? setBlacklistSearchQuery : setSearchQuery;

    return (
        <div className="p-8 md:flex md:flex-col md:h-full">
            <div className="flex items-center justify-between mb-8">
                <h1 className="font-bold text-4xl text-[#121212]">Usuarios</h1>
                <Button
                    text="Añadir"
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
                searchQuery={activeSearchQuery}
                setSearchQuery={activeSetSearchQuery}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                isBlacklistMode={isBlacklistMode}
                onToggleBlacklistMode={handleToggleBlacklistMode}
            />

            {isBlacklistMode && (
                <div className="flex items-center gap-3 bg-[#F5A623] rounded-lg px-5 py-3 mb-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 text-white shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                        />
                    </svg>
                    <span className="font-semibold text-white text-sm">
                        Estás en modo de lista negra
                    </span>
                </div>
            )}

            {alert && (
                <div className="mb-4">
                    <Alert
                        type={alert.type}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                </div>
            )}

            <div className="md:flex-1 md:min-h-0 md:overflow-y-auto">
                <EmployeeTable
                    employees={activeEmployees}
                    loading={activeLoading}
                    error={activeError}
                    isBlacklistMode={isBlacklistMode}
                    onAddToBlacklist={handleAddToBlacklist}
                />
            </div>

            <Pagination
                page={activePage}
                totalPages={activePagination.totalPages}
                total={activePagination.total}
                onPrevPage={activePrevPage}
                onNextPage={activeNextPage}
                loading={activeLoading}
                hasEmployees={activeEmployees.length > 0}
            />

            <BlacklistModal
                isOpen={isModalOpen}
                employeeName={selectedEmployee?.fullName ?? ""}
                onConfirm={handleModalConfirm}
                onCancel={handleModalCancel}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default Personal;