import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { useState } from "react";
import ChangePasswordModal from "../../components/organism/changePasswordModal";

const ChangePasswordModalHarness = ({
  isOpen = true,
  loading = false,
  errors = [],
  onSubmit = vi.fn(),
  onClose = vi.fn(),
}) => {
  const [modalErrors, setModalErrors] = useState(errors);
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
      errors={modalErrors}
      onErrorsClose={() => setModalErrors([])}
      onSubmit={onSubmit}
      currentPassword={currentPassword}
      setCurrentPassword={setCurrentPassword}
      newPassword={newPassword}
      setNewPassword={setNewPassword}
      confirmPassword={confirmPassword}
      setConfirmPassword={setConfirmPassword}
      showCurrentPassword={showCurrentPassword}
      toggleCurrentPassword={() => setShowCurrentPassword((value) => !value)}
      showNewPassword={showNewPassword}
      toggleNewPassword={() => setShowNewPassword((value) => !value)}
      showConfirmPassword={showConfirmPassword}
      toggleConfirmPassword={() => setShowConfirmPassword((value) => !value)}
    />
  );
};

const renderModal = (props = {}) =>
  render(<ChangePasswordModalHarness {...props} />);

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

afterEach(() => {
  vi.useRealTimers();
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

  it("oculta el snackbar de error después del tiempo configurado", () => {
    vi.useFakeTimers();

    renderModal({
      errors: ["Las contraseñas no coinciden"],
    });

    expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(50);
    });

    act(() => {
      vi.advanceTimersByTime(5300);
    });

    expect(
      screen.queryByText(/las contraseñas no coinciden/i),
    ).not.toBeInTheDocument();
  });

  it("llama onClose al presionar el botón de cerrar", () => {
    const onClose = vi.fn();

    renderModal({ onClose });

    fireEvent.click(screen.getByRole("button", { name: /cerrar/i }));

    expect(onClose).toHaveBeenCalled();
  });
});
