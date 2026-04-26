import { useNavigate } from "react-router-dom";
import Button from "../Components/Atoms/Button";

const Personal = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <h1 className="font-bold text-3xl text-[#121212] ml-1">
        Gestión de Personal
      </h1>

      <Button
        text="Añadir nuevo usuario"
        onClick={() => navigate("/app/personal/nuevo")}
        bgColor="bg-[#24375e]"
        hoverColor="hover:bg-[#162d4a]"
        activeColor="active:bg-[#0f2035]"
        textColor="text-white"
      />
    </div>
  );
};

export default Personal;
