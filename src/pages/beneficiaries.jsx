import { useNavigate } from "react-router-dom";
import BigButton from "../components/atoms/bigButton";

const Personal = () => {
    const navigate = useNavigate();

    return (
        <div className="p-4 md:p-8 md:flex md:flex-col md:h-full">
            <div className="flex items-center justify-between mb-4 md:mb-8">
                <h1 className="font-bold text-3xl md:text-4xl text-[#121212]">Beneficiarios</h1>
                <BigButton
                    text="Añadir"
                    onClick={() => navigate("/app/beneficiarios/nuevo")}
                    className="min-w-0"
                />
            </div>
        </div>
    );
};

export default Personal;
