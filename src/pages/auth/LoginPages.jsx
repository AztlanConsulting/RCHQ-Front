import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Forms from "../../Components/Organism/Forms";
import { loginService, getReadableErrors } from "../../Services/AuthService";
import Alert from "../../Components/Atoms/Alerts";
import eye from "/showEye.svg";
import hideEye from "/hideEye.svg";
import { loginSchema } from "../../Utils/Schema/Auth/auth.schemas";
import useAuth from "../../hooks/useAuth";

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [showPassword, setShowPassword] = useState(false);

    const EMAIL_MAX_LENGTH = 255;
    const PASSWORD_MAX_LENGTH = 255;

    const toggleShowPassword = () => {
        setShowPassword((value) => !value);
    };

    const handleEmailChange = (value) => {
        setEmail(value.slice(0, EMAIL_MAX_LENGTH));
    };

    const handlePasswordChange = (value) => {
        setPassword(value.slice(0, PASSWORD_MAX_LENGTH));
    };

    const handleSubmit = async () => {
        setErrors([]);

        const result = loginSchema.safeParse({ email, password });

        if (!result.success) {
            setErrors(result.error.issues.map((issue) => issue.message));
            return;
        }

        setLoading(true);

        try {
            const response = await loginService(
                result.data.email,
                result.data.password,
            );

            if (!response?.success) {
                setErrors(["No se pudo iniciar sesión"]);
                return;
            }

            if (response.isActive2FA) {
                navigate("/2FA");
                return;
            }

            const token = response?.data?.token;
            const user = response?.data?.user;

            if (!token) {
                setErrors(["No se recibió un token de sesión válido"]);
                return;
            }

            login({ token, user });
            navigate("/app/dashboard", { replace: true });
        } catch (err) {
            console.error(err);
            setErrors(getReadableErrors(err));
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        {
            id: "email",
            value: email,
            setValue: handleEmailChange,
            placeholder: "Ingresa tu correo",
            htmlFor: "email",
            text: "Correo electrónico",
            type: "email",
            autoComplete: "email",
            inputMode: "email",
            maxLength: EMAIL_MAX_LENGTH,
        },
        {
            id: "password",
            value: password,
            setValue: handlePasswordChange,
            placeholder: "Ingresa tu contraseña",
            type: showPassword ? "text" : "password",
            iconRight: showPassword ? eye : hideEye,
            onIconRightClick: toggleShowPassword,
            iconRightAlt: showPassword
                ? "Ocultar contraseña"
                : "Mostrar contraseña",
            iconRightAriaLabel: showPassword
                ? "Ocultar contraseña"
                : "Mostrar contraseña",
            htmlFor: "password",
            text: "Contraseña",
            autoComplete: "current-password",
            maxLength: PASSWORD_MAX_LENGTH,
        },
    ];

    const actions = [
        {
            text: loading ? "Cargando..." : "Ingresar",
            type: "submit",
            disabled: loading,
        },
    ];

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            <div className="flex min-h-[220px] items-center justify-center bg-[#F8F8F8] px-6 py-10 md:min-h-screen md:w-1/2 lg:w-3/5">
                <img
                    src="/RCHQ-LOGO.svg"
                    style={{ mixBlendMode: "darken" }}
                    className="h-auto w-full max-w-[180px] sm:max-w-[240px] md:max-w-[320px] lg:max-w-[420px]"
                    alt="logo"
                />
            </div>

            <div className="flex flex-1 items-center justify-center bg-[#1F3664] px-5 py-8 sm:px-8 md:w-1/2 lg:w-2/5">
                <div className="w-full max-w-sm sm:max-w-md">
                    {errors.length > 0 && (
                        <div className="mb-4">
                            <Alert
                                type="error"
                                message={
                                    <ul className="list-disc pl-5">
                                        {errors.map((item, index) => (
                                            <li key={`${item}-${index}`}>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                }
                            />
                        </div>
                    )}

                    <Forms
                        title="Bienvenido de Vuelta"
                        fields={fields}
                        actions={actions}
                        onSubmit={handleSubmit}
                    />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
