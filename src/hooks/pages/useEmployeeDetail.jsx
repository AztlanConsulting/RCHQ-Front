import { useEffect, useState, useCallback } from "react";
import { getEmployeeDetailService } from "../../services/employeeDetailService";

export const useEmployeeDetail = (employeeId) => {
  const [employee, setEmployee]                       = useState({});
  const [employeeAddress, setEmployeeAddress]         = useState({});
  const [employeeHouse, setEmployeeHouse]             = useState({});
  const [employeeShifts, setEmployeeShifts]       = useState([]);
  const [employeeVacationRequests, setEmployeeVacationRequests] = useState([]);
  const [employeeAbsenceUsedDays, setEmployeeAbsenceUsedDays]   = useState(0);
  const [isLoading, setIsLoading]   = useState(true);
  const [currentTab, setCurrentTab] = useState("overview");
  const [alert, setAlert]           = useState({});

  useEffect(() => {
    if (!alert?.message) return;
    const timer = setTimeout(() => setAlert({}), 4000);
    return () => clearTimeout(timer);
  }, [alert]);

  const getEmployeeDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const data      = await getEmployeeDetailService(employeeId);
      const basicInfo = data?.data?.employee?.basicInfo ?? null;
      const adminInfo = data?.data?.employee?.adminInfo ?? null;
      setEmployee(basicInfo.employee);
      setEmployeeAddress(basicInfo.address);
      setEmployeeHouse(basicInfo.house);
      setEmployeeShifts(adminInfo.shifts ?? []);
      setEmployeeVacationRequests(adminInfo.vacationRequests ?? []);
      setEmployeeAbsenceUsedDays(adminInfo.absenceUsedDays ?? 0);
    } catch (err) {
      setAlert({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    getEmployeeDetail();
  }, [getEmployeeDetail]);

  return {
    employee,
    employeeAddress,
    employeeHouse,
    employeeShifts,
    employeeVacationRequests,
    employeeAbsenceUsedDays,
    isLoading,
    currentTab,
    setCurrentTab,
    alert,
    setAlert,
    getEmployeeDetail,
  };
};
