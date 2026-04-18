import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./Pages/Landing";
import LoginPage from "./Pages/Auth/LoginPages";
import Dashboard from "./Pages/Dashboard";
import Casas from "./Pages/Casas";
import Personal from "./Pages/Personal";
import Calendario from "./Pages/Calendario";
import Perfil from "./Pages/Perfil";
import PublicRoute from "./Components/PublicRoute";
import ProtectedRoute from "./Components/ProtectedRoute";
import AppLayout from "./Components/AppLayout";
// import ChangePassword from "./Pages/Auth/ChangePassword";
import TwoFactorLogin from "./Pages/Auth/TwoFactorLogin";
import TwoFactorAuth from "./Pages/Auth/TwoFactorAuth";
import MoreOptions from "./Pages/MoreOptions";

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
          <Route path="opciones" element={<MoreOptions/>}/>
          <Route path="setup-2fa" element={<TwoFactorAuth />} /> 
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="perfil" element={<Perfil />} />
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