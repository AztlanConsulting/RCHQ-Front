import { useState } from "react";
import Alert from "../../components/atoms/alerts";
import TwoFactorCode from "../../components/organism/twoFactorCode";
import { useTwoFactorAuth } from "../../hooks/organism/useTwoFactorAuth";

const AccordionStep = ({
  stepId,
  title,
  isOpen,
  onToggle,
  children,
}) => (
  <div className="overflow-hidden border-b border-slate-200 last:border-b-0">
    <h3>
      <button
        type="button"
        onClick={() => onToggle(stepId)}
        className={`flex w-full items-center justify-between px-5 py-4 text-left transition-colors ${
          isOpen ? "bg-slate-50 text-slate-900" : "bg-white text-slate-700"
        }`}
        aria-expanded={isOpen}
        aria-controls={`two-factor-step-${stepId}`}
      >
        <span className="pr-4 text-base font-semibold sm:text-lg">{title}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </h3>

    <div
      id={`two-factor-step-${stepId}`}
      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <div className="overflow-hidden">
        <div className="bg-white px-5 pb-5 text-sm leading-6 text-slate-600">
          {children}
        </div>
      </div>
    </div>
  </div>
);

const TwoFactorAuth = ({ onClose }) => {
  const {
    qr,
    manualCode,
    isGenerating,
    generationError,
    code,
    setCode,
    isVerifying,
    verificationError,
    submitCode,
  } = useTwoFactorAuth({ onClose });
  const [openStep, setOpenStep] = useState("install");

  const toggleStep = (stepId) => {
    setOpenStep((currentStep) => (currentStep === stepId ? "" : stepId));
  };

  return (
    <div className="flex w-full max-w-[24rem] flex-col rounded-xl bg-white p-5 shadow-2xl sm:max-w-[40rem] sm:p-8">
      <div className="mb-5 w-full text-left sm:mb-6">
        <h2 className="text-[1.75rem] font-bold leading-tight text-slate-900 sm:text-2xl">
          Autenticación en dos pasos
        </h2>
        <p className="mt-2 text-sm font-medium leading-5 text-slate-600">
          Guía paso a paso para configurar Google Authenticator y activar la 
          verificación de dos pasos.
        </p>
      </div>

      {generationError && (
        <div className="mb-4">
          <Alert type="error" message={generationError} />
        </div>
      )}

      {verificationError && (
        <div className="mb-4">
          <Alert type="error" message={verificationError} />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <AccordionStep
          stepId="install"
          title="Paso 1. Instala Google Authenticator"
          isOpen={openStep === "install"}
          onToggle={toggleStep}
        >
          <p>
            Entra a la App Store o Google Play. Descarga <strong>Google Authenticator</strong>; 
            si ya tienes otra app compatible con códigos TOTP, también se puedes usar.
          </p>
        </AccordionStep>

        <AccordionStep
          stepId="open-app"
          title="Paso 2. Abre google Authenticator"
          isOpen={openStep === "open-app"}
          onToggle={toggleStep}
        >
          <p>
            Abre la aplicación y busca la opción para agregar una cuenta nueva.
            Normalmente aparece con un botón <strong>+</strong> o con la opción
            <strong> Agregar cuenta</strong>.
          </p>
        </AccordionStep>

        <AccordionStep
          stepId="scan-qr"
          title="Paso 3. Presiona la cámara y escanea el código QR"
          isOpen={openStep === "scan-qr"}
          onToggle={toggleStep}
        >
          <p className="mb-4">
            Elige la opción <strong>Escanear un código QR</strong> y apunta la
            cámara a este código.
          </p>

          <div className="flex w-full justify-center">
            {isGenerating ? (
              <div className="flex h-44 w-44 items-center justify-center rounded-lg border border-slate-100 text-sm text-slate-400 sm:h-56 sm:w-56">
                Generando QR...
              </div>
            ) : qr ? (
              <img
                src={qr}
                alt="QR de autenticación en dos pasos"
                className="h-44 w-44 rounded-lg object-contain sm:h-56 sm:w-56"
              />
            ) : (
              <div className="flex h-44 w-44 items-center justify-center rounded-lg border border-dashed border-slate-200 text-center text-sm text-slate-400 sm:h-56 sm:w-56">
                No se pudo cargar el código QR.
              </div>
            )}
          </div>
            <p> ------ o ---------</p>
            <p className="mb-4">
            En la app también puedes elegir <strong>Ingresar clave manual</strong>
            y copiar esta clave secreta:
          </p>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-bold tracking-[0.08em] text-slate-800">
            {manualCode || "Generando clave..."}
          </div>
        </AccordionStep>

        <AccordionStep
          stepId="verify-code"
          title="Paso 5. Escribe el código de 6 dígitos y verifica"
          isOpen={openStep === "verify-code"}
          onToggle={toggleStep}
        >
          <p className="mb-4">
            Cuando la app genere el código temporal, escríbelo aquí y
            presiona <strong>Verificar</strong>.
          </p>

          <TwoFactorCode
            code={code}
            setCode={setCode}
            onSubmit={submitCode}
            loading={isVerifying}
            disabled={isGenerating || !qr}
          />
        </AccordionStep>
      </div>
    </div>
  );
};

export default TwoFactorAuth;
