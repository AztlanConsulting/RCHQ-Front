import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import ChangePasswordModal from "../../../src/Components/Organism/ChangePasswordModal";

const ChangePasswordModalHarness = ({
    isOpen = true,
    loading = false,
    errors = [],
    onSubmit = vi.fn(),
    onClose = vi.fn(),
}) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <ChangePasswordModal
            isOpen={isOpen}
            onClose={onClose}
            loading={loading}
            errors={errors}
            onSubmit={onSubmit}
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showCurrentPassword={showCurrentPassword}
            toggleCurrentPassword={() =>
                setShowCurrentPassword((value) => !value)
            }
            showNewPassword={showNewPassword}
            toggleNewPassword={() => setShowNewPassword((value) => !value)}
            showConfirmPassword={showConfirmPassword}
            toggleConfirmPassword={() =>
                setShowConfirmPassword((value) => !value)
            }
        />
    );
};

const renderModal = (props = {}) => render(<ChangePasswordModalHarness {...props} />);

const fillAndSubmit = async ({
    currentPassword = "",
    newPassword = "",
    confirmPassword = "",
} = {}) => {
    fireEvent.change(screen.getByLabelText(/contraseña actual/i), {
        target: { value: currentPassword },
    });
    fireEvent.change(screen.getByLabelText(/^nueva contraseña$/i), {
        target: { value: newPassword },
    });
    fireEvent.change(screen.getByLabelText(/confirmar nueva contraseña/i), {
        target: { value: confirmPassword },
    });

    fireEvent.click(screen.getByRole("button", { name: /cambiar contraseña/i }));
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("ChangePasswordModal — integración", () => {
    it("llama onSubmit con los datos capturados", async () => {
        const onSubmit = vi.fn();

        renderModal({ onSubmit });

        await fillAndSubmit({
            currentPassword: "Actual123",
            newPassword: "NuevaPass123",
            confirmPassword: "NuevaPass123",
        });

        expect(onSubmit).toHaveBeenCalledWith({
            currentPassword: "Actual123",
            newPassword: "NuevaPass123",
            confirmPassword: "NuevaPass123",
        });
    });

    it("muestra errores recibidos por props", () => {
        renderModal({
            errors: ["La contraseña actual es incorrecta"],
        });

        expect(
            screen.getByText(/la contraseña actual es incorrecta/i),
        ).toBeInTheDocument();
    });

    it("llama onClose al presionar el botón de cerrar", () => {
        const onClose = vi.fn();

        renderModal({ onClose });

        fireEvent.click(screen.getByRole("button", { name: /cerrar/i }));

        expect(onClose).toHaveBeenCalled();
    });
});