import TwoFactorCode from "../../Components/Organism/TwoFactorCode";
import Alert from "../../Components/Atoms/Alerts";
import { useTwoFactorLogin } from "../../hooks/Organism/useTwoFactorLogin";

const TwoFactorLogin = () => {
  const { code, setCode, error, loading, isBlocked, handleSubmit } =
    useTwoFactorLogin();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1F3664] px-4">
      <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-950/40">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">
            Verificación en dos pasos
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Ingresa el código generado por tu aplicación autenticadora para
            continuar.
          </p>
        </div>

        {error && <Alert type="error" message={error} />}

        <TwoFactorCode
          code={code}
          setCode={setCode}
          onSubmit={handleSubmit}
          loading={loading}
          disabled={isBlocked || code.length !== 6}
        />
      </div>
    </div>
  );
};

export default TwoFactorLogin;
