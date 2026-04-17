import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OptionCard from "../Components/Molecules/OptionCard";
import Button from "../Components/Atoms/Button"; 
import TwoFactorAuth from "./Auth/TwoFactorAuth";

const MoreOptions = () => {
  const navigate = useNavigate();
  const [show2FAModal, setShow2FAModal] = useState(false);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Otras Opciones</h1>

      <div className="bg-transparent rounded-2xl border border-slate-200 p-8 min-h-96">
        <Button
          text="Regresar a mi perfil"
          icon={<span className="text-lg leading-none mr-1">⮌</span>} 
          onClick={() => navigate("/app/perfil")}
          bgColor="bg-[#1e2b4d]" // Azul oscuro del diseño
          hoverColor="hover:bg-[#15203b]"
          activeColor="active:bg-[#0f172a]"
          textColor="text-white"
          width="w-auto"
          height="h-auto"
          textSize="text-sm"
          fontWeight="font-medium"
          className="px-5 py-2.5 mb-10 shadow-sm"
        />

        <div className="flex gap-6 justify-center flex-wrap pt-4">
          <OptionCard
            icon={<img src="/certificate.svg" alt="Certificaciones" className="w-9 h-9" />} 
            label="Certificaciones"
            onClick={() => navigate("/app/certificaciones")}
          />
          <OptionCard
            icon={<img src="/document.svg" alt="Documentos" className="w-9 h-9" />}
            label="Documentos"
            onClick={() => navigate("/app/documentos")}
          />
          <OptionCard
            icon={<img src="/key.svg" alt="Activar 2FA" className="w-9 h-9" />}
            label="Activar 2FA"
            onClick={() => setShow2FAModal(true)}
          />
        </div>
      </div>

      {/* Modal 2FA Backdrop */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative">
            {/* Botón de cerrar opcional superpuesto */}
            <button
              onClick={() => setShow2FAModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 text-xl font-bold z-10"
            >
              ✕
            </button>
            <TwoFactorAuth onClose={() => setShow2FAModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MoreOptions;