import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForms from "../Components/Organism/LoginForms";
import { loginService } from "../Services/AuthService";
import Alert from "../Components/Atoms/Alerts";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await loginService(email, password);
      if (!response) {
        setError("No se pudo iniciar sesión");
        return;
      }

      navigate("/app/dashboard");
    } catch (err) {
      console.error(err);
      setError("Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left */}
      <div className="w-1/2 bg-white flex items-center justify-center">
        <img src="/RCHQ-LOGO.svg" style={{ mixBlendMode: "darken" }} alt="logo" />
      </div>

      {/* Right */}
      <div className="w-1/2 bg-blue-900 flex items-center justify-center">
        <div className="w-full max-w-md space-y-4">
          {error && <Alert type="error" message={error} />}
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
    </div>
  );
};

export default LoginPage;