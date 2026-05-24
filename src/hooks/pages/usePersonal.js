import { useState, useCallback } from "react";
import { useEmployees } from "./useGetAllEmployees";
import { useGetBlacklist } from "./useGetBlacklist";
import { addToBlacklist } from "../../services/blacklistService";

const usePersonal = () => {
  const [isBlacklistMode, setIsBlacklistMode] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const employeesQuery = useEmployees();
  const blacklistQuery = useGetBlacklist();

  const showAlert = useCallback((type, message) => {
    setAlert({ type, message });
  }, []);

  const handleToggleBlacklistMode = useCallback(() => {
    setAlert(null);
    setIsBlacklistMode((prev) => {
      if (!prev) blacklistQuery.refresh();
      return !prev;
    });
  }, [blacklistQuery]);

  const handleAddToBlacklist = useCallback((employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  }, []);

  const handleModalCancel = useCallback(() => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  }, []);

  const handleModalConfirm = useCallback(
    async (reason) => {
      if (!selectedEmployee) return;
      setIsSubmitting(true);

      try {
        const data = await addToBlacklist(selectedEmployee.curp, reason);
        if (data.message?.toLowerCase().includes("falló")) {
          showAlert("warning", "Empleado agregado a la lista negra, pero falló el registro de auditoría.");
        } else {
          showAlert("success", "Empleado agregado a la lista negra correctamente.");
        }
        blacklistQuery.refresh();
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
    },
    [selectedEmployee, blacklistQuery, showAlert],
  );

  return {
    isBlacklistMode,
    selectedEmployee,
    isModalOpen,
    isSubmitting,
    alert,
    setAlert,
    handleToggleBlacklistMode,
    handleAddToBlacklist,
    handleModalCancel,
    handleModalConfirm,
    activeEmployees: isBlacklistMode ? blacklistQuery.employees : employeesQuery.employees,
    activePagination: isBlacklistMode ? blacklistQuery.pagination : employeesQuery.pagination,
    activeLoading: isBlacklistMode ? blacklistQuery.loading : employeesQuery.loading,
    activeError: isBlacklistMode ? blacklistQuery.error : employeesQuery.error,
    activePage: isBlacklistMode ? blacklistQuery.page : employeesQuery.page,
    activeNextPage: isBlacklistMode ? blacklistQuery.handleNextPage : employeesQuery.handleNextPage,
    activePrevPage: isBlacklistMode ? blacklistQuery.handlePrevPage : employeesQuery.handlePrevPage,
    activeSearchQuery: isBlacklistMode ? blacklistQuery.searchQuery : employeesQuery.searchQuery,
    activeSetSearchQuery: isBlacklistMode ? blacklistQuery.setSearchQuery : employeesQuery.setSearchQuery,
    activeFilter: employeesQuery.activeFilter,
    setActiveFilter: employeesQuery.setActiveFilter,
    isBlacklistedFilter: blacklistQuery.isBlacklistedFilter,
    setIsBlacklistedFilter: blacklistQuery.setIsBlacklistedFilter,
  };
};

export default usePersonal;