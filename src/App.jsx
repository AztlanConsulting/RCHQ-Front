import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/Landing";
import LoginPage from "./pages/auth/LoginPages";
import Dashboard from "./pages/Dashboard";
import Casas from "./pages/Casas";
import Personal from "./pages/Personal";
import Calendario from "./pages/Calendario";
import Perfil from "./pages/Perfil";
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import AltaNuevoUsuarioPage from "./pages/Personal/AltaPersonal";
// import ChangePassword from "./pages/auth/ChangePassword";
import TwoFactorLogin from "./pages/auth/TwoFactorLogin";
import TwoFactorAuth from "./pages/auth/TwoFactorAuth";
import MoreOptions from "./pages/MoreOptions";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />

                <Route element={<PublicRoute />}>
                    <Route path="/iniciar-sesion" element={<LoginPage />} />
                    <Route path="/2FA" element={<TwoFactorLogin />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route path="/app" element={<AppLayout />}>
                        <Route path="opciones" element={<MoreOptions />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="perfil" element={<Perfil />} />
                        <Route
                            path="personal/nuevo"
                            element={<AltaNuevoUsuarioPage />}
                        />
                        <Route path="personal" element={<Personal />} />
                        <Route path="casas" element={<Casas />} />
                        <Route path="calendario" element={<Calendario />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
