# Documentación de Frontend

**Stack Principal:** React 19.2.4 | React Router 7.13.1 | TailwindCSS 4.3.0 | Vite 8.0.11
**UI & Componentes:** Flowbite / Flowbite React 0.12.17 | FullCalendar 6.1.20
**Utilidades:** Zod (Validación) | secureFetch (Fetch API Wrapper)
**Testing:** Vitest | React Testing Library | Playwright

---

## Estructura de Carpetas

```text
src/
├── main.jsx                    → Punto entrada + AuthProvider
├── app.jsx                     → Router y definición de rutas
├── components/
│   ├── firstLoginRoute.jsx     → Guard para primer inicio (cambio de password)
│   ├── protectedRoute.jsx      → Guard para rutas que requieren sesión
│   ├── publicRoute.jsx         → Guard para rutas públicas (login, landing)
│   ├── appLayout.jsx           → Layout principal (sidebar, navbar)
│   ├── atoms/                  → Componentes base sin estado (botones, inputs, chips)
│   ├── molecules/              → Composiciones de atoms (tarjetas, paginación)
│   └── organism/               → Componentes complejos con lógica (formularios, ej: EmployeeAdminCard)
├── pages/                      → Vistas completas que mapean a rutas
│   ├── dashboard.jsx, perfil.jsx, etc.
│   └── auth/                   → Vistas de login, 2FA, etc.
├── hooks/                      → Lógica encapsulada y reutilizable (useLogin, useDocuments)
├── services/                   → Comunicación HTTP y flujos de negocio
│   ├── authService.js          → Login, 2FA, logout
│   ├── employeeUpdateService.js→ Actualización de empleados
│   └── profileService.js       → Datos de perfil
├── context/                    
│   └── authContext.jsx         → Estado global de sesión (exporta useAuthContext)
├── utils/
│   ├── authStorage.js          → Funciones para interactuar con localStorage
│   ├── apiErrors.js            → Transformación y estandarización de errores (buildApiError)
│   ├── secureFetchWrapper.js   → Wrapper de Fetch que inyecta tokens automáticamente
│   └── schema/                 → Esquemas de validación Zod
└── tests/                      → Pruebas automatizadas
    ├── unit/                   → Pruebas unitarias (RTL + Vitest)
    ├── integration/            → Pruebas de integración (RTL + Vitest)
    └── e2e/                    → Pruebas de extremo a extremo (Playwright)
```

---

## Convenciones de Desarrollo

- **Nombres de archivos:** `camelCase` para componentes y utilidades (ej. `firstLoginRoute.jsx`, `employeeUpdate.unit.test.jsx`).
- **Código React:** `PascalCase` para la definición de funciones de componentes (ej. `function FirstLoginRoute() {}`).
- **Atomic Design:** 
  - *Atoms* (sin dependencias, puro UI) → *Molecules* (agrupaciones simples) → *Organisms* (componentes funcionales con estado interno/hooks) → *Pages* (consumen servicios y contextos).
- **Validación:** Uso de esquemas `Zod` típicamente manejados en Hooks o en el propio componente antes de invocar un Service.
- **Formateo y Linting:** Se requiere ejecutar Prettier (`npm run format`) y ESLint (`npm run lint:fix`) antes de los commits. Opcionalmente usar `npm run lint:staged`.

---

## Flujo de Datos Arquitectónico

```text
Page Component (ej. Perfil / Login)
  ↓ (Consume useAuthContext y hooks locales)
Custom Hook (ej. useLogin)
  ↓ (Valida datos con Zod + Maneja estados loading/error)
Service (ej. authService, profileService)
  ↓ (Realiza fetch directo o usando secureFetch + maneja Errores con buildApiError)
API Backend
  ↓ (Responde con JSON)
localStorage + AuthContext
  ↓ (Actualiza sesión y estado)
Redireccionamiento / Alerta en UI
```

**Regla de Oro:** Los componentes visuales NUNCA hacen peticiones HTTP directamente (no usan `fetch` o `secureFetch`). Siempre deben delegarlo a un *Service*.

---

## Gestión de Sesión y HTTP (Servicios)

### secureFetchWrapper.js
Para todas las rutas protegidas, utilizamos `secureFetch` en lugar del `fetch` nativo. Este wrapper se encarga de inyectar la cabecera `Authorization: Bearer <token>` de forma transparente.

```javascript
// Ejemplo de uso en un Service:
import { secureFetch } from "@/utils/secureFetchWrapper";

export const getUpdateFormService = async () => {
  const response = await secureFetch("/employee/update-form", { method: "GET" });
  // El manejo de errores y conversión a JSON se hace aquí
};
```

### localStorage (authStorage.js)
El acceso al `localStorage` debe estar centralizado para evitar vulnerabilidades XSS directas o errores de typos:
- `getToken()` / `setToken(token)` → Manejo del JWT Principal.
- `getFirstLoginToken()` → Token para el flujo de cambio obligatorio de contraseña.
- `getPreTwoFactorAuthToken()` → Token temporal si el usuario tiene 2FA activado.

---

## Sistema de Autenticación y 2FA

El flujo de autenticación incluye Autenticación en 2 Pasos (2FA) y validaciones de Primer Inicio.

1. **Login Inicial (`authService.js`):** Valida credenciales.
   - Si no hay 2FA: Devuelve token final.
   - Si hay 2FA: Devuelve `preTwoFactorAuthToken` y estado `isActiveTwoFactorAuth: true`.
2. **Validación 2FA:** Se pide código al usuario. Si es exitoso, la API entrega el token de sesión final.
3. **Contexto (`authContext.jsx`):** Expone `useAuthContext()` con las propiedades: `login({ token, user })`, `logout()`, `isAuthenticated`.

### Guards de Rutas Principales

| Ruta | Guard | Descripción / Comportamiento |
|------|-------|-------------|
| `/` | - | Landing pública |
| `/iniciar-sesion` | `PublicRoute` | Redirige al dashboard si ya hay sesión. |
| `/2FA` | `Pre2FARoute` | Protege el ingreso de código TOTP. |
| `/primer-inicio/*` | `FirstLoginRoute` | Verifica `firstLoginToken`, si no existe va al login; si hay sesión normal, va al app. |
| `/app/*` | `ProtectedRoute` | Valida que exista token válido, carga el `appLayout.jsx`. |

---

## Pruebas (Testing)

El proyecto sigue una estructura de **Pirámide de Pruebas**, dividida en tres niveles:

1. **Unitarias (`test:unit` - Vitest / RTL):**
   - Evalúan componentes aislados (Atoms/Molecules) y Servicios (ej. `authService.test.js`).
   - Siguen el patrón AAA (Arrange, Act, Assert).
   - El DOM virtual se simula con `jsdom` y las interacciones con `fireEvent` o `userEvent`.
2. **Integración (`test:integration` - Vitest / RTL):**
   - Prueban páginas completas (ej. `twoFactorLogin.integration.test.jsx`).
   - NUNCA llaman al backend real. Se secuestran los servicios usando `vi.mock()`.
   - Útiles para verificar el enrutamiento (`MemoryRouter`) y las lógicas condicionales visuales.
3. **End-to-End (`test:e2e` - Playwright):**
   - Abren navegadores reales y simulan el clic/tipeo de un usuario humano.
   - Utilizan intercepción de red (`page.route`) para simular respuestas HTTP, garantizando que el Frontend pueda probarse sin depender del Backend en vivo.

---

## Manejo de Errores

El proyecto utiliza un sistema estandarizado para reportar errores amigables al usuario.

- **`buildApiError(res, data, msg)`**: Construye un objeto `Error` extendido con atributos de `status` y mensajes nativos del API.
- **`getReadableErrors(err)`**: Analiza el error retornado por la API (ya sea un string, un arreglo `errors` de un bad request o un 500) y devuelve un arreglo de strings legibles para mostrar en la interfaz (ej. en componentes tipo *Alert* o Toast).
