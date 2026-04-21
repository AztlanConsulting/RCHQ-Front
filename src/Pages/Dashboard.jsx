import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
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
    </div>
  );
};

export default Dashboard;
