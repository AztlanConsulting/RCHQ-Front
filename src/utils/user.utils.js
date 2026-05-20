



class UserUtils {
    static getOwnEmployeeId = () => {
        const userData = getStoredUser();
        const tokenPayload = parseJwtPayload(getToken());
        const employeeId = userData?.employeeId ?? tokenPayload?.id ?? "";
        return employeeId;
    };

    static getCalendarViewerRole = () => {
        const userData = getStoredUser();
        const tokenPayload = parseJwtPayload(getToken());
    
        return userData?.role ?? userData?.roleName ?? tokenPayload?.role ?? "";
    };
};

export default UserUtils;