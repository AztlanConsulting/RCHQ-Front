# Documentación Frontend

## Arquitectura: React + Router + Service Layer

El frontend sigue un patrón React con React Router para navegación, componentes organizados por Atomic Design, y una capa de servicios para lógica HTTP. Cada capa tiene una responsabilidad única.

```
src/
├── main.jsx                         → Punto de entrada React
├── App.jsx                          → Router principal y rutas
├── index.css                        → Estilos globales (Tailwind)
├── Components/
│   ├── ProtectedRoute.jsx           → Guard de autenticación (HOC)
│   ├── AppLayout.jsx                → Layout con sidebar
│   ├── Atoms/                       → Componentes base (Button, TextField, etc.)
│   ├── Molecules/                   → Combinaciones de Atoms
│   └── Organism/                    → Componentes complejos
├── Pages/                           → Componentes de página
│   ├── Landing.jsx, Dashboard.jsx   → Páginas públicas/protegidas
│   └── Auth/                        → Páginas de autenticación
├── context/                         → Context API (AuthContext)
├── hooks/                           → Custom hooks
├── Services/                        → Lógica HTTP
│   ├── AuthService.jsx              → Autenticación
│   ├── DocumentService.jsx          → Documentos
│   └── ProfileService.jsx           → Perfil
├── schemas/                         → Validación con Zod
│   └── auth.schemas.js              → Schema de login
└── utils/                           → Funciones auxiliares
```

---

## Flujo de una Request

```
1. Usuario interactúa con componente (formulario, botón, etc.)
2. Componente llama al Service (ej: loginService)
3. Service valida datos con Zod schema
4. Service hace fetch HTTP a la API
5. API retorna respuesta (exitosa o error)
6. Service maneja el resultado y retorna { code, data? }
7. Componente recibe resultado
8. Si éxito: guarda datos en localStorage y redirige
9. Si error: muestra alerta con mensaje de error
10. Response regresa al cliente/componente
```

---

## Capas

### Pages/
**Responsabilidad única: renderizar una página completa con su lógica de negocio.**

Las páginas son componentes React que utilizan hooks personalizados y servicios. Manejan el flujo de datos, formularios y redireccionamiento.

---

### Components/

#### ProtectedRoute.jsx
**Guard de autenticación.** Valida que exista un token en localStorage. Si no existe, redirige a `/login`. Si existe, permite acceso a las rutas anidadas.

```jsx
if (!token) {
  return <Navigate to="/login" replace />;
}
return <Outlet />;
```

**Responsabilidad:** Autorización de rutas.

#### AppLayout.jsx
**Layout envolvente.** Proporciona sidebar de navegación y estructura visual para todas las páginas protegidas. Usa `<Outlet>` para renderizar la página actual.

**Responsabilidad:** Estructura y navegación.

#### Atoms/
Componentes base reutilizables sin lógica de negocio.

- **Button.jsx:** Botón genérico con estilos Tailwind personalizables
- **TextField.jsx:** Input de texto controlado con label e ícono opcional
- **Alerts.jsx:** Sistema de alertas

**Reglas:**
- SIEMPRE aceptar props para personalizar estilos y comportamiento
- NUNCA contienen lógica de negocio
- NUNCA llaman a servicios

#### Molecules/
Combinaciones de Atoms que forman unidades más complejas.

- **EmployeeRow.jsx, EmployeeTable.jsx:** Tabla de empleados
- **Pagination.jsx:** Control de paginación
- **DocumentCard.jsx:** Tarjeta de documento

**Responsabilidad:** Componer Atoms en estructuras reutilizables.

#### Organism/
Componentes complejos que integran Molecules y lógica de negocio.

- **Forms.jsx:** Formulario genérico
- **ModalShell.jsx:** Modal reutilizable
- **ChangePasswordModal.jsx:** Modal para cambio de contraseña
- **DocumentsSection.jsx:** Sección de documentos

**Responsabilidad:** Orquestar componentes y lógica de formularios.

---

### Services/

**Responsabilidad única: gestionar llamadas HTTP a la API.**

Los servicios se comunican con el backend y transforman las respuestas en datos útiles. Utilizan validación con Zod antes de enviar datos.

#### AuthService.jsx
Gestiona autenticación y persistencia de sesión.

```jsx
const loginService = async (email, password) => {
  // Valida, hace fetch, guarda token en localStorage
  return data;
};

const getToken = () => localStorage.getItem("token");

const logoutService = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
```

**Métodos principales:**
- `loginService(email, password)` — Autentica al usuario
- `getToken()` — Retorna el token del usuario
- `logoutService()` — Limpia la sesión
- `getReadableErrors(err)` — Transforma errores en mensajes legibles

**Reglas:**
- SIEMPRE retornar datos o lanzar Error
- SIEMPRE guardar token y user en localStorage al login exitoso
- SIEMPRE limpiar localStorage al logout

---

### schemas/

Define validación de entrada con Zod. Se aplican en componentes antes de enviar datos al service.

```jsx
export const loginSchema = z.object({
  email: z.string().trim().min(1, "El correo es requerido"),
  password: z.string().trim().min(1, "La contraseña es requerida"),
});
```

**Responsabilidad:** Validación de cliente.

---

### hooks/

Custom hooks encapsulan lógica reutilizable de componentes.

- **useAuth.js** — Obtiene usuario actual y token
- **useToggle.jsx** — Estado booleano
- **useSearch.jsx** — Lógica de búsqueda y filtrado
- **useLogin.jsx** — Lógica del formulario de login
- **useDocuments.jsx** — Lógica de documentos

**Responsabilidad:** Reutilizar lógica de estado entre componentes.

---

### context/

#### AuthContext.jsx
Proporciona contexto global de autenticación. Almacena datos del usuario y token.

**Responsabilidad:** Estado global de autenticación.

---

### utils/

Funciones auxiliares reutilizables sin estado.

- **authStorage.js** — Persiste/recupera datos de localStorage
- **apiErrors.js** — Transforma errores de API en mensajes legibles
- **documentCard.utils.js** — Utilidades para tarjetas de documento

**Responsabilidad:** Operaciones auxiliares.

---

## Autenticación: Flujo Completo

```
1. Usuario accede a /login
2. LoginPage renderiza formulario
3. Usuario ingresa email y contraseña
4. onClick → useLogin hook valida con loginSchema (Zod)
5. Si validación falla → muestra errores
6. Si validación exitosa → llama loginService(email, password)
7. loginService hace POST /users/login
8. API retorna { token, user }
9. loginService guarda en localStorage
10. useLogin actualiza estado
11. LoginPage redirige a /app/dashboard
12. ProtectedRoute valida que token exista
13. AppLayout renderiza con sidebar
14. Dashboard se muestra
```

Al navegar a ruta protegida sin token:
- ProtectedRoute valida getToken()
- Si no existe → redirige a /login
- Si existe → permite acceso

---

## Persistencia de Datos

**localStorage:**
- `token` — JWT para autenticación
- `user` — Objeto JSON con datos del usuario

**Regla:**
- SIEMPRE usar `getToken()` de AuthService para obtener el token
- NUNCA acceder directamente a localStorage excepto en AuthService

---

## Dependencias Principales

| Dependencia | Versión | Propósito |
|-------------|---------|----------|
| **react** | 19.2.4 | Framework UI principal |
| **react-router-dom** | 7.13.1 | Enrutamiento y navegación |
| **tailwindcss** | 4.2.2 | Estilos y diseño responsivo |
| **vite** | 8.0.1 | Build tool y dev server |
| **eslint** | 9.39.4 | Linting de código |
| **prettier** | 3.8.1 | Formateador de código |
| **zod** | ~3.x | Validación de esquemas |

---

## Patrones y Convenciones

### Atomic Design
- **Atoms:** Componentes base sin lógica (Button, TextField)
- **Molecules:** Combinaciones de Atoms (EmployeeRow, Pagination)
- **Organism:** Componentes complejos con lógica (Forms, Modals)
- **Pages:** Componentes de página que usan Organisms

### Estado y Datos
- **Sin Redux/Context global:** Cada página maneja su propio estado
- **localStorage:** Persiste token y user data
- **Servicios:** Centralización de lógica HTTP

### Validación
- **Cliente:** Zod schemas en componentes antes de enviar
- **Servidor:** Validación adicional en la API

---

## Páginas Protegidas: Dashboard.jsx

Ejemplo de página protegida que solo es accesible después de autenticación.

```jsx
import React from "react";

const Dashboard = () => {
  return (
    <div>
      <h2>Red de Casas Hogar Queretaro</h2>
      <div className="flex grid">
        <div className="w-[80px] h-[80px] bg-gray-400">
          <img src="/favicon.png" />
        </div>
        {/* ... más elementos ... */}
      </div>
    </div>
  );
};

export default Dashboard;
```

---

## Flujo de Autenticación

El flujo principal de autenticación en la aplicación funciona de la siguiente manera:

1. **Usuario accede a `/login`**
   - Se renderiza el componente `LoginPage`

2. **Usuario ingresa credenciales**
   - Email y contraseña

3. **Validación cliente (Zod)**
   - Valida con `loginSchema` antes de enviar

4. **Llamada a `loginService()`**
   - Envía POST a `http://localhost:3000/users/login`
   - Incluye email y password en el body

5. **API retorna respuesta**
   - Si es exitosa: `{ data: { token, user } }`
   - Si falla: Retorna error con código y mensaje

6. **`saveLoginSession()` guarda datos**
   - Token en `localStorage` bajo la clave `token`
   - User en `localStorage` bajo la clave `user` (JSON stringificado)

7. **Redirección a `/app/dashboard`**
   - Usuario es redirigido a la página protegida

8. **En siguiente acceso a ruta protegida**
   - `ProtectedRoute` valida que exista token
   - Si existe: Renderiza el contenido
   - Si no existe: Redirige a `/login`

---

## Dependencias Principales

```json
{
  "react": "19.2.4",
  "react-router-dom": "7.13.1",
  "tailwindcss": "4.2.2",
  "vite": "8.0.1",
  "eslint": "9.39.4",
  "prettier": "3.8.1"
}
```

| Dependencia | Versión | Propósito |
|-------------|---------|----------|
| **react** | 19.2.4 | Framework UI principal |
| **react-router-dom** | 7.13.1 | Enrutamiento y navegación |
| **tailwindcss** | 4.2.2 | Estilos y diseño responsivo |
| **vite** | 8.0.1 | Build tool y dev server |
| **eslint** | 9.39.4 | Linting de código |
| **prettier** | 3.8.1 | Formateador de código |

---

## Patrones y Convenciones

### Estructura de Componentes

- **Atoms:** Componentes base reutilizables (Button, TextField, etc.)
- **Molecules:** Componentes que combinan Atoms
- **Organism:** Componentes complejos que combinan Molecules
- **Pages:** Componentes de página con lógica

### Estado

- **Sin Redux/Context API global:** Todos los componentes usan `useState`
- **Persistencia:** localStorage para tokens y user data
- **Servicios:** Lógica HTTP centralizada en carpeta `Services/`

### Autenticación

- **Token-based:** Almacenado en localStorage
- **Guards:** ProtectedRoute HOC previene acceso no autorizado
- **Logout:** Limpia completamente localStorage

---
