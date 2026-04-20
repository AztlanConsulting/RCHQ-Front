// src/tests/e2e/auth.e2e.test.js
import { test, expect } from "@playwright/test";

// ─── Helpers ──────────────────────────────────────────────
const interceptLogin = async (page, body, status = 200) => {
  await page.route("**/users/login", (route) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    })
  );
};

const interceptValidate2FA = async (page, body, status = 200) => {
  await page.route("**/users/2fa/validate", (route) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    })
  );
};

// ← usa placeholder en lugar de label para evitar strict mode violation
const fillLoginForm = async (page, email, password) => {
  await page.getByLabel(/correo electrónico/i).fill(email);
  await page.getByPlaceholder(/ingresa tu contraseña/i).fill(password);
  await page.getByRole("button", { name: /ingresar/i }).click();
};

// ─────────────────────────────────────────────────────────
// LoginPage
// ─────────────────────────────────────────────────────────
test.describe("LoginPage", () => {
  test("muestra el formulario con campos y botón al entrar a /iniciar-sesion", async ({ page }) => {
    // Arrange
    await page.goto("/iniciar-sesion");

    // Assert
    await expect(page.getByLabel(/correo electrónico/i)).toBeVisible();
    await expect(page.getByPlaceholder(/ingresa tu contraseña/i)).toBeVisible(); // ← cambio
    await expect(
      page.getByRole("button", { name: /ingresar/i })
    ).toBeVisible();
  });

  test("muestra errores de validación al enviar el formulario vacío", async ({ page }) => {
    // Arrange
    await page.goto("/iniciar-sesion");

    // Act
    await page.getByRole("button", { name: /ingresar/i }).click();

    // Assert
    await expect(page.locator("ul li").first()).toBeVisible();
  });

  test("muestra error cuando el email tiene formato inválido", async ({ page }) => {
    // Arrange
    await page.goto("/iniciar-sesion");

    // Act
    const emailInput = page.getByLabel(/correo electrónico/i);
    await emailInput.fill("no-es-email");
    await page.getByPlaceholder(/ingresa tu contraseña/i).fill("Password123!"); 
    await page.getByRole("button", { name: /ingresar/i }).click();

    // Assert
    // 1. Verificamos que el navegador detectó el error de formato (typeMismatch)
    const isInvalidFormat = await emailInput.evaluate((el) => el.validity.typeMismatch);
    expect(isInvalidFormat).toBeTruthy();

    // 2. Verificamos que el input tenga ALGÚN mensaje de error (sin importar en qué idioma o navegador esté)
    const validationMessage = await emailInput.evaluate((el) => el.validationMessage);
    expect(validationMessage).not.toBe("");
  });

  test("cambia el input a tipo texto al hacer click en mostrar contraseña", async ({ page }) => {
    // Arrange
    await page.goto("/iniciar-sesion");
    const passwordInput = page.getByPlaceholder(/ingresa tu contraseña/i);
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Act
    await page.getByRole("button", { name: /mostrar contraseña/i }).click();

    // Assert
    await expect(passwordInput).toHaveAttribute("type", "text");
  });

  test("vuelve a tipo password al hacer click en ocultar contraseña", async ({ page }) => {
    // Arrange
    await page.goto("/iniciar-sesion");
    await page.getByRole("button", { name: /mostrar contraseña/i }).click();

    // Act
    await page.getByRole("button", { name: /ocultar contraseña/i }).click();

    // Assert
    await expect(
      page.getByPlaceholder(/ingresa tu contraseña/i)
    ).toHaveAttribute("type", "password");
  });

  test("navega a /app/dashboard cuando el login es exitoso sin 2FA", async ({ page }) => {
    // Arrange
    await interceptLogin(page, {
      success: true,
      isActive2FA: false,
      data: { token: "valid-token-123", user: { id: 1, name: "Test User" } },
    });
    await page.goto("/iniciar-sesion");

    // Act
    await fillLoginForm(page, "usuario@test.com", "Password123!");

    // Assert
    await expect(page).toHaveURL(/\/app\/dashboard/);
  });

  test("navega a /2FA cuando el login indica que 2FA está activo", async ({ page }) => {
    // Arrange
    await interceptLogin(page, {
      success: true,
      isActive2FA: true,
      pre2FAToken: "pre-token-abc",
    });
    await page.goto("/iniciar-sesion");

    // Act
    await fillLoginForm(page, "usuario@test.com", "Password123!");

    // Assert
    await expect(page).toHaveURL(/\/2FA/);
  });

  test("muestra el error del servidor cuando las credenciales son inválidas", async ({ page }) => {
    // Arrange
    await interceptLogin(
      page,
      { message: "Credenciales incorrectas", code: "INVALID_CREDENTIALS" },
      401
    );
    await page.goto("/iniciar-sesion");

    // Act
    await fillLoginForm(page, "usuario@test.com", "WrongPassword1!");

    // Assert
    await expect(page.getByText(/credenciales incorrectas/i)).toBeVisible();
  });

  test("muestra el botón deshabilitado con Cargando mientras espera la respuesta", async ({ page }) => {
    // Arrange
    await page.route("**/users/login", async (route) => {
      await new Promise((r) => setTimeout(r, 1000));
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          isActive2FA: false,
          data: { token: "t", user: {} },
        }),
      });
    });
    await page.goto("/iniciar-sesion");

    // Act
    await fillLoginForm(page, "usuario@test.com", "Password123!");

    // Assert
    await expect(
      page.getByRole("button", { name: /cargando/i })
    ).toBeDisabled();
  });
});

// ─────────────────────────────────────────────────────────
// Flujo completo Login → 2FA → Dashboard
// ─────────────────────────────────────────────────────────
test.describe("Flujo Login → 2FA → Dashboard", () => {
  test("completa el login con 2FA y aterriza en el dashboard", async ({ page }) => {
    // Arrange
    await interceptLogin(page, {
      success: true,
      isActive2FA: true,
      pre2FAToken: "pre-token-abc",
    });
    await interceptValidate2FA(page, {
      nextStep: "LOGIN_COMPLETE",
      token: "final-token-xyz",
      data: { id: 1, name: "Test User" },
    });
    await page.goto("/iniciar-sesion");

    // Act
    await fillLoginForm(page, "usuario@test.com", "Password123!");
    await expect(page).toHaveURL(/\/2FA/);
    await page.getByPlaceholder(/ingresa el código/i).fill("123456"); // ← más específico
    await page.getByRole("button", { name: /verificar/i }).click();

    // Assert
    await expect(page).toHaveURL(/\/app\/dashboard/);
  });

  test("muestra error y permanece en /2FA cuando el código es inválido", async ({ page }) => {
    // Arrange
    await interceptLogin(page, {
      success: true,
      isActive2FA: true,
      pre2FAToken: "pre-token",
    });
    await interceptValidate2FA(
      page,
      { message: "Código 2FA inválido" },
      401
    );
    await page.goto("/iniciar-sesion");
    await fillLoginForm(page, "usuario@test.com", "Password123!");
    await expect(page).toHaveURL(/\/2FA/);

    // Act
    await page.getByPlaceholder(/ingresa el código/i).fill("000000");
    await page.getByRole("button", { name: /verificar/i }).click();

    // Assert
    await expect(page.getByText(/código 2fa inválido/i)).toBeVisible();
    await expect(page).toHaveURL(/\/2FA/);
  });

  test("deshabilita el formulario cuando el error es 423", async ({ page }) => {
    // Arrange
    await interceptLogin(page, {
      success: true,
      isActive2FA: true,
      pre2FAToken: "pre-token",
    });
    await interceptValidate2FA(
      page,
      { message: "Bloqueado temporalmente" },
      423
    );
    await page.goto("/iniciar-sesion");
    await fillLoginForm(page, "usuario@test.com", "Password123!");
    await expect(page).toHaveURL(/\/2FA/);

    // Act
    await page.getByPlaceholder(/ingresa el código/i).fill("123456");
    await page.getByRole("button", { name: /verificar/i }).click();

    // Assert
    await expect(page.getByText(/bloqueada temporalmente/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /verificar/i })
    ).toBeDisabled();
  });
});

// ─────────────────────────────────────────────────────────
// Guards de rutas
// ─────────────────────────────────────────────────────────
test.describe("Guards de rutas", () => {
  test("redirige a /iniciar-sesion al acceder a /2FA sin PRE_2FA token", async ({ page }) => {
    // Arrange — localStorage vacío por defecto en Playwright

    // Act
    await page.goto("/2FA");

    // Assert
    await expect(page).toHaveURL(/\/iniciar-sesion/);
  });

  test("redirige a /app/dashboard al acceder a /iniciar-sesion con sesión activa", async ({ page }) => {
    // Arrange
    await page.addInitScript(() => {
      localStorage.setItem("token", "valid-session-token");
    });

    // Act
    await page.goto("/iniciar-sesion");

    // Assert
    await expect(page).toHaveURL(/\/app\/dashboard/);
  });
});