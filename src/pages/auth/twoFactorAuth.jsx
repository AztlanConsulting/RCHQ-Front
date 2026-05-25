import Button from "../../components/atoms/button";
import Alert from "../../components/atoms/alerts";
import TwoFactorCode from "../../components/organism/twoFactorCode";
import { useTwoFactorAuth } from "../../hooks/organism/useTwoFactorAuth";

const TwoFactorAuth = ({ onClose }) => {
  const {
    step,
    handleGoToCode,
    handleGoToQr,
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

  return (
    <div className="flex w-full max-w-[22rem] flex-col rounded-xl bg-white p-5 shadow-2xl sm:max-w-[31.25rem] sm:p-8">
      {step === "qr" && (
        <>
          <div className="mb-5 w-full text-left sm:mb-6">
            <h2 className="text-[1.75rem] font-bold leading-tight text-slate-900 sm:text-2xl">
              Autenticación en dos pasos
            </h2>
            <p className="mt-2 text-sm font-medium leading-5 text-slate-600">
              Usa una aplicación de autentificación (ej. Google auth) y escanea
              el código QR.
            </p>
          </div>

          {generationError && <Alert type="error" message={generationError} />}

          <div className="flex w-full flex-col items-center justify-center">
            {isGenerating ? (
              <div className="flex h-44 w-44 items-center justify-center rounded-lg border border-slate-100 text-sm text-slate-400 sm:h-56 sm:w-56">
                Generando QR...
              </div>
            ) : qr ? (
              <img
                src={qr}
                alt="QR TwoFactorAuth"
                className="h-44 w-44 object-contain sm:h-56 sm:w-56"
              />
            ) : null}

            <div className="mt-5 sm:mt-6">
              <Button
                text="Continuar"
                onClick={handleGoToCode}
                disabled={isGenerating || !qr}
                bgColor="bg-[#1a2f5e]"
                hoverColor="hover:opacity-85"
                activeColor="active:opacity-70"
                textColor="text-white"
                width="w-full min-w-[14rem] sm:w-56"
                textSize="text-lg sm:text-xl"
                className="px-4 shadow-sm"
              />
            </div>
          </div>

          {manualCode && (
            <div className="mt-5 w-full sm:mt-6">
              <div className="mb-2 flex w-full items-center gap-3">
                <hr className="flex-1 border-slate-200" />
                <span className="text-xs font-semibold text-slate-400">o</span>
                <hr className="flex-1 border-slate-200" />
              </div>
              <div className="flex w-full flex-col items-center px-1 text-center sm:px-4">
                <p className="text-sm font-medium text-slate-500 mb-2">
                  Ingresa el siguiente código
                </p>
                <div className="w-full max-w-sm break-all rounded-lg border-2 border-slate-100 bg-slate-50 px-4 py-3 text-slate-800 font-bold tracking-[0.08em]">
                  {manualCode}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {step === "code" && (
        <div className="flex w-full flex-col items-center gap-5 sm:gap-6">
          <div className="w-full text-center">
            <h2 className="text-[1.75rem] font-bold leading-tight text-slate-900 sm:text-2xl">
              Verifica el código
            </h2>
            <p className="mt-2 text-sm leading-5 text-slate-600">
              Ingresa los 6 dígitos generados por la aplicación de
              Autenticación:
            </p>
          </div>

          {verificationError && (
            <Alert type="error" message={verificationError} />
          )}

          <TwoFactorCode
            code={code}
            setCode={setCode}
            onSubmit={submitCode}
            loading={isVerifying}
          />

          <Button
            text="Volver al QR"
            onClick={handleGoToQr}
            bgColor="bg-transparent"
            hoverColor="hover:bg-slate-50"
            activeColor="active:bg-slate-100"
            textColor="text-slate-500 hover:text-slate-700"
            width="w-auto"
            height="h-auto"
            textSize="text-sm"
            fontWeight="font-medium"
            className="mt-1 px-4 py-2 sm:mt-2"
          />
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuth;
