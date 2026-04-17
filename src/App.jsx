import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./Pages/Landing";
import LoginPage from "./Pages/Auth/LoginPages";
import Dashboard from "./Pages/Dashboard";
import Casas from "./Pages/Casas";
import Personal from "./Pages/Personal";
import Calendario from "./Pages/Calendario";
import Perfil from "./Pages/Perfil";
import ProtectedRoute from "./Components/ProtectedRoute";
import AppLayout from "./Components/AppLayout";
import AltaNuevoUsuarioPage from "./Pages/Personal/AltaPersonal";
// import ChangePassword from "./Pages/Auth/ChangePassword";
// import TwoFactorLogin from "./Pages/Auth/TwoFactorLogin";
// import TwoFactorAuth from "./Pages/Auth/TwoFactorAuth";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                {/* <Route path="/change-password" element={<ChangePassword />} />
                    <Route path="/two-factor-login" element={<TwoFactorLogin />} />
                    <Route path="/setup-2fa" element={<TwoFactorAuth />} /> */}

                <Route element={<ProtectedRoute />}>
                    <Route path="/app" element={<AppLayout />}>
                        <Route
                            index
                            element={<Navigate to="dashboard" replace />}
                        />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="casas" element={<Casas />} />
                        <Route path="personal" element={<Personal />} />
                        <Route
                            path="personal/nuevo"
                            element={<AltaNuevoUsuarioPage />}
                        />
                        <Route path="calendario" element={<Calendario />} />
                        <Route path="perfil" element={<Perfil />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
