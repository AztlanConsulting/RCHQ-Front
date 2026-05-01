import { useEffect, useState, useCallback } from "react";
import { getEmployeeDetailService } from "../../Services/EmployeeDetailService";

export const useEmployeeDetail = (employeeId) => {
  // const [employeeBasicInfo, setEmployeeBasicInfo] = useState({});
  // const [employeeAdminInfo, setEmployeeAdminInfo] = useState({});
  // const [employeeRecord, setEmployeeRecord] = useState({});
  const [employee, setEmployee] = useState({});
  const [employeeAddress, setEmployeeAddress] = useState({});
  const [employeeHouse, setEmployeeHouse] = useState({});
  const [employeeFaults, setEmployeeFaults] = useState({});
  const [employeeWorkdays, setEmployeeWorkdays] = useState({});
  const [employeeVacationRequests, setEmployeeVacationRequests] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("overview");
  const [error, setError] = useState();
  const [alert, setAlert] = useState({});

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert({}), 4000);
    return () => clearTimeout(timer);
  }, [alert]);

  const getEmployeeDetail = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getEmployeeDetailService(employeeId);
      console.log("data from service file: ", data);

      const basicInfo = data?.data?.employee?.basicInfo ?? null;
      const adminInfo = data?.data?.employee?.adminInfo ?? null;
      // const record = data?.data?.employee?.record ?? null;

      setEmployee(basicInfo.employee);
      setEmployeeAddress(basicInfo.address);
      setEmployeeHouse(basicInfo.house);
      setEmployeeFaults(adminInfo.faults);
      setEmployeeWorkdays(adminInfo.workdays);
      setEmployeeVacationRequests(adminInfo.vacationRequests);
      // setEmployeeAdminInfo(adminInfo);
      // setEmployeeRecord(record);
    } catch (err) {
      setError(err.message);
      setAlert({ type: "error", message: `${err.message}` });
    } finally {
      setIsLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    getEmployeeDetail();
  }, [employeeId]);

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
    error,
    alert,
  };
};
