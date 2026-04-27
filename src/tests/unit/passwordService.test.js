import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  changePasswordFirstLoginService,
  changePasswordService,
} from "../../Services/PasswordService";

const mockFetch = (body, ok = true, status = 200) => {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  });
};

const seedLocalStorage = (entries) =>
  Object.entries(entries).forEach(([key, value]) =>
    localStorage.setItem(key, value),
  );

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("changePasswordFirstLoginService", () => {
  it("lanza error cuando no existe FIRST_LOGIN en localStorage", async () => {
    await expect(
      changePasswordFirstLoginService("Nueva123", "Nueva123"),
    ).rejects.toThrow("No se encontró token de primer inicio de sesión");
  });

  it("envía la petición al endpoint correcto con el bearer token", async () => {
    seedLocalStorage({ FIRST_LOGIN: "first-token-123" });

    mockFetch({
      success: true,
      data: {
        token: "session-token-abc",
        user: { id: 1, name: "Iván" },
      },
    });

    await changePasswordFirstLoginService("Nueva123", "Nueva123");

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/users/first-login/change-password"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer first-token-123",
        }),
        body: JSON.stringify({
          newPassword: "Nueva123",
          confirmPassword: "Nueva123",
        }),
      }),
    );
  });

  it("elimina FIRST_LOGIN y guarda token y user cuando el cambio es exitoso", async () => {
    seedLocalStorage({ FIRST_LOGIN: "first-token-123" });

    await changePasswordFirstLoginService("Nueva123", "Nueva123");

    mockFetch({
      success: true,
      data: {
        token: "session-token-abc",
        user: { id: 1, name: "Iván" },
      },
    });
  });

  it("guarda token y user y elimina FIRST_LOGIN después del éxito", async () => {
    seedLocalStorage({ FIRST_LOGIN: "first-token-123" });

    mockFetch({
      success: true,
      data: {
        token: "session-token-abc",
        user: { id: 1, name: "Iván" },
      },
    });

    const result = await changePasswordFirstLoginService(
      "Nueva123",
      "Nueva123",
    );

    expect(result.success).toBe(true);
    expect(localStorage.getItem("FIRST_LOGIN")).toBeNull();
    expect(localStorage.getItem("token")).toBe("session-token-abc");
    expect(localStorage.getItem("user")).toBe(
      JSON.stringify({ id: 1, name: "Iván" }),
    );
  });

  it("lanza error cuando el backend responde con fallo", async () => {
    seedLocalStorage({ FIRST_LOGIN: "first-token-123" });

    mockFetch(
      {
        success: false,
        message: "Nueva contraseña no puede ser igual a la actual",
        code: "PASSWORD_REUSED",
      },
      false,
      400,
    );

    await expect(
      changePasswordFirstLoginService("Nueva123", "Nueva123"),
    ).rejects.toMatchObject({
      message: "Nueva contraseña no puede ser igual a la actual",
      status: 400,
      code: "PASSWORD_REUSED",
    });
  });
});

describe("changePasswordService", () => {
  it("lanza error cuando no hay token de sesión", async () => {
    await expect(
      changePasswordService("Actual123", "Nueva123", "Nueva123"),
    ).rejects.toThrow("No se encontró token de sesión");
  });

  it("envía currentPassword, newPassword y confirmPassword al endpoint correcto", async () => {
    seedLocalStorage({ token: "session-token-123" });

    mockFetch({
      success: true,
      message: "Contraseña cambiada exitosamente",
      data: { employeeId: "EMP001" },
    });

    await changePasswordService("Actual123", "Nueva123", "Nueva123");

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/users/change-password"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer session-token-123",
        }),
        body: JSON.stringify({
          currentPassword: "Actual123",
          newPassword: "Nueva123",
          confirmPassword: "Nueva123",
        }),
      }),
    );
  });

  it("retorna la respuesta cuando el cambio es exitoso", async () => {
    seedLocalStorage({ token: "session-token-123" });

    mockFetch({
      success: true,
      message: "Contraseña cambiada exitosamente",
      data: { employeeId: "EMP001" },
    });

    const result = await changePasswordService(
      "Actual123",
      "Nueva123",
      "Nueva123",
    );

    expect(result).toEqual({
      success: true,
      message: "Contraseña cambiada exitosamente",
      data: { employeeId: "EMP001" },
    });
  });

  it("lanza error cuando la contraseña actual es incorrecta", async () => {
    seedLocalStorage({ token: "session-token-123" });

    mockFetch(
      {
        success: false,
        message: "Credenciales inválidas",
        code: "INVALID_CREDENTIALS",
      },
      false,
      401,
    );

    await expect(
      changePasswordService("Mal123", "Nueva123", "Nueva123"),
    ).rejects.toMatchObject({
      message: "Credenciales inválidas",
      status: 401,
      code: "INVALID_CREDENTIALS",
    });
  });
});
