import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForms from "../Components/Organism/LoginForms";
import { loginService } from "../Services/AuthService";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    // simula API
    const response = await loginService(email, password);
    if (!response) {
      setLoading(false);
      return;
    }
      navigate("/app/dashboard");

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex h-screen">
      {/* Left */}
      <div className="w-1/2 bg-white flex items-center justify-center">
        <img src="/RCHQ-LOGO.svg" alt="logo" />
      </div>

      {/* Right */}
      <div className="w-1/2 bg-blue-900 flex items-center justify-center">
        <LoginForms
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default LoginPage;