import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const PublicRoute = () => {
    const { isAuthenticated } = useAuth();

    return isAuthenticated ? (
        <Navigate to="/app/calendario" replace />
    ) : (
        <Outlet />
    );
};

export default PublicRoute;
