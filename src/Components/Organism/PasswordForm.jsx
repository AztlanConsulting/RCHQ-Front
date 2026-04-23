import { useMemo, useState } from "react";
import Forms from "./Forms";
import Alert from "../Atoms/Alerts";
import eye from "/showEye.svg";
import hideEye from "/hideEye.svg";

const PasswordForm = ({
    mode = "self-service",
    title,
    description,
    loading = false,
    errors = [],
    onSubmit,
    onCancel,
    submitText,
}) => {
    const isFirstLogin = mode === "first-login";

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const toggleCurrentPassword = () =>
        setShowCurrentPassword((value) => !value);
    const toggleNewPassword = () => setShowNewPassword((value) => !value);
    const toggleConfirmPassword = () =>
        setShowConfirmPassword((value) => !value);

    const softLabelClassName =
        "text-sm font-semibold text-slate-600 sm:text-base";

    const fields = useMemo(() => {
        const baseFields = [];

        if (!isFirstLogin) {
            baseFields.push({
                id: "currentPassword",
                type: showCurrentPassword ? "text" : "password",
                value: currentPassword,
                setValue: setCurrentPassword,
                placeholder: "Ingresa tu contraseña actual",
                iconRight: showCurrentPassword ? hideEye : eye,
                onIconRightClick: toggleCurrentPassword,
                iconRightAlt: showCurrentPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña",
                iconRightAriaLabel: showCurrentPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña",
                htmlFor: "currentPassword",
                text: "Contraseña actual",
                maxLength: 64,
                autoComplete: "current-password",
                labelClassName: softLabelClassName,
            });
        }

        baseFields.push(
            {
                id: "newPassword",
                type: showNewPassword ? "text" : "password",
                value: newPassword,
                setValue: setNewPassword,
                placeholder: "Ingresa tu nueva contraseña",
                iconRight: showNewPassword ? hideEye : eye,
                onIconRightClick: toggleNewPassword,
                iconRightAlt: showNewPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña",
                iconRightAriaLabel: showNewPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña",
                htmlFor: "newPassword",
                text: "Nueva contraseña",
                maxLength: 64,
                autoComplete: "new-password",
                labelClassName: softLabelClassName,
            },
            {
                id: "confirmPassword",
                type: showConfirmPassword ? "text" : "password",
                value: confirmPassword,
                setValue: setConfirmPassword,
                placeholder: "Confirma tu nueva contraseña",
                iconRight: showConfirmPassword ? hideEye : eye,
                onIconRightClick: toggleConfirmPassword,
                iconRightAlt: showConfirmPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña",
                iconRightAriaLabel: showConfirmPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña",
                htmlFor: "confirmPassword",
                text: "Confirmar nueva contraseña",
                maxLength: 64,
                autoComplete: "new-password",
                labelClassName: softLabelClassName,
            },
        );

        return baseFields;
    }, [
        isFirstLogin,
        currentPassword,
        newPassword,
        confirmPassword,
        showCurrentPassword,
        showNewPassword,
        showConfirmPassword,
    ]);

    const handleSubmit = () => {
        if (typeof onSubmit !== "function") return;

        if (isFirstLogin) {
            onSubmit({
                newPassword,
                confirmPassword,
            });
            return;
        }

        onSubmit({
            currentPassword,
            newPassword,
            confirmPassword,
        });
    };

    const actions = [
        ...(typeof onCancel === "function"
            ? [
                {
                    id: "cancel-password-change",
                    text: "Cancelar",
                    type: "button",
                    onClick: onCancel,
                    disabled: loading,
                    bgColor: "bg-slate-100",
                    textColor: "text-slate-700",
                    hoverColor: "hover:bg-slate-200",
                    activeColor: "active:bg-slate-300",
                },
            ]
            : []),
        {
            id: "submit-password-change",
            text: loading
                ? isFirstLogin
                    ? "Cambiando..."
                    : "Guardando..."
                : submitText ||
                (isFirstLogin ? "Cambiar contraseña" : "Guardar cambios"),
            type: "submit",
            disabled: loading,
            bgColor: "bg-[#1F3664]",
            textColor: "text-white",
            hoverColor: "hover:bg-[#1F3664]/90",
            activeColor: "active:bg-[#1F3664]/80",
        },
    ];

    const footer = (
        <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="mb-3 text-sm font-semibold text-slate-800">
                    Tu nueva contraseña debe contener:
                </p>

                <ul className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm text-slate-600 sm:grid-cols-2">
                    <li>- Un mínimo de 8 caracteres</li>
                    <li>- Al menos una letra minúscula</li>
                    <li>- Al menos un número</li>
                    <li>- Al menos una letra mayúscula</li>
                </ul>
            </div>

            {errors.length > 0 && (
                <Alert
                    type="error"
                    message={
                        <ul className="list-disc pl-5">
                            {errors.map((item, index) => (
                                <li key={`${item}-${index}`}>{item}</li>
                            ))}
                        </ul>
                    }
                />
            )}
        </div>
    );

    return (
        <div className="w-full">
            <Forms
                title={title}
                description={description}
                fields={fields}
                actions={actions}
                footer={footer}
                onSubmit={handleSubmit}
                titleClassName="text-left text-2xl font-bold text-slate-900"
                descriptionClassName="text-left text-sm text-slate-600"
            />
        </div>
    );
};

export default PasswordForm;