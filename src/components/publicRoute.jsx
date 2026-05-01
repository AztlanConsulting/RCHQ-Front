import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const PublicRoute = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? (
    <Navigate to="/app/dashboard" replace />
  ) : (
    <Outlet />
  );
};

export default PublicRoute;
