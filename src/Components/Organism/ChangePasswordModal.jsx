import { useState } from "react";
import ModalShell from "./ModalShell";
import PasswordForm from "./PasswordForm";
import { changePasswordService } from "../../Services/PasswordService";
import { getReadableErrors } from "../../utils/apiErrors";
import { z } from "zod";

const ChangePasswordModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);

    const changePasswordModalSchema = z
        .object({
            currentPassword: z.string(),
            newPassword: z.string(),
            confirmPassword: z.string(),
        })
        .superRefine((data, ctx) => {
            if (!data.currentPassword.trim()) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["currentPassword"],
                    message: "La contraseña actual es requerida",
                });
                return;
            }

            if (!data.newPassword) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["newPassword"],
                    message: "La nueva contraseña es requerida",
                });
                return;
            }

            if (data.newPassword.length < 8) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["newPassword"],
                    message: "La nueva contraseña no cumple con los requisitos indicados.",
                });
                return;
            }

            if (!/[a-z]/.test(data.newPassword)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["newPassword"],
                    message: "La nueva contraseña no cumple con los requisitos indicados.",
                });
                return;
            }

            if (!/[A-Z]/.test(data.newPassword)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["newPassword"],
                    message: "La nueva contraseña no cumple con los requisitos indicados.",
                });
                return;
            }

            if (!/[0-9]/.test(data.newPassword)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["newPassword"],
                    message: "La nueva contraseña no cumple con los requisitos indicados.",
                });
                return;
            }

            if (!data.confirmPassword) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["confirmPassword"],
                    message: "La confirmación de contraseña es requerida",
                });
                return;
            }

            if (data.newPassword !== data.confirmPassword) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["confirmPassword"],
                    message: "Las contraseñas no coinciden",
                });
            }
        });

    const normalizePasswordModalErrors = (err) => {
        const rawErrors = getReadableErrors(err);

        for (const message of rawErrors) {
            const lower = message.toLowerCase();

            if (
                lower.includes("invalid credentials") ||
                lower.includes("credenciales inválidas")
            ) {
                return ["La contraseña actual es incorrecta"];
            }

            if (
                lower.includes("unauthorized") ||
                lower.includes("not authenticated") ||
                lower.includes("no se encontró token")
            ) {
                return ["Tu sesión ya no es válida. Vuelve a iniciar sesión."];
            }

            if (
                lower.includes("access not allowed") ||
                lower.includes("forbidden")
            ) {
                return ["No tienes permiso para realizar esta acción."];
            }

            if (
                lower.includes("internal server error") ||
                lower.includes("error al cambiar la contraseña")
            ) {
                return ["Ocurrió un error al cambiar la contraseña. Intenta de nuevo."];
            }
        }

        return [rawErrors[0] || "Ocurrió un error inesperado"];
    };

    const handleClose = () => {
        if (loading) return;
        setErrors([]);
        if (typeof onClose === "function") {
            onClose();
        }
    };

    const handleSubmit = async ({
        currentPassword,
        newPassword,
        confirmPassword,
    }) => {
        setLoading(true);
        setErrors([]);

        const validation = changePasswordModalSchema.safeParse({
            currentPassword,
            newPassword,
            confirmPassword,
        });

        if (!validation.success) {
            const firstError = validation.error.issues[0]?.message;
            setErrors(firstError ? [firstError] : ["Revisa los campos del formulario"]);
            setLoading(false);
            return;
        }

        try {
            const response = await changePasswordService(
                currentPassword,
                newPassword,
                confirmPassword,
            );

            if (!response?.success) {
                setErrors(["No se pudo cambiar la contraseña"]);
                return;
            }

            if (typeof onSuccess === "function") {
                onSuccess(response);
            }

            handleClose();
        } catch (err) {
            console.error(err);
            setErrors(normalizePasswordModalErrors(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalShell
            isOpen={isOpen}
            onClose={handleClose}
            maxWidth="max-w-xl"
            showCloseButton={true}
            closeOnBackdrop={!loading}
        >
            <PasswordForm
                mode="self-service"
                title="Cambiar contraseña"
                description="Llena el formulario de abajo para cambiar tu contraseña"
                loading={loading}
                errors={errors}
                onSubmit={handleSubmit}
                submitText="Guardar cambios"
            />
        </ModalShell>
    );
};

export default ChangePasswordModal;