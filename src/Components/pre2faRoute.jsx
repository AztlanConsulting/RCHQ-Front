import { Navigate, Outlet } from "react-router-dom";
import { getPreTwoFactorAuthToken } from "../utils/authStorage";

const PreTwoFactorAuthRoute = () => {
  const token = getPreTwoFactorAuthToken();
  return token ? <Outlet /> : <Navigate to="/iniciar-sesion" replace />;
};

export default PreTwoFactorAuthRoute;
