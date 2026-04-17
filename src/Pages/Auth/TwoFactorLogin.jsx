import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TwoFactorCode from "../../Components/Organism/TwoFactorCode";
import Alert from "../../Components/Atoms/Alerts";
import { validateLogin2FAService, getPre2faToken, getToken } from "../../Services/AuthService";

const TwoFactorLogin = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isBlocked, setIsBlocked] = useState(false);

    useEffect(() => {
        const pre2faToken = getPre2faToken();
        const sessionToken = getToken(); // ← también importar getToken

        // Si ya tiene session token, ya completó el login
        if (sessionToken) {
            navigate("/app/dashboard", { replace: true });
            return;
        }

        // Si no tiene ni pre2fa, mandar al login
        if (!pre2faToken) {
            navigate("/iniciar-sesion", { replace: true });
        }
    }, [navigate]);
    
    const handleSubmit = async () => {
        if (isBlocked) return; 

        setLoading(true);
        setError("");

        try {
            const response = await validateLogin2FAService(code);

            if (response.nextStep === "LOGIN_COMPLETE") {
                localStorage.setItem("token", response.token);
                localStorage.setItem("user", JSON.stringify(response.data));
                navigate("/app/dashboard", { replace: true }); 
                localStorage.removeItem("PRE_2FA");            
                return;
            }

        } catch (err) {
            console.error(err);
            
            if (err.status === 423 || err.data?.nextStep === "WAIT_2FA_BLOCK") {
                setError("La verificación 2FA está bloqueada temporalmente. Intenta más tarde.");
                setIsBlocked(true); 
            } else {
                setError(err.message || "Código 2FA inválido");
            }
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
                    disabled={isBlocked}
                />
            </div>
        </div>
    );
};

export default TwoFactorLogin;