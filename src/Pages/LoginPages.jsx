import { useState } from "react";
import LoginForms from "../organisms/LoginForms";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    // simula API
    console.log({ email, password });

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex h-screen">
      {/* Left */}
      <div className="w-1/2 bg-white flex items-center justify-center">
        <img src="/logo.png" alt="logo" />
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