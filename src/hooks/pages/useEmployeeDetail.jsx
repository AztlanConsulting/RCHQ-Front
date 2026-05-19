import { useEffect, useState, useCallback } from "react";
import { getEmployeeDetailService } from "../../services/employeeDetailService";

export const useEmployeeDetail = (employeeId) => {
  const [employee, setEmployee]                       = useState({});
  const [employeeAddress, setEmployeeAddress]         = useState({});
  const [employeeHouse, setEmployeeHouse]             = useState({});
  const [employeeFaults, setEmployeeFaults]           = useState([]);
  const [employeeWorkdays, setEmployeeWorkdays]       = useState([]);
  const [employeeVacationRequests, setEmployeeVacationRequests] = useState([]);
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
      setEmployeeFaults(adminInfo.faults   ?? []);
      setEmployeeWorkdays(adminInfo.workdays ?? []);
      setEmployeeVacationRequests(adminInfo.vacationRequests ?? []);
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
    employeeFaults,
    employeeWorkdays,
    employeeVacationRequests,
    isLoading,
    currentTab,
    setCurrentTab,
    alert,
    setAlert,
    getEmployeeDetail,
  };
};