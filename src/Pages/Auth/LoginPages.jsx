import Forms from "../../Components/Organism/Forms";
import Alert from "../../Components/Atoms/Alerts";
import eye from "/showEye.svg";
import hideEye from "/hideEye.svg";
import { useLogin } from "../../hooks/Organism/useLogin";

const LoginPage = () => {
  const { email, password, showPassword, errors, loading, handleSubmit } =
    useLogin();

  const fields = [
    {
      id: "email",
      value: email.value,
      setValue: email.handleValue,
      placeholder: "Ingresa tu correo",
      type: "email",
    },
    {
      id: "password",
      value: password.value,
      setValue: password.handleValue,
      placeholder: "Ingresa la contraseña",
      type: showPassword.value ? "text" : "password",
      iconRight: showPassword.value ? eye : hideEye,
      onIconRightClick: showPassword.toggle,
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
