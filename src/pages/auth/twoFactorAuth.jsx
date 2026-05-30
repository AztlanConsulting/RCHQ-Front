import Alert from "../../components/atoms/alerts";
import SmallButton from "../../components/atoms/smallButton";
import ModalCloseButton from "../../components/atoms/modalCloseButton";
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
        className={`flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors sm:px-5 sm:py-4 ${
          isOpen ? "bg-slate-50 text-slate-900" : "bg-white text-slate-700"
        }`}
        aria-expanded={isOpen}
        aria-controls={`two-factor-step-${stepId}`}
      >
        <span className="min-w-0 text-[0.97rem] font-semibold leading-6 sm:pr-4 sm:text-lg">
          {title}
        </span>
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
        <div className="bg-white px-4 pb-4 text-sm leading-6 text-slate-600 sm:px-5 sm:pb-5">
          {children}
        </div>
      </div>
    </div>
  </div>
);

const TwoFactorAuth = ({ onClose, onDismiss }) => {
  const {
    openStep,
    toggleStep,
    qr,
    manualCode,
    isGenerating,
    generationError,
    copySuccessMessage,
    copyManualCode,
    code,
    setCode,
    isVerifying,
    verificationError,
    submitCode,
  } = useTwoFactorAuth({ onClose });

  return (
    <div className="relative flex w-full max-w-[min(100%,24rem)] max-h-[min(88vh,46rem)] flex-col rounded-xl bg-white p-4 shadow-2xl sm:max-w-[40rem] sm:p-8">
      <ModalCloseButton
        onClick={onDismiss}
        className="absolute right-3 top-3 z-10 text-[2.2rem] text-slate-400 hover:text-slate-700 sm:right-5 sm:top-5"
        ariaLabel="Cerrar"
      />

      <div className="mb-4 w-full text-left sm:mb-6">
        <h2 className="text-[1.95rem] font-bold leading-tight text-slate-900 sm:text-2xl">
          Autenticación en dos pasos
        </h2>
        <p className="mt-2 max-w-2xl text-sm font-medium leading-5 text-slate-600">
          Guía paso a paso para configurar Google Authenticator y activar la 
          verificación de dos pasos.
        </p>
      </div>

      {generationError && (
        <div className="mb-4">
          <Alert type="error" message={generationError} />
        </div>
      )}

      {copySuccessMessage && (
        <div className="mb-4">
          <Alert type="success" message={copySuccessMessage} />
        </div>
      )}

      {verificationError && (
        <div className="mb-4">
          <Alert type="error" message={verificationError} />
        </div>
      )}

      <div className="min-h-0 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
        <AccordionStep
          stepId="install"
          title="Paso 1. Instala Google Authenticator"
          isOpen={openStep === "install"}
          onToggle={toggleStep}
        >
          <p>
            Entra a la App Store o Play Store. Busca y descarga <strong>Google Authenticator</strong>; 
            si ya tienes otra app compatible con codigos TOTP, tambien la puedes usar.
          </p>
        </AccordionStep>

        <AccordionStep
          stepId="open-app"
          title="Paso 2. Abre Google Authenticator"
          isOpen={openStep === "open-app"}
          onToggle={toggleStep}
        >
          <p>
            Abre la aplicación, presione comenzar y seleccione la cuenta de correo
            con la que se quiera iniciar. Busca la opción para agregar un código.
            Normalmente aparece con un botón <strong>+</strong> o con la opción
            <strong> Agregar código</strong>.
          </p>
        </AccordionStep>

        <AccordionStep
          stepId="scan-qr"
          title="Paso 3. Escanea el código QR o usa la clave manual"
          isOpen={openStep === "scan-qr"}
          onToggle={toggleStep}
        >
          <p className="mb-4">
            Elige la opción <strong>Escanear un código QR</strong> y apunta la
            cámara a este código.
          </p>

          <div className="flex w-full justify-center">
            {isGenerating ? (
              <div className="flex h-36 w-36 items-center justify-center rounded-lg border border-slate-100 px-3 text-center text-sm text-slate-400 sm:h-56 sm:w-56">
                Generando QR...
              </div>
            ) : qr ? (
              <img
                src={qr}
                alt="QR de autenticación en dos pasos"
                className="h-36 w-36 rounded-lg object-contain sm:h-56 sm:w-56"
              />
            ) : (
              <div className="flex h-36 w-36 items-center justify-center rounded-lg border border-dashed border-slate-200 px-3 text-center text-sm text-slate-400 sm:h-56 sm:w-56">
                No se pudo cargar el código QR.
              </div>
            )}
          </div>

          <div className="my-5 flex w-full items-center gap-3">
            <hr className="flex-1 border-slate-200" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              o
            </span>
            <hr className="flex-1 border-slate-200" />
          </div>

          <p className="mb-4">
            Si prefieres, en la app también puedes elegir{" "}
            <strong>Ingresar clave de config.</strong> y copiar esta clave secreta
            en la parte de "Tu clave":
          </p>

          <div className="space-y-3">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center text-[0.95rem] font-bold tracking-[0.06em] text-slate-800 break-all sm:px-4">
              {manualCode || "Generando clave..."}
            </div>

            <div className="flex justify-center">
              <SmallButton
                text="Copiar clave"
                onClick={copyManualCode}
                disabled={!manualCode}
                className="min-w-[10rem]"
              />
            </div>
          </div>
        </AccordionStep>

        <AccordionStep
          stepId="verify-code"
          title="Paso 4. Escribe el código de 6 dígitos y verifica"
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
