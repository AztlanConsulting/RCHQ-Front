import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import AuthUtils from "../utils/auth.utils";

const RoleRoute = ({ allowedRoles = [], redirectTo = "/app/calendario" }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/iniciar-sesion" replace />;
    }

    const isAllowed = allowedRoles.some((role) =>
        AuthUtils.hasRole(user, role),
    );

    if (!isAllowed) {
        return <Navigate to={redirectTo} replace />;
    }

    return <Outlet />;
};

export default RoleRoute;
