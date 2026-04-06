import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./Pages/Landing";
import LoginPage from "./Pages/LoginPages";
import Dashboard from "./Pages/Dashboard";
import Casas from "./Pages/Casas";
import Personal from "./Pages/Personal";
import Calendario from "./Pages/Calendario";
import Perfil from "./Pages/Perfil";
import ProtectedRoute from "./Components/ProtectedRoute";
import AppLayout from "./Components/AppLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="casas" element={<Casas />} />
            <Route path="personal" element={<Personal />} />
            <Route path="calendario" element={<Calendario />} />
            <Route path="perfil" element={<Perfil />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
