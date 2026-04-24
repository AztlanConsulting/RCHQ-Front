// FirstLoginRoute.jsx es un componente de ruta que controla el acceso a las
// páginas de primer inicio de sesión. Verifica si el usuario tiene un token de
// primer inicio de sesión válido y redirige en consecuencia.

// Componente generado con ChatGPT, revisado por Iván Flores

import { Navigate, Outlet } from "react-router-dom";
import { getFirstLoginToken, getToken } from "../utils/authStorage";

const FirstLoginRoute = () => {
    const firstLoginToken = getFirstLoginToken();
    const sessionToken = getToken();

    if (sessionToken) {
        return <Navigate to="/app/dashboard" replace />;
    }

    return firstLoginToken ? (
        <Outlet />
    ) : (
        <Navigate to="/iniciar-sesion" replace />
    );
};

export default FirstLoginRoute;