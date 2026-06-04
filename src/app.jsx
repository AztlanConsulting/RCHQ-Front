import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/loginPages";
import Dashboard from "./pages/dashboard";
import Casas from "./pages/casas";
import Personal from "./pages/personal";
import Calendario from "./pages/calendario";
import Perfil from "./pages/perfil";
import PublicRoute from "./components/publicRoute";
import ProtectedRoute from "./components/protectedRoute";
import FirstLoginRoute from "./components/firstLoginRoute";
import Pre2FARoute from "./components/pre2faRoute";
import AppLayout from "./components/appLayout";
import ChangePassword from "./pages/auth/changePassword";
import AltaNuevoUsuarioPage from "./pages/personal/altaPersonal";
import TwoFactorLogin from "./pages/auth/twoFactorLogin";
import TwoFactorAuth from "./pages/auth/twoFactorAuth";
import MoreOptions from "./pages/moreOptions";
import Documents from "./pages/documents";
import DetalleEmpleado from "./pages/detalleEmpleado";
import LogsHouse from "./pages/logsHouse";
import VacationRequests from "./pages/vacationRequests";
import Logs from "./pages/logs";
import RoleRoute from "./components/roleRoute";
import Vacaciones from "./pages/vacaciones";
import Donaciones from "./pages/donaciones";
import Certificaciones from "./pages/certificaciones";
import Alert from "./components/atoms/alerts";
import NotFound from "./pages/notFound";
import warningSvg from "/error.svg";
import Beneficiarios from "./pages/beneficiaries";
import AltaBeneficiario from "./pages/beneficiaries/altaBeneficiario";

function App() {
  const [rateLimitMessage, setRateLimitMessage] = useState(null);

  useEffect(() => {
    const handleRateLimit = (e) => {
      const seconds = parseInt(e.detail?.resetSeconds, 10) || 60;
      const minutes = Math.ceil(seconds / 60);
      setRateLimitMessage(
        `Detente! Estás haciendo todo muy rápido. Intenta de nuevo en ${minutes} minuto(s).`
      );
    };
    window.addEventListener("api:rate-limit", handleRateLimit);
    return () => window.removeEventListener("api:rate-limit", handleRateLimit);
  }, []);

  return (
    <BrowserRouter>
      {rateLimitMessage && (
        <div className="fixed left-1/2 top-4 z-[9999] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2">
          <Alert
            type="warning"
            message={rateLimitMessage}
            icon={warningSvg}
            onClose={() => setRateLimitMessage(null)}
          />
        </div>
      )}
      <Routes>
        <Route path="/" element={<Navigate to="/iniciar-sesion" replace />} />

        <Route element={<PublicRoute />}>
          <Route path="/iniciar-sesion" element={<LoginPage />} />
        </Route>

        <Route element={<FirstLoginRoute />}>
          <Route
            path="/primer-inicio/cambiar-contrasena"
            element={<ChangePassword />}
          />
        </Route>

        <Route element={<Pre2FARoute />}>
          <Route path="/2FA" element={<TwoFactorLogin />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppLayout />}>
            <Route path=":employeeId/documentos" element={<Documents />} />
            <Route path="opciones" element={<MoreOptions />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="personal/nuevo" element={<AltaNuevoUsuarioPage />} />
            <Route path="personal" element={<Personal />} />
            <Route path="personal/ver/:employeeId" element={<DetalleEmpleado />} />
            <Route path="casas" element={<Casas />} />
            <Route path="calendario" element={<Calendario />} />
            <Route path="vacaciones" element={<Vacaciones />} />
            <Route path="donaciones" element={<Donaciones />} />
            <Route path="certificaciones" element={<Certificaciones />} />
            <Route path="beneficiarios/nuevo" element={<AltaBeneficiario />} />
            <Route path="beneficiarios" element={<Beneficiarios />} />
            
            <Route element={<RoleRoute allowedRoles={["Coordinador"]} />}>
              <Route path="acciones/casa" element={<LogsHouse />} />
              <Route path="vacaciones/solicitudes" element={<VacationRequests />} />
              <Route path="logs" element={<Logs />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/pages/notFound" replace />} />
          </Route>
        </Route>

        <Route path="/pages/notFound" element={<NotFound />} />

        <Route path="*" element={<Navigate to="/pages/notFound" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
