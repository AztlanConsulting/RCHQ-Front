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
import warningSvg from "/error.svg";

const BlacklistBanner = ({ className = "", iconSize = "w-5 h-5", textSize = "", padding = "p-4" }) => (
    <div className={`flex w-full items-center gap-3 bg-yellow-400 text-black rounded-lg shadow-md ${padding} ${className}`}>
        <img src={warningSvg} className={`${iconSize} shrink-0`} alt="warning" />
        <span className={`flex-1 whitespace-pre-line ${textSize}`}>
            Estás en modo de lista negra
        </span>
    </div>
);

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
        isBlacklistedFilter,
        setIsBlacklistedFilter,
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
        setIsBlacklistMode((prev) => {
            if (!prev) refreshBlacklist();
            return !prev;
        });
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
        <div className="p-4 md:p-8 md:flex md:flex-col md:h-full">
            <div className="flex items-center justify-between mb-4 md:mb-8">
                <h1 className="font-bold text-3xl md:text-4xl text-[#121212]">Usuarios</h1>
                {!isBlacklistMode && (
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
                )}
            </div>

            {isBlacklistMode && (
                <BlacklistBanner
                    className="flex md:hidden mb-4"
                    iconSize="w-4 h-4"
                    textSize="text-xs"
                />
            )}

            <EmployeeFilters
                searchQuery={activeSearchQuery}
                setSearchQuery={activeSetSearchQuery}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                isBlacklistMode={isBlacklistMode}
                onToggleBlacklistMode={handleToggleBlacklistMode}
                isBlacklistedFilter={isBlacklistedFilter}
                setIsBlacklistedFilter={setIsBlacklistedFilter}
            />

            {isBlacklistMode && (
                <BlacklistBanner
                    className="hidden md:flex mb-2"
                />
            )}

            {alert && (
                <div className="mb-2">
                    <Alert
                        type={alert.type}
                        message={alert.message}
                        icon={warningSvg}
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