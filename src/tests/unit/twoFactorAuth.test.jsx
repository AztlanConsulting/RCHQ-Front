import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TwoFactorAuth from "../../pages/auth/twoFactorAuth";
import { useTwoFactorAuth } from "../../hooks/organism/useTwoFactorAuth";

vi.mock("../../hooks/organism/useTwoFactorAuth", () => ({
  useTwoFactorAuth: vi.fn(() => ({
    openStep: "scan-qr",
    toggleStep: vi.fn(),
    qr: "data:image/png;base64,qr",
    manualCode: "ABC123SECRET",
    isGenerating: false,
    generationError: "",
    copySuccessMessage: "",
    copyManualCode: vi.fn(),
    code: "",
    setCode: vi.fn(),
    isVerifying: false,
    verificationError: "",
    submitCode: vi.fn(),
  })),
}));

vi.mock("../../components/organism/twoFactorCode", () => ({
  default: () => <div>Código mock</div>,
}));

describe("TwoFactorAuth", () => {
  it("renderiza la guia en acordeon con el paso combinado de QR y clave manual", () => {
    render(<TwoFactorAuth onClose={vi.fn()} />);

    expect(
      screen.getByText("Autenticación en dos pasos"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /Paso 3\. Escanea el código QR o usa la clave manual/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Si prefieres, en la app también puedes elegir/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("ABC123SECRET")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copiar" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Código mock")).toBeInTheDocument();
  });

  it("delega el toggle del acordeon al hook", () => {
    const toggleStep = vi.fn();
    useTwoFactorAuth.mockReturnValue({
      openStep: "install",
      toggleStep,
      qr: "",
      manualCode: "",
      isGenerating: false,
      generationError: "",
      copySuccessMessage: "",
      copyManualCode: vi.fn(),
      code: "",
      setCode: vi.fn(),
      isVerifying: false,
      verificationError: "",
      submitCode: vi.fn(),
    });

    render(<TwoFactorAuth onClose={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Paso 2\. Abre Google Authenticator/i,
      }),
    );

    expect(toggleStep).toHaveBeenCalledWith("open-app");
  });
});
