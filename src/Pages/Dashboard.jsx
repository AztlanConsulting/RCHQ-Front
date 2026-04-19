import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Components/Atoms/Button";

const Dashboard = () => {
    const navigate = useNavigate();

  const handleActivate = () => {
    navigate("/setup-2fa");
};
  return (
    <div>
      <h2>Red de Casas Hogar Queretaro</h2>

      <div className="flex grid">
        <div className="w-[80px] h-[80px] bg-gray-400">
          <img src="/favicon.png" />
        </div>
        <div className="w-[80px] h-[80px] bg-gray-400">
          <img src="/favicon.png" />
        </div>
        <div className="w-[80px] h-[80px] bg-gray-400">
          <img src="/favicon.png" />
        </div>
        <div className="w-[80px] h-[80px] bg-gray-400">
          <img src="/favicon.png" />
        </div>
      </div>
      <Button
      text="Activar 2FA"
      onClick={handleActivate}
    />

    </div>
  );
};

export default Dashboard;
