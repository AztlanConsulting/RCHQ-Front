# Seguridad en el frontend (guía general)

Documento de referencia para decidir cómo gestionar sesiones y credenciales en una aplicación web moderna (p. ej. SPA con React), **antes** de fijar la implementación concreta.

---

## 1. Qué puede y qué no puede hacer solo el navegador

El código que corre en el cliente **puede ocultar pantallas** y **adjuntar tokens** a las peticiones. **No puede** sustituir la validación en el servidor: cualquiera puede inspeccionar la red, copiar tokens o llamar a la API directamente.

**Buena práctica:** el backend valida JWT, permisos y datos sensibles en **cada** operación importante. El frontend solo mejora la experiencia y reduce errores evidentes.

---

## 2. Dónde guardar el token de sesión (opciones)

### Almacenamiento en el cliente (`localStorage` / `sessionStorage`)

- **Ventajas:** Muy sencillo de usar con `fetch` o librerías HTTP; sobrevive a recargas (`localStorage`) o solo a la pestaña (`sessionStorage`).
- **Riesgos:** Cualquier script malicioso inyectado (XSS) puede **leer** esos valores. No son adecuados como única defensa para datos ultra sensibles.
- **Uso habitual:** SPAs que envían `Authorization: Bearer <token>` en cabeceras.

### Cookies HTTP-only (y preferiblemente `Secure`, `SameSite`)

- **Ventajas:** El JavaScript **no** puede leer la cookie (atributo `HttpOnly`), lo que **reduce** el robo del token por XSS frente a `localStorage`.
- **Consideraciones:** Hay que diseñar **CSRF** (p. ej. `SameSite=Lax/Strict`, tokens anti-CSRF, o APIs que solo acepten cabeceras no automáticas en CORS). El **servidor** debe emitir y limpiar la cookie en login/logout.
- **Buena práctica:** Para muchos equipos, cookies **httpOnly + Secure + SameSite** son el estándar cuando se prioriza mitigar robo de token por XSS.

### Solo memoria (variables en JS, `sessionStorage` efímero)

- **Ventajas:** No persiste al cerrar pestaña o a veces al recargar (según diseño).
- **Inconvenientes:** Peor UX salvo que se combine con **refresh tokens** o re-login silencioso.

### Comparación rápida

| Enfoque              | Resistencia típica a XSS | Complejidad | CSRF |
|----------------------|---------------------------|-------------|------|
| `localStorage`       | Baja (token legible por JS) | Baja        | No aplica al mismo token en cabecera |
| Cookie `HttpOnly`    | Mejor para el token       | Media       | Hay que tratarla |
| Memoria              | No persiste en disco      | Media       | Depende del diseño |

---

## 3. Comunicación con el API

### HTTPS

**Buena práctica obligatoria en producción:** cifrar tráfico; sin HTTPS, tokens y contraseñas viajan en claro.

### CORS

Lo controla el **servidor** (orígenes permitidos, credenciales si usas cookies). Un mal CORS no “arregla” la seguridad; solo define qué orígenes del navegador pueden invocar.

### Cabecera `Authorization`

Patrón habitual con JWT: `Bearer <token>`. El cliente debe enviarla en rutas protegidas; el servidor valida firma y caducidad.

---

## 4. Caducidad y revocación del token

Los JWT **caducan** según el claim `exp`, pero **el texto sigue en el cliente** hasta que la app lo borre.

**Buenas prácticas:**

- **Access tokens** de vida corta (minutos u horas).
- **Refresh tokens** (rotación, almacenamiento más restringido) para renovar sesión sin pedir contraseña constantemente.
- **Revocación** en servidor (lista negra, cambio de clave de firma) para cerrar sesiones o cuentas comprometidas; el cliente solo puede reaccionar a **401** o a un endpoint de “estado de sesión”.

---

## 5. Protección de rutas en la SPA

Patrón habitual: componente **“ruta protegida”** que redirige al login si no hay sesión.

**Límite:** comprobar “hay token” no es lo mismo que “token válido y no caducado”. Para mejor UX se puede:

- Decodificar `exp` en el cliente (solo para UX; la firma sigue validándose en el servidor).
- Ante **401** en cualquier petición, limpiar sesión y enviar al login.

No hace falta validar con el servidor en **cada** cambio de ruta interna si la API ya devuelve 401 cuando el token es inválido.

---

## 6. XSS y dependencias

**Buena práctica:** reducir superficie de XSS (evitar HTML arbitrario sin sanitizar, cuidado con `dangerouslySetInnerHTML`, mantener dependencias actualizadas).

Herramientas útiles en el ecosistema:

- **Content-Security-Policy (CSP)** en el servidor o cabeceras HTTP.
- **Auditorías:** `npm audit`, Dependabot, Snyk (integración CI/CD).

---

## 7. Herramientas y librerías (referencias)

| Ámbito | Ejemplos (no exhaustivo) |
|--------|---------------------------|
| Cliente HTTP | `fetch` nativo, **axios** (interceptores), **ky**, **ofetch** |
| Decodificación JWT (solo payload) | **jwt-decode** (no sustituye verificación en servidor) |
| Auth “llave en mano” | **Auth0**, **Clerk**, **Firebase Auth**, **Keycloak** (según necesidad) |
| Cookies + SPA | Diseño backend + CORS/credenciales; a veces **BFF** (Backend for Frontend) para no exponer tokens al JS |

---

## 8. Resumen de buenas prácticas

1. **Servidor** como autoridad: validar JWT y permisos en cada operación sensible.
2. **HTTPS** en producción.
3. Preferir **cookies HttpOnly** frente a **localStorage** para el token si el equipo puede asumir CSRF/CORS y cambios en backend; si no, **localStorage + mitigación XSS** es un compromiso habitual en SPAs.
4. **Tokens cortos** + refresh donde aplique; manejar **401** de forma centralizada en el cliente.
5. **No** confiar solo en la UI para “ocultar” datos: la API debe negar lo no autorizado.

Este documento es **general**; la implementación concreta (archivos, nombres de rutas) puede variar según el proyecto.
