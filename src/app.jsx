import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing";
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

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
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
