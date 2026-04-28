import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  loginService,
  getToken,
  getPreTwoFactorAuthToken,
  logoutService,
  getReadableErrors,
  activateTwoFactorAuthService,
  verifyTwoFactorAuthService,
  validateLoginTwoFactorAuthService,
  getTwoFactorAuthStatus,
  deactivateTwoFactorAuthService,
} from "../../Services/AuthService";

// ─── Factories ────────────────────────────────────────────────────────────────

const makeLoginSuccess = (overrides = {}) => ({
  isActiveTwoFactorAuth: false, // ← campo real del servicio
  data: { token: "session-token", user: { id: 1, name: "Test" } },
  ...overrides,
});

const mockFetch = (body, ok = true, status = 200) => {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  });
};

const seedLocalStorage = (entries) =>
  Object.entries(entries).forEach(([k, v]) => localStorage.setItem(k, v));

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

// ─── getReadableErrors ────────────────────────────────────────────────────────

describe("getReadableErrors", () => {
  it("extrae los mensajes del array errors cuando está presente", () => {
    const err = {
      errors: [{ message: "Campo requerido" }, { message: "Email inválido" }],
    };
    expect(getReadableErrors(err)).toEqual([
      "Campo requerido",
      "Email inválido",
    ]);
  });

  it("retorna el message del error cuando no hay array errors", () => {
    expect(getReadableErrors({ message: "Error genérico" })).toEqual([
      "Error genérico",
    ]);
  });

  it("retorna el mensaje por defecto cuando el objeto de error está vacío", () => {
    expect(getReadableErrors({})).toEqual(["Ocurrió un error inesperado"]);
  });

  it("retorna el mensaje por defecto cuando errors es un array vacío", () => {
    expect(getReadableErrors({ errors: [] })).toEqual([
      "Ocurrió un error inesperado",
    ]);
  });
});

// ─── getToken ─────────────────────────────────────────────────────────────────

describe("getToken", () => {
  it("retorna null cuando no existe ningún token en localStorage", () => {
    expect(getToken()).toBeNull();
  });

  it("retorna el token almacenado cuando existe en localStorage", () => {
    seedLocalStorage({ token: "abc123" });
    expect(getToken()).toBe("abc123");
  });
});

// ─── getPreTwoFactorToken ─────────────────────────────────────────────────────

describe("getPreTwoFactorAuthToken", () => {
  it("retorna null cuando no existe el token pre-TwoFactorAuth en localStorage", () => {
    expect(getPreTwoFactorAuthToken()).toBeNull();
  });

  it("retorna el token cuando existe en localStorage", () => {
    seedLocalStorage({ PRE_TwoFactorAuth: "pre-token-xyz" }); 
    expect(getPreTwoFactorAuthToken()).toBe("pre-token-xyz");
  });
});

// ─── logoutService ────────────────────────────────────────────────────────────

describe("logoutService", () => {
  it("elimina token, preTwoFactorToken y user del localStorage al cerrar sesión", () => {
    seedLocalStorage({
      token: "session-abc",
      PRE_TwoFactorAuth: "pre-token",
      user: JSON.stringify({ id: 1 }),
    });
    logoutService();
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("PRE_TwoFactorAuth")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });
});

// ─── loginService ─────────────────────────────────────────────────────────────

describe("loginService", () => {
  it("guarda el token de sesión en localStorage cuando el login es exitoso sin TwoFactorAuth", async () => {
    const apiResponse = makeLoginSuccess();
    mockFetch(apiResponse);
    const result = await loginService("test@mail.com", "password123");
    expect(result).toEqual(apiResponse);
    expect(localStorage.getItem("token")).toBe("session-token");
    expect(localStorage.getItem("user")).toBe(
      JSON.stringify({ id: 1, name: "Test" }),
    );
  });

  it("guarda preTwoFactorToken y no guarda token de sesión cuando TwoFactorAuth está activo", async () => {
    const apiResponse = {
      isActiveTwoFactorAuth: true,
      preTwoFactorAuthToken: "pre-token-abc",
    };
    mockFetch(apiResponse);
    await loginService("test@mail.com", "password123");
    expect(localStorage.getItem("PRE_TwoFactorAuth")).toBe("pre-token-abc"); 
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("lanza un error con status 401 cuando las credenciales son inválidas", async () => {
    mockFetch(
      { message: "Credenciales incorrectas", code: "INVALID_CREDENTIALS" },
      false,
      401,
    );
    await expect(loginService("test@mail.com", "wrong")).rejects.toMatchObject({
      message: "Credenciales incorrectas",
      status: 401,
      code: "INVALID_CREDENTIALS",
    });
  });

  it("envía email y password en el body POST al endpoint correcto", async () => {
    mockFetch(makeLoginSuccess());
    await loginService("user@test.com", "mypassword");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/login"),
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

// ─── activateTwoFactorAuthService ─────────────────────────────────────────────

describe("activateTwoFactorAuthService", () => {
  it("lanza error cuando no hay token de sesión en localStorage", async () => {
    await expect(activateTwoFactorAuthService()).rejects.toThrow(
      "No se encontró token de sesión",
    );
  });

  it("retorna los datos del QR cuando el servidor responde exitosamente", async () => {
    seedLocalStorage({ token: "valid-token" });
    const apiResponse = {
      data: {
        qrImage: "data:image/png;base64,...",
        otpauthUrl: "otpauth://totp?secret=ABC123",
      },
    };
    mockFetch(apiResponse);
    const result = await activateTwoFactorAuthService();
    expect(result).toEqual(apiResponse);
  });

  it("incluye el Bearer token en el header Authorization", async () => {
    seedLocalStorage({ token: "my-session-token" });
    mockFetch({ data: {} });
    await activateTwoFactorAuthService();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/2fa/setup"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer my-session-token",
        }),
      }),
    );
  });
});

// ─── verifyTwoFactorAuthService ───────────────────────────────────────────────

describe("verifyTwoFactorAuthService", () => {
  it("lanza error cuando no hay token de sesión en localStorage", async () => {
    await expect(verifyTwoFactorAuthService("123456")).rejects.toThrow(
      "No se encontró token de sesión",
    );
  });

  it("retorna nextStep=TwoFactorAuth_SETUP_COMPLETE cuando el código es válido", async () => {
    seedLocalStorage({ token: "valid-token" });
    mockFetch({ nextStep: "TwoFactorAuth_SETUP_COMPLETE" });
    const result = await verifyTwoFactorAuthService("123456");
    expect(result).toEqual({ nextStep: "TwoFactorAuth_SETUP_COMPLETE" });
  });

  it("lanza error con status 401 cuando el código TwoFactorAuth es inválido", async () => {
    seedLocalStorage({ token: "valid-token" });
    mockFetch({ message: "Código inválido" }, false, 401);
    await expect(verifyTwoFactorAuthService("000000")).rejects.toMatchObject({
      message: "Código inválido",
      status: 401,
    });
  });
});

// ─── validateLoginTwoFactorAuthService ───────────────────────────────────────

describe("validateLoginTwoFactorAuthService", () => {
  it("lanza error cuando no hay preTwoFactorToken en localStorage", async () => {
    await expect(validateLoginTwoFactorAuthService("123456")).rejects.toThrow(
      "No se encontró token de pre-autenticación",
    );
  });

  it("retorna LOGIN_COMPLETE y el token final cuando el código es correcto", async () => {
    seedLocalStorage({ PRE_TwoFactorAuth: "pre-token" }); // ← clave real
    const apiResponse = {
      nextStep: "LOGIN_COMPLETE",
      token: "final-token",
      data: { id: 1 },
    };
    mockFetch(apiResponse);
    const result = await validateLoginTwoFactorAuthService("123456");
    expect(result).toEqual(apiResponse);
  });

  it("lanza error con status 423 cuando la cuenta está bloqueada", async () => {
    seedLocalStorage({ PRE_TwoFactorAuth: "pre-token" });
    mockFetch({ message: "Bloqueado temporalmente" }, false, 423);
    await expect(
      validateLoginTwoFactorAuthService("123456"),
    ).rejects.toMatchObject({ status: 423 });
  });
});

// ─── getStatusTwoFactorAuth ───────────────────────────────────────────────────

describe("getStatusTwoFactorAuth", () => {
  it("lanza error cuando no hay token de sesión en localStorage", async () => {
    await expect(getTwoFactorAuthStatus()).rejects.toThrow(
      "No se encontró token de sesión",
    );
  });

  it("retorna el estado TwoFactorAuth del usuario cuando la petición es exitosa", async () => {
    seedLocalStorage({ token: "valid-token" });
    mockFetch({ isActive: true });
    const result = await getTwoFactorAuthStatus();
    expect(result).toEqual({ isActive: true });
  });
});

// ─── desactivateTwoFactorAuthService ─────────────────────────────────────────

describe("desactivateTwoFactorAuthService", () => {
  it("envía la password en el body POST al endpoint de desactivación", async () => {
    seedLocalStorage({ token: "valid-token" });
    mockFetch({ success: true });
    await deactivateTwoFactorAuthService("myPassword");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/2fa/disable"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ password: "myPassword" }),
      }),
    );
  });
});
