import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TwoFactorCode from "../../Components/Organism/TwoFactorCode";
import Alert from "../../Components/Atoms/Alerts";
import { validateLogin2FAService, getPre2faToken } from "../../Services/AuthService";

const TwoFactorLogin = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = getPre2faToken();
        if (!token) {
            navigate("/login", { replace: true });
        }
    }, [navigate]);
    
    const handleSubmit = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await validateLogin2FAService(code);

            if (!response) {
                setError("No se pudo validar el código");
                return;
            }

            if (response.nextStep === "WAIT_2FA_BLOCK") {
                setError("La verificación 2FA está bloqueada temporalmente. Intenta más tarde.");
                return;
            }

            if (response.nextStep === "LOGIN_COMPLETE") {
                navigate("/app/dashboard");
                return;
            }

            setError("El servidor devolvió un flujo no reconocido");
        } catch (err) {
            console.error(err);
            setError(err.message || "Código 2FA inválido");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#1F3664] px-4">
            <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-950/40">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-semibold text-slate-900">
                        Verificación en dos pasos
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                        Ingresa el código generado por tu aplicación autenticadora para continuar.
                    </p>
                </div>

                {error && <Alert type="error" message={error} />}

                <TwoFactorCode
                    code={code}
                    setCode={setCode}
                    onSubmit={handleSubmit}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default TwoFactorLogin;