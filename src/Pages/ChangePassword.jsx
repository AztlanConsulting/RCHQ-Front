import {useState} from "react";
import Forms from "../Components/Organism/Forms";
import {changePasswordService} from "../Services/AuthService";
import Alert from "../Components/Atoms/Alerts";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await changePasswordService(currentPassword, newPassword);
      // Aquí podrías redirigir al usuario o mostrar un mensaje de éxito
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      id: "currentPassword",
      label: "Contraseña actual",
      type: "password",
      value: currentPassword,
      setValue: setCurrentPassword,
      placeholder: "Ingresa tu contraseña actual",
    },
    {
      id: "newPassword",
      label: "Nueva contraseña",
      type: "password",
      value: newPassword,
      setValue: setNewPassword,
      placeholder: "Ingresa tu nueva contraseña",
    },
    {
      id: "confirmPassword",
      label: "Confirmar nueva contraseña",
      type: "password",
      value: confirmPassword,
      setValue: setConfirmPassword,
      placeholder: "Confirma tu nueva contraseña",
    },
  ];

  return (
    <div className="max-w-md mx-auto mt-10">
      {error && <Alert type="error" message={error} />}

      <Forms
        title="Cambiar Contraseña"
        description="Por favor, ingresa tu contraseña actual y la nueva contraseña."
        fields={fields}
        actions={[
          {
            text: loading ? "Cambiando..." : "Cambiar Contraseña",
            type: "submit",
            disabled: loading,
          },
        ]}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default ChangePassword;