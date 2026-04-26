import ModalShell from "./ModalShell";
import PasswordForm from "./PasswordForm";

const ChangePasswordModal = ({
    isOpen,
    onClose,
    loading = false,
    errors = [],
    onSubmit,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showCurrentPassword,
    toggleCurrentPassword,
    showNewPassword,
    toggleNewPassword,
    showConfirmPassword,
    toggleConfirmPassword,
}) => {
    return (
        <ModalShell
            isOpen={isOpen}
            onClose={onClose}
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
                onSubmit={onSubmit}
                submitText="Cambiar contraseña"
                currentPassword={currentPassword}
                setCurrentPassword={setCurrentPassword}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                showCurrentPassword={showCurrentPassword}
                toggleCurrentPassword={toggleCurrentPassword}
                showNewPassword={showNewPassword}
                toggleNewPassword={toggleNewPassword}
                showConfirmPassword={showConfirmPassword}
                toggleConfirmPassword={toggleConfirmPassword}
            />
        </ModalShell>
    );
};

export default ChangePasswordModal;