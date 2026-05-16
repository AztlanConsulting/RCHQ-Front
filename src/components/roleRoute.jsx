import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { hasRole } from "../utils/auth/getRoleName";

const RoleRoute = ({ allowedRoles = [], redirectTo = "/app/calendario" }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/iniciar-sesion" replace />;
    }

    const isAllowed = allowedRoles.some((role) => hasRole(user, role));

    if (!isAllowed) {
        return <Navigate to={redirectTo} replace />;
    }

    return <Outlet />;
};

export default RoleRoute;
