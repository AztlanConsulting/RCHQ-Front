# **Guía Completa de Pruebas (Testing) para Frontend (React)**

¡Bienvenido a la guía de pruebas del frontend\! Si el backend se asegura de que los datos sean correctos, el frontend se asegura de que **el usuario vea lo que tiene que ver y pueda hacer clic donde tiene que hacer clic**.

En este proyecto manejamos tres niveles de pruebas, formando lo que conocemos como la "Pirámide de Pruebas":

1. **Pruebas Unitarias:** Evalúan una pieza diminuta y aislada (ej. un botón, una alerta, o una función de cálculo). Son extremadamente rápidas.
2. **Pruebas de Integración:** Evalúan cómo interactúan varias piezas juntas (ej. Una página completa que usa un formulario y simula llamar a un servicio).
3. **Pruebas End-to-End (E2E):** El jefe final. Abren un navegador real (Chrome, Firefox), hacen clic, escriben texto y navegan como lo haría un humano.

## **1\. Instalación y Herramientas Principales**

En lugar de Jest y Supertest (que usamos en el backend), en el frontend nuestro stack es distinto:

- **Vitest (vitest):** Es nuestro motor principal, el reemplazo moderno y ultrarrápido de Jest. Busca archivos .test.jsx, los ejecuta y nos dice si pasaron o fallaron.
- **React Testing Library (@testing-library/react):** Es nuestra herramienta para renderizar componentes en la memoria. Piensa en RTL como un "usuario ciego" que navega por tu app leyendo textos, etiquetas (labels) y roles de botones.
- **Playwright (@playwright/test):** Es nuestro "robot fantasma". Levanta navegadores de verdad y toma el control del ratón y el teclado.

**Tus comandos del día a día (en el package.json):**

- "test:unit": Ejecuta solo las pruebas atómicas.
- "test:integration": Ejecuta las pruebas de páginas complejas.
- "test:e2e": Ejecuta al robot en la terminal.
- "test:e2e:ui": Abre la interfaz gráfica de Playwright para ver al robot en acción (¡ideal para depurar\!).

## **2\. Configuración (El "Detrás de Escena")**

Para que React pueda ser probado en una terminal negra que no tiene pantalla gráfica, hacemos un par de trucos:

**A. vitest.config.js y el entorno jsdom**

Como Vitest corre en Node.js (que no tiene DOM, ni document, ni window), le decimos: environment: "jsdom". Esto crea una "Matrix", un navegador invisible en la memoria donde nuestros componentes creen que están siendo dibujados en una pantalla real.

**B. vitest.setup.js**

Igual que en el backend, aquí ejecutamos cleanup() y vi.clearAllMocks() después de cada prueba. Esto "destruye" el componente renderizado para que la siguiente prueba empiece con la pantalla en blanco.

**C. playwright.config.js (El bloque webServer)**

Playwright necesita que tu app esté encendida para poder navegar a localhost:5173. En la configuración, le decimos exactamente qué comando usar (npm run dev) y qué puerto esperar, así él levanta la app automáticamente antes de probar.

## **3\. Componentes de VITEST y RTL (Pruebas Unitarias)**

Abre tu archivo tests/unit/Alert.test.jsx. Aquí usamos el Patrón AAA (Arrange, Act, Assert).

JavaScript

```
describe("Alert — renderizado base", () => {
  it("aplica la clase de fondo verde para el tipo success", () => {

    // 1. ARRANGE (Preparar) & ACT (Actuar)
    // Usamos render() de RTL para "dibujar" el componente en nuestro DOM virtual.
    const { container } = render(<Alert type="success" message="OK" />);

    // 2. ASSERT (Comprobar)
    // Verificamos que el primer elemento hijo tenga la clase de Tailwind correcta.
    expect(container.firstChild).toHaveClass("bg-green-500");
  });
});
```

### **¿Cómo interactuar con la pantalla? (fireEvent / userEvent)**

En el archivo TextField.test.jsx, no solo dibujamos el componente, sino que simulamos que un humano escribe en él:

JavaScript

```
// Usamos screen para "buscar" en la pantalla
const input = screen.getByRole("textbox");

// Disparamos un evento de cambio simulando que el usuario teclea "hola"
fireEvent.change(input, { target: { value: "hola" } });

// Verificamos si nuestra función espía (Mock) fue llamada con "hola"
expect(setValue).toHaveBeenCalledWith("hola");
```

## **4\. Pruebas de Integración (Uniendo Piezas)**

En el backend, las pruebas de integración atacan una base de datos real de pruebas. **En el frontend, la regla es diferente: NUNCA llamamos al backend real en estas pruebas.**

Abre tests/integration/LoginPage.integration.test.jsx. Aquí probamos la página entera (LoginPage.jsx), pero le "mentimos" sobre las redirecciones y las respuestas del servidor usando **Mocks**.

### **Los Mocks del Frontend (vi.mock)**

Igual que el "actor de doblaje" del backend, aquí usamos vi.mock de Vitest para secuestrar servicios:

JavaScript

```
// Secuestramos todo el AuthService
vi.mock("../../../src/services/authService", () => ({
  loginService: vi.fn(), // Reemplazamos la llamada real (fetch) por una función vacía
  getReadableErrors: vi.fn(),
}));
```

### **Diseccionando una Prueba de Integración**

Vamos a ver cómo simulamos que el servidor nos responde exitosamente:

JavaScript

```
it("guarda el token y navega al dashboard cuando el login es exitoso", async () => {
  // --- ARRANGE ---
  // Le ordenamos a nuestro clon del servicio: "Cuando la página te llame,
  // finge que el backend devolvió este token perfecto".
  loginService.mockResolvedValue({
    success: true,
    isActive2FA: false,
    data: { token: "real-token-123", user: { id: 1 } },
  });

  // Dibujamos la página completa. Como LoginPage usa rutas, lo envolvemos en <MemoryRouter>
  render(<MemoryRouter><LoginPage /></MemoryRouter>);

  // --- ACT ---
  // Simulamos al usuario escribiendo y haciendo clic
  fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: "user@test.com" } });
  fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));

  // --- ASSERT ---
  // await waitFor() es vital. Como el login es asíncrono (Promesa),
  // le decimos a Vitest que espere un milisegundo a que la pantalla se actualice.
  await waitFor(() => {
    // Verificamos que nuestro Mock de navegación intentó llevar al usuario al dashboard
    expect(mockNavigate).toHaveBeenCalledWith("/app/dashboard", { replace: true });
  });
});
```

## **5\. Playwright (Pruebas End-to-End)**

Abre tests/e2e/auth.e2e.test.js. Aquí ya no hay Mocks de código (no existe vi.mock). Aquí abrimos Google Chrome y navegamos de verdad.

### **Intercepción de Red (El engaño supremo)**

Como tampoco queremos depender de que el backend esté encendido, Playwright tiene un superpoder: page.route.

Piensa en page.route como un agente del FBI interviniendo una línea telefónica.

JavaScript

```
const interceptLogin = async (page, body) => {
  // Le decimos a Playwright: "Intercepta cualquier petición HTTP que termine en /users/login"
  await page.route("**/users/login", (route) =>
    // Fulfill significa: "Cancela la llamada a Internet y devuélvele al navegador este JSON falso"
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    })
  );
};
```

### **Anatomía de una prueba E2E**

Mira cómo fluye la prueba crítica que navega al 2FA:

JavaScript

```
test("navega a /2FA cuando el login indica que 2FA está activo", async ({ page }) => {

  // 1. ARRANGE
  // Intervenimos la red. Cuando el frontend intente hacer fetch(), recibirá esto:
  await interceptLogin(page, {
    success: true,
    isActive2FA: true,
    pre2FAToken: "pre-token-abc",
  });

  // Le decimos al navegador que cargue la URL
  await page.goto("/iniciar-sesion");

  // 2. ACT
  // El navegador interactúa con la UI visible
  await page.getByLabel('Contraseña', { exact: true }).fill("Password123!");
  await page.getByRole("button", { name: /ingresar/i }).click();

  // 3. ASSERT
  // Verificamos que la URL del navegador haya cambiado exitosamente a /2FA
  // Esto demuestra que el ruteo, el guardado en localStorage y los componentes funcionan en armonía.
  await expect(page).toHaveURL(/\/2FA/);
});
```

### **Resumen Visual de Conceptos Frontend**

- **render(\<Componente/\>)**: Vitest/RTL. Dibuja un pedacito de tu app en la memoria.
- **screen.getByRole()**: Vitest/RTL. Busca un elemento visual en ese dibujo.
- **page.goto('/ruta')**: Playwright. Le ordena al navegador abrir esa pestaña.
- **page.route()**: Playwright. Hackea la tarjeta de red del navegador para simular respuestas del backend.
- **vi.mock()**: Vitest. Un actor de doblaje que reemplaza código complejo (como servicios o librerías) por funciones vacías que tú controlas.
