# Untitled UI en el proyecto

## Mezcla de JS y TS en Vite

El proyecto usa JavaScript (`.js`/`.jsx`) como lenguaje principal, pero los componentes de Untitled UI se instalan como TypeScript (`.ts`/`.tsx`). Esto **no es un problema** porque:

- Vite no usa el compilador de TypeScript (`tsc`) para construir la app. En su lugar usa **esbuild**, que simplemente elimina las anotaciones de tipos de los archivos `.ts`/`.tsx` y los convierte a JavaScript normal.
- El `tsconfig.json` con `"noEmit": true` confirma esto: TypeScript solo actúa como herramienta del editor (para autocompletado y detección de errores), no participa en el build.
- En **tiempo de ejecución**, el navegador nunca ve archivos `.ts`. Todo ya es JavaScript.
- En **tiempo de build**, Vite maneja `.js`, `.jsx`, `.ts` y `.tsx` de forma nativa y transparente.

En resumen: coexistir con archivos `.tsx` de Untitled no tiene consecuencias negativas ni en desarrollo, ni en producción.

---

## Cómo importar componentes de Untitled

Los componentes de Untitled se instalan dentro de `src/Components/untitled/` y pueden importarse directamente desde ahí, como cualquier otro archivo `.jsx`, aunque sean `.tsx`. Vite los procesa igual.

Hay dos patrones en el proyecto:

### 1. A través de un componente propio (recomendado para reutilizar)

Se crea un componente "envoltorio" en `src/Components/Atoms/` que importa desde Untitled internamente. Esto permite centralizar configuración y no depender directamente del path de la librería en cada página.

```jsx
// src/Components/Atoms/Loader.jsx
import { LoadingIndicator } from "../untitled/loading-indicator/loading-indicator";

const Loader = ({ size = "md" }) => {
  return <LoadingIndicator type="dot-circle" size={size} />;
};

export default Loader;
```

### 2. Importando directamente desde la carpeta untitled

También se puede importar un componente de Untitled directo en una página, sin crear un envoltorio.

### Ejemplo real: `DetalleEmpleado.jsx`

Esta página usa **ambos** patrones al mismo tiempo:

```jsx
// src/Pages/DetalleEmpleado.jsx

// Patrón 1: importa desde nuestro propio Atom, que internamente usa Untitled
import Loader from "../Components/Atoms/Loader";

// Patrón 2: importa directamente desde la carpeta untitled (archivos .tsx)
import { Tabs } from "../Components/untitled/tabs/tabs";
import { NativeSelect } from "../Components/untitled/base/select/select-native";
```

Ambas importaciones funcionan sin problemas aunque `tabs.tsx` y `select-native.tsx` sean TypeScript. Vite los convierte a JavaScript automáticamente durante el build.

---

## Cómo agregar nuevos componentes de Untitled

La librería tiene una CLI oficial. El comando para agregar componentes es:

```bash
npx untitledui@latest add <nombre-del-componente>
```

Por ejemplo, para agregar un botón y un avatar:

```bash
npx untitledui@latest add button avatar
```

Si se corre sin especificar componentes, entra en modo interactivo y deja explorar los disponibles por categoría:

```bash
npx untitledui@latest add
```

Los componentes se instalan en la carpeta configurada del proyecto (en este caso `src/Components/untitled/`), junto con cualquier archivo de dependencia que necesiten.

Para componentes PRO es necesario autenticarse primero:

```bash
npx untitledui@latest login
```

> Documentación oficial: https://www.untitledui.com/react/docs/cli
