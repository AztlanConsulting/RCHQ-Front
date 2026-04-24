import { useState } from "react";
import ModalShell from "./ModalShell";
import PasswordForm from "./PasswordForm";
import { changePasswordService } from "../../Services/PasswordService";
import {
    selfServiceChangePasswordSchema,
    getFirstSchemaError,
} from "../../utils/Schema/Auth/password.schemas";
import { mapPasswordApiError } from "../../utils/password/passwordErrorMapper";

const ChangePasswordModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);

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

        const validation = selfServiceChangePasswordSchema.safeParse({
            currentPassword,
            newPassword,
            confirmPassword,
        });

        if (!validation.success) {
            setErrors([
                getFirstSchemaError(validation) || "Revisa los campos del formulario",
            ]);
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
            setErrors(mapPasswordApiError(err, "self-service"));
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
                submitText="Cambiar contraseña"
            />
        </ModalShell>
    );
};

export default ChangePasswordModal;