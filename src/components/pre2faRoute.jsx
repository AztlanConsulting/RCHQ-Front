import { Navigate, Outlet } from "react-router-dom";
import AuthUtils from "../utils/auth.utils";

const PreTwoFactorAuthRoute = () => {
  const token = AuthUtils.getPreTwoFactorAuthToken();
  return token ? <Outlet /> : <Navigate to="/iniciar-sesion" replace />;
};

export default PreTwoFactorAuthRoute;
