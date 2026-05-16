import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const getRoleName = (user) => {
    const roleName =
        user?.role?.name ||
        user?.roleName ||
        user?.role ||
        "";

    return String(roleName).toLowerCase();
};

const RoleRoute = ({ allowedRoles = [], redirectTo = "/app/calendario" }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/iniciar-sesion" replace />;
    }

    const userRole = getRoleName(user);

    const isAllowed = allowedRoles
        .map((role) => String(role).toLowerCase())
        .includes(userRole);

    if (!isAllowed) {
        return <Navigate to={redirectTo} replace />;
    }

    return <Outlet />;
};

export default RoleRoute;
