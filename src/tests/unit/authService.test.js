import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  loginService,
  logoutService,
  getToken,
  getPre2faToken,
  getReadableErrors,
  activateTwoFactorAuthService,
  verify2FAService,
  validateLogin2FAService,
  getStatus2FA,
  desactivate2FAService,
} from "../../Services/AuthService";

// ─── Factories de datos ───────────────────────────────────────────────────────

const makeLoginSuccess = (overrides = {}) => ({
  isActive2FA: false,
  data: { token: "session-token", user: { id: 1, name: "Test" } },
  ...overrides,
});

// ─── Helpers de infraestructura ───────────────────────────────────────────────

const mockFetch = (body, ok = true, status = 200) => {
  globalThis.fetch  = vi.fn().mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  });
};

const seedLocalStorage = (entries) =>
  Object.entries(entries).forEach(([k, v]) => localStorage.setItem(k, v));

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// getReadableErrors
// ─────────────────────────────────────────────────────────────────────────────

describe("getReadableErrors", () => {
  it("extrae los mensajes del array errors cuando está presente", () => {
    // Arrange
    const err = {
      errors: [{ message: "Campo requerido" }, { message: "Email inválido" }],
    };

    // Act
    const result = getReadableErrors(err);

    // Assert
    expect(result).toEqual(["Campo requerido", "Email inválido"]);
  });

  it("retorna el message del error cuando no hay array errors", () => {
    // Arrange
    const err = { message: "Error genérico" };

    // Act
    const result = getReadableErrors(err);

    // Assert
    expect(result).toEqual(["Error genérico"]);
  });

  it("retorna el mensaje por defecto cuando el objeto de error está vacío", () => {
    // Arrange
    const err = {};

    // Act
    const result = getReadableErrors(err);

    // Assert
    expect(result).toEqual(["Ocurrió un error inesperado"]);
  });

  it("retorna el mensaje por defecto cuando errors es un array vacío", () => {
    // Arrange
    const err = { errors: [] };

    // Act
    const result = getReadableErrors(err);

    // Assert
    expect(result).toEqual(["Ocurrió un error inesperado"]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getToken
// ─────────────────────────────────────────────────────────────────────────────

describe("getToken", () => {
  it("retorna null cuando no existe ningún token en localStorage", () => {
    // Arrange — localStorage limpio por beforeEach

    // Act
    const result = getToken();

    // Assert
    expect(result).toBeNull();
  });

  it("retorna el token almacenado cuando existe en localStorage", () => {
    // Arrange
    seedLocalStorage({ token: "abc123" });

    // Act
    const result = getToken();

    // Assert
    expect(result).toBe("abc123");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getPre2faToken
// ─────────────────────────────────────────────────────────────────────────────

describe("getPre2faToken", () => {
  it("retorna null cuando no existe PRE_2FA en localStorage", () => {
    // Arrange — localStorage limpio por beforeEach

    // Act
    const result = getPre2faToken();

    // Assert
    expect(result).toBeNull();
  });

  it("retorna el PRE_2FA token cuando existe en localStorage", () => {
    // Arrange
    seedLocalStorage({ PRE_2FA: "pre-token-xyz" });

    // Act
    const result = getPre2faToken();

    // Assert
    expect(result).toBe("pre-token-xyz");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// logoutService
// ─────────────────────────────────────────────────────────────────────────────

describe("logoutService", () => {
  it("elimina token, PRE_2FA y user del localStorage al cerrar sesión", () => {
    // Arrange
    seedLocalStorage({
      token: "session-abc",
      PRE_2FA: "pre-token",
      user: JSON.stringify({ id: 1 }),
    });

    // Act
    logoutService();

    // Assert
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("PRE_2FA")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// loginService
// ─────────────────────────────────────────────────────────────────────────────

describe("loginService", () => {
  it("guarda el token de sesión en localStorage cuando el login es exitoso sin 2FA", async () => {
    // Arrange
    const apiResponse = makeLoginSuccess();
    mockFetch(apiResponse);

    // Act
    const result = await loginService("test@mail.com", "password123");

    // Assert
    expect(result).toEqual(apiResponse);
    expect(localStorage.getItem("token")).toBe("session-token");
    expect(localStorage.getItem("user")).toBe(
      JSON.stringify({ id: 1, name: "Test" }),
    );
  });

  it("guarda PRE_2FA y no guarda token de sesión cuando 2FA está activo", async () => {
    // Arrange
    const apiResponse = { isActive2FA: true, pre2FAToken: "pre-token-abc" };
    mockFetch(apiResponse);

    // Act
    await loginService("test@mail.com", "password123");

    // Assert
    expect(localStorage.getItem("PRE_2FA")).toBe("pre-token-abc");
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("lanza un error con status 401 y código cuando las credenciales son inválidas", async () => {
    // Arrange
    const errorBody = {
      message: "Credenciales incorrectas",
      code: "INVALID_CREDENTIALS",
    };
    mockFetch(errorBody, false, 401);

    // Act & Assert
    await expect(loginService("test@mail.com", "wrong")).rejects.toMatchObject({
      message: "Credenciales incorrectas",
      status: 401,
      code: "INVALID_CREDENTIALS",
    });
  });

  it("envía email y password en el body de la petición POST al endpoint correcto", async () => {
    // Arrange
    mockFetch(makeLoginSuccess());

    // Act
    await loginService("user@test.com", "mypassword");

    // Assert
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/users/login"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "user@test.com",
          password: "mypassword",
        }),
      }),
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// activateTwoFactorAuthService
// ─────────────────────────────────────────────────────────────────────────────

describe("activateTwoFactorAuthService", () => {
  it("lanza error cuando no hay token de sesión en localStorage", async () => {
    // Arrange — localStorage vacío por beforeEach

    // Act & Assert
    await expect(activateTwoFactorAuthService()).rejects.toThrow(
      "No se encontró token de sesión",
    );
  });

  it("retorna los datos del QR cuando el servidor responde exitosamente", async () => {
    // Arrange
    seedLocalStorage({ token: "valid-token" });
    const apiResponse = {
      data: {
        qrImage: "data:image/png;base64,...",
        otpauthUrl: "otpauth://totp?secret=ABC123",
      },
    };
    mockFetch(apiResponse);

    // Act
    const result = await activateTwoFactorAuthService();

    // Assert
    expect(result).toEqual(apiResponse);
  });

  it("incluye el Bearer token en el header Authorization de la petición", async () => {
    // Arrange
    seedLocalStorage({ token: "my-session-token" });
    mockFetch({ data: {} });

    // Act
    await activateTwoFactorAuthService();

    // Assert
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/users/2fa/setup"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer my-session-token",
        }),
      }),
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// verify2FAService
// ─────────────────────────────────────────────────────────────────────────────

describe("verify2FAService", () => {
  it("lanza error cuando no hay token de sesión en localStorage", async () => {
    // Arrange — localStorage vacío por beforeEach

    // Act & Assert
    await expect(verify2FAService("123456")).rejects.toThrow(
      "No se encontró token de sesión",
    );
  });

  it("retorna nextStep=2FA_SETUP_COMPLETE cuando el código de verificación es válido", async () => {
    // Arrange
    seedLocalStorage({ token: "valid-token" });
    const apiResponse = { nextStep: "2FA_SETUP_COMPLETE" };
    mockFetch(apiResponse);

    // Act
    const result = await verify2FAService("123456");

    // Assert
    expect(result).toEqual(apiResponse);
  });

  it("lanza error con status 401 cuando el código 2FA es inválido", async () => {
    // Arrange
    seedLocalStorage({ token: "valid-token" });
    mockFetch({ message: "Código inválido" }, false, 401);

    // Act & Assert
    await expect(verify2FAService("000000")).rejects.toMatchObject({
      message: "Código inválido",
      status: 401,
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// validateLogin2FAService
// ─────────────────────────────────────────────────────────────────────────────

describe("validateLogin2FAService", () => {
  it("lanza error cuando no hay PRE_2FA token en localStorage", async () => {
    // Arrange — localStorage vacío por beforeEach

    // Act & Assert
    await expect(validateLogin2FAService("123456")).rejects.toThrow(
      "No se encontró token de pre-autenticación",
    );
  });

  it("retorna LOGIN_COMPLETE y el token final cuando el código de login es correcto", async () => {
    // Arrange
    seedLocalStorage({ PRE_2FA: "pre-token" });
    const apiResponse = {
      nextStep: "LOGIN_COMPLETE",
      token: "final-token",
      data: { id: 1 },
    };
    mockFetch(apiResponse);

    // Act
    const result = await validateLogin2FAService("123456");

    // Assert
    expect(result).toEqual(apiResponse);
  });

  it("lanza error con status 423 cuando la cuenta está bloqueada temporalmente", async () => {
    // Arrange
    seedLocalStorage({ PRE_2FA: "pre-token" });
    mockFetch({ message: "Bloqueado temporalmente" }, false, 423);

    // Act & Assert
    await expect(validateLogin2FAService("123456")).rejects.toMatchObject({
      status: 423,
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getStatus2FA
// ─────────────────────────────────────────────────────────────────────────────

describe("getStatus2FA", () => {
  it("lanza error cuando no hay token de sesión en localStorage", async () => {
    // Arrange — localStorage vacío por beforeEach

    // Act & Assert
    await expect(getStatus2FA()).rejects.toThrow(
      "No se encontró token de sesión",
    );
  });

  it("retorna el estado 2FA del usuario cuando la petición es exitosa", async () => {
    // Arrange
    seedLocalStorage({ token: "valid-token" });
    mockFetch({ isActive: true });

    // Act
    const result = await getStatus2FA();

    // Assert
    expect(result).toEqual({ isActive: true });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// desactivate2FAService
// ─────────────────────────────────────────────────────────────────────────────

describe("desactivate2FAService", () => {
  it("envía la password en el body POST al endpoint de desactivación", async () => {
    // Arrange
    seedLocalStorage({ token: "valid-token" });
    mockFetch({ success: true });

    // Act
    await desactivate2FAService("myPassword");

    // Assert
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/users/2fa/disable"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ password: "myPassword" }),
      }),
    );
  });
});
