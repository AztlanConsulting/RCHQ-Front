import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./Pages/Landing"
import LoginPage from "./Pages/LoginPages";
// import LoginRoute from "./Routes/LoginRoutes";

function App() {
  // return <LoginRoute />;
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;