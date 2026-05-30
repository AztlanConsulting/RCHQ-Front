# RCHQ-Front

Frontend de Tochan/RCHQ. Esta aplicación implementa la interfaz de usuario para autenticación, gestión de personal, calendario, vacaciones, documentos y consumo de la API REST del backend.

## Tecnologías

| Tecnología     | Versión usada en el proyecto | Uso                                              |
| -------------- | ---------------------------- | ------------------------------------------------ |
| Node.js        | 20.19                        | Entorno para ejecutar herramientas del frontend. |
| React          | 19.2.4                       | Construcción de la interfaz de usuario.          |
| Vite           | 8.0.11                       | Servidor de desarrollo y empaquetado.            |
| Vitest         | 4.1.4                        | Pruebas unitarias e integración.                 |
| Zod            | 4.3.6                        | Validación de esquemas.                          |
| Tailwind CSS   | 4.3.0                        | Estilos de la aplicación.                        |
| Flowbite React | 0.12.17                      | Componentes de interfaz.                         |

## Requisitos previos

Antes de instalar el proyecto, asegúrate de contar con:

- Git.
- Node.js 20.19 o compatible.
- npm.
- Backend `RCHQ-Back` configurado y en ejecución para consumir la API.
- Editor recomendado: Visua Studio Code.

## Estructura del proyecto

```text
/RCHQ-Front
├── .github/
├── dist/
├── docs/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   └── organism/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   │   ├── auth/
│   │   ├── personal/
│   │   └── landing.jsx
│   ├── services/
│   ├── tests/
│   │   ├── integration/
│   │   └── unit/
│   ├── utils/
│   │   ├── auth/
│   │   ├── password/
│   │   ├── schema/
│   │   └── secureFetchWrapper.js
│   ├── app.jsx
│   └── main.jsx
├── .env.example
├── eslint.config.js
├── index.html
├── package.json
├── vite.config.js
└── vitest.config.js
```

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/AztlanConsulting/RCHQ-Front.git
cd RCHQ-Front
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y renómbralo como `.env`:

```bash
cp .env.example .env
```

Configura la URL del backend:

| Variable       | Descripción                     | Ejemplo                 |
| -------------- | ------------------------------- | ----------------------- |
| `VITE_API_URL` | URL base de la API del backend. | `http://localhost:3000` |

Ejemplo de `.env`:

```env
VITE_API_URL=http://localhost:3000
```

> Nota: las variables expuestas al navegador por Vite deben iniciar con `VITE_`.

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Por defecto, Vite mostrará la URL local disponible, normalmente `http://localhost:5173`.

## Scripts disponibles

| Comando                    | Descripción                                                |
| -------------------------- | ---------------------------------------------------------- |
| `npm run dev`              | Levanta el servidor de desarrollo.                         |
| `npm run build`            | Genera la versión de producción en `dist/`.                |
| `npm run preview`          | Sirve localmente el build de producción.                   |
| `npm test`                 | Ejecuta Vitest en modo interactivo.                        |
| `npm run test:unit`        | Ejecuta pruebas unitarias en `src/tests/unit`.             |
| `npm run test:integration` | Ejecuta pruebas de integración en `src/tests/integration`. |
| `npm run test:coverage`    | Ejecuta pruebas con reporte de cobertura.                  |
| `npm run lint`             | Revisa el código con ESLint.                               |
| `npm run lint:fix`         | Corrige problemas de ESLint cuando sea posible.            |
| `npm run format`           | Formatea el proyecto con Prettier.                         |
| `npm run format:check`     | Valida el formato sin modificar archivos.                  |

## Pruebas

El frontend utiliza Vitest para pruebas unitarias e integración.

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas unitarias
npm run test:unit

# Ejecutar pruebas de integración
npm run test:integration
```

## Build de producción

Para generar los archivos estáticos de producción:

```bash
npm run build
```

Para revisar el resultado localmente:

```bash
npm run preview
```

## Documentación adicional

La carpeta `docs/` contiene guías complementarias del frontend:

- `docs/FrontendDocumentation.md`
- `docs/TestGuide.md`
- `docs/frontend-security.md`
- `docs/guia-prettier-y-eslint.md`
