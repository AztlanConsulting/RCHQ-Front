import { Navigate, Outlet } from "react-router-dom";
import { getFirstLoginToken, getToken } from "../utils/authStorage";

const FirstLoginRoute = () => {
  const firstLoginToken = getFirstLoginToken();
  const sessionToken = getToken();

  if (sessionToken) {
    return <Navigate to="/app/calendario" replace />;
  }

  return firstLoginToken ? (
    <Outlet />
  ) : (
    <Navigate to="/iniciar-sesion" replace />
  );
};

export default FirstLoginRoute;
