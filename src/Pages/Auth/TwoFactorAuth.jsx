import Button from "../../Components/Atoms/Button";
import Alert from "../../Components/Atoms/Alerts";
import TwoFactorCode from "../../Components/Organism/TwoFactorCode";
import { useTwoFactorAuth } from "../../hooks/Organism/useTwoFactorAuth";

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
    <div className="bg-white rounded-xl shadow-2xl p-8 w-[500px] max-w-full flex flex-col">
      {step === "qr" && (
        <>
          <div className="text-left w-full mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Autenticación en dos pasos
            </h2>
            <p className="mt-2 text-sm text-slate-600 font-medium">
              Usa una aplicación de autentificación (ej. Google auth) y escanea
              el código QR.
            </p>
          </div>

          {generationError && <Alert type="error" message={generationError} />}

          <div className="flex flex-col items-center justify-center w-full">
            {isGenerating ? (
              <div className="h-56 w-56 flex items-center justify-center text-sm text-slate-400 border border-slate-100 rounded-lg">
                Generando QR...
              </div>
            ) : qr ? (
              <img src={qr} alt="QR TwoFactorAuth" className="h-56 w-56 object-contain" />
            ) : null}

            <div className="mt-6">
              <Button
                text="Continuar"
                onClick={handleGoToCode}
                disabled={isGenerating || !qr}
                bgColor="bg-[#1a2f5e]"
                hoverColor="hover:opacity-85"
                activeColor="active:opacity-70"
                textColor="text-white"
                width="w-56"
                className="shadow-sm"
              />
            </div>
          </div>

          {manualCode && (
            <div className="w-full mt-6">
              <div className="flex items-center gap-3 w-full mb-2">
                <hr className="flex-1 border-slate-200" />
                <span className="text-xs font-semibold text-slate-400">o</span>
                <hr className="flex-1 border-slate-200" />
              </div>
              <div className="text-center flex flex-col items-center w-full px-4">
                <p className="text-sm font-medium text-slate-500 mb-2">
                  Ingresa el siguiente código
                </p>
                <div className=" border-2 border-slate-100 rounded-lg px-4 py-3 w-full max-w-sm bg-slate-50 text-slate-800 font-bold tracking-[0.1em] break-all">
                  {manualCode}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {step === "code" && (
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="text-center w-full">
            <h2 className="text-2xl font-bold text-slate-900">
              Verifica el código
            </h2>
            <p className="mt-2 text-sm text-slate-600">
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
            className="mt-2 py-2 px-4"
          />
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuth;
