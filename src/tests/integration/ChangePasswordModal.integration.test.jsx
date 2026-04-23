import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChangePasswordModal from "../../../src/Components/Organism/ChangePasswordModal";

vi.mock("../../../src/Services/PasswordService", () => ({
    changePasswordService: vi.fn(),
}));

vi.mock("../../../src/utils/password/passwordErrorMapper", () => ({
    mapPasswordApiError: vi.fn(() => ["La contraseña actual es incorrecta"]),
}));

import { changePasswordService } from "../../../src/Services/PasswordService";

const renderModal = (props = {}) => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        onSuccess: vi.fn(),
    };

    return render(<ChangePasswordModal {...defaultProps} {...props} />);
};

const fillAndSubmit = async ({
    currentPassword = "",
    newPassword = "",
    confirmPassword = "",
} = {}) => {
    const inputs = screen.getAllByDisplayValue("");
    fireEvent.change(inputs[0], { target: { value: currentPassword } });
    fireEvent.change(inputs[1], { target: { value: newPassword } });
    fireEvent.change(inputs[2], { target: { value: confirmPassword } });

    fireEvent.click(screen.getByRole("button", { name: /cambiar contraseña/i }));
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("ChangePasswordModal — integración", () => {
    it("no llama al servicio si falla la validación", async () => {
        renderModal();

        await fillAndSubmit({
            currentPassword: "",
            newPassword: "123",
            confirmPassword: "123",
        });

        await waitFor(() => {
            expect(
                screen.getByText(/contraseña actual es requerida/i),
            ).toBeInTheDocument();
        });

        expect(changePasswordService).not.toHaveBeenCalled();
    });

    it("llama al servicio con los datos correctos", async () => {
        changePasswordService.mockResolvedValue({ success: true });
        const onSuccess = vi.fn();
        const onClose = vi.fn();

        renderModal({ onSuccess, onClose });

        await fillAndSubmit({
            currentPassword: "Actual123",
            newPassword: "NuevaPass123",
            confirmPassword: "NuevaPass123",
        });

        await waitFor(() => {
            expect(changePasswordService).toHaveBeenCalledWith(
                "Actual123",
                "NuevaPass123",
                "NuevaPass123",
            );
            expect(onSuccess).toHaveBeenCalled();
            expect(onClose).toHaveBeenCalled();
        });
    });

    it("muestra error cuando la contraseña actual es incorrecta", async () => {
        changePasswordService.mockRejectedValue(new Error("Invalid credentials"));

        renderModal();

        await fillAndSubmit({
            currentPassword: "Mal123",
            newPassword: "NuevaPass123",
            confirmPassword: "NuevaPass123",
        });

        await waitFor(() => {
            expect(
                screen.getByText(/contraseña actual es incorrecta/i),
            ).toBeInTheDocument();
        });
    });
});