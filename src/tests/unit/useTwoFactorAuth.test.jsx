import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTwoFactorAuth } from "../../hooks/organism/useTwoFactorAuth";
import {
  activateTwoFactorAuthService,
  verifyTwoFactorAuthService,
} from "../../services/authService";

vi.mock("../../services/authService", () => ({
  activateTwoFactorAuthService: vi.fn(),
  verifyTwoFactorAuthService: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe("useTwoFactorAuth", () => {
  const flushAsyncState = async () => {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
    activateTwoFactorAuthService.mockResolvedValue({
      data: {
        qrImage: "data:image/png;base64,qr",
        otpauthUrl: "otpauth://totp/app?secret=ABC123",
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("inicializa el acordeon en install y permite alternar el paso abierto", async () => {
    const { result } = renderHook(() => useTwoFactorAuth({ onClose: vi.fn() }));

    await flushAsyncState();

    expect(activateTwoFactorAuthService).toHaveBeenCalledTimes(1);

    expect(result.current.openStep).toBe("install");

    act(() => {
      result.current.toggleStep("scan-qr");
    });

    expect(result.current.openStep).toBe("scan-qr");

    act(() => {
      result.current.toggleStep("scan-qr");
    });

    expect(result.current.openStep).toBe("");
  });

  it("limpia generationError despues de 3 segundos", async () => {
    activateTwoFactorAuthService.mockRejectedValueOnce(
      new Error("Error al generar el código QR"),
    );

    const { result } = renderHook(() => useTwoFactorAuth({ onClose: vi.fn() }));

    await flushAsyncState();

    expect(result.current.generationError).toBe("Error al generar el código QR");

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.generationError).toBe("");
  });

  it("limpia verificationError despues de 3 segundos", async () => {
    const { result } = renderHook(() => useTwoFactorAuth({ onClose: vi.fn() }));

    await flushAsyncState();

    expect(result.current.qr).toBe("data:image/png;base64,qr");

    await act(async () => {
      result.current.submitCode();
    });

    expect(result.current.verificationError).toBe("El código debe tener 6 dígitos.");

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.verificationError).toBe("");
  });

  it("verifica el codigo y dispara onClose cuando el flujo es exitoso", async () => {
    const onClose = vi.fn();
    verifyTwoFactorAuthService.mockResolvedValue({
      nextStep: "TWO_FACTOR_AUTH_SETUP_COMPLETE",
    });

    const { result } = renderHook(() => useTwoFactorAuth({ onClose }));

    await flushAsyncState();

    expect(result.current.qr).toBe("data:image/png;base64,qr");

    act(() => {
      result.current.setCode("123456");
    });

    await act(async () => {
      await result.current.submitCode();
    });

    expect(verifyTwoFactorAuthService).toHaveBeenCalledWith("123456");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("copia la clave manual y muestra feedback temporal", async () => {
    const { result } = renderHook(() => useTwoFactorAuth({ onClose: vi.fn() }));

    await flushAsyncState();

    await act(async () => {
      await result.current.copyManualCode();
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("ABC123");
    expect(result.current.copySuccessMessage).toBe("Clave copiada correctamente.");

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.copySuccessMessage).toBe("");
  });
});
