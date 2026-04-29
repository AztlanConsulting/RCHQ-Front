import { useEffect, useState, useCallback } from "react";
import { getEmployeeDetailService } from "../../Services/EmployeeDetailService";

export const useEmployeeDetail = (employeeId) => {
    const [employeeBasicInfo, setEmployeeBasicInfo] = useState({});
    const [employeeAdminInfo, setEmployeeAdminInfo] = useState({});
    const [employeeRecord, setEmployeeRecord] = useState({});
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
            const record = data?.data?.employee?.record ?? null;
    
            setEmployeeBasicInfo(basicInfo);
            setEmployeeAdminInfo(adminInfo);
            setEmployeeRecord(record);
          } catch (err) {
            console.log("Error getting employee detail: ", err);
            setError(err.message);
            setAlert({ type: "error", message: `${err.message}` });
          } finally {
            setIsLoading(false);
          }
    }, [employeeId]);

    useEffect(() => {
        getEmployeeDetail();
    },[employeeId]);


    return {
        employeeBasicInfo,
        employeeAdminInfo,
        employeeRecord,
        isLoading,
        currentTab,
        setCurrentTab,
        error,
        alert,
    };
};
