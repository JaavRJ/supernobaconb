# Tareas — sitio de artista Supernoba

> Tablero de trabajo del plan [PLAN-SITIO-ARTISTA.md](PLAN-SITIO-ARTISTA.md).
> La fase en curso tiene sus tareas definidas a detalle; las fases siguientes se detallan al empezar cada una.

## Cómo se trabaja

| Rol | Modelo | Responsabilidad |
|---|---|---|
| Orquestador | Opus | Define y asigna tareas, diseña las piezas base, verifica, hace commits y **es el único que edita este archivo** |
| Worker | Sonnet | Implementa una tarea a la vez, solo dentro de los archivos indicados |
| Reviewer | Sonnet | Revisa el diff de la tarea contra su criterio de terminado y reporta hallazgos |

Los agentes están definidos en [`.claude/agents/worker.md`](../.claude/agents/worker.md) y [`.claude/agents/reviewer.md`](../.claude/agents/reviewer.md).

**Ciclo de cada tarea:** orquestador escribe la instrucción → worker implementa → reviewer revisa → (máximo 2 rondas de correcciones) → orquestador verifica y hace commit.

**Estados**

| Estado | Significado |
|---|---|
| ⬜ Pendiente | Aún no empieza |
| 🔨 En curso | El worker está implementando |
| 👀 En revisión | El reviewer está revisando |
| 🔁 Correcciones | Volvió al worker con hallazgos |
| ✅ Hecha | Verificada y con commit |
| ⛔ Bloqueada | Espera algo (dato, decisión, otra tarea) |

**Decisiones técnicas de la fase 1**
- El nuevo sitio vive en la carpeta `web/` en la rama `artista`. El sitio actual (raíz del repo) sigue funcionando hasta el cambio.
- Next.js 16.4 (App Router) + TypeScript, con CSS Modules y variables CSS para los temas.
- Cache Components y Partial Prefetching activados (vienen de la plantilla): los datos dinámicos en componentes de servidor necesitan `<Suspense>` o `"use cache"`.
- `web/next.config.ts` fija `web/` como raíz, porque la raíz del repo tiene el `package-lock.json` del sitio viejo.
- En la fase 1 los datos (obras, eras, hilos, señales) son archivos locales en `web/src/content/`; pasan a Firestore en la fase 5.

---

## Resumen

| Fase | Estado | Progreso |
|---|---|---|
| 1 — Base | 🔨 En curso | 3 / 13 |
| 2 — Libro | ⬜ Pendiente | se detalla al empezar |
| 3 — Música | ⬜ Pendiente | se detalla al empezar |
| 4 — Jabi, videos, tienda y sobre mí | ⬜ Pendiente | se detalla al empezar |
| 5 — Admin ampliado | ⬜ Pendiente | se detalla al empezar |
| 6 — Publicación | ⬜ Pendiente | se detalla al empezar |

---

## Fase 1 — Base

| ID | Tarea | Quién | Depende de | Estado |
|---|---|---|---|---|
| F1-01 | Rama `artista` y proyecto Next.js en `web/` | Worker | — | ✅ |
| F1-02 | Conexión con Firebase | Worker | F1-01 | ✅ |
| F1-03 | Tipos y datos iniciales | Worker | F1-01 | ✅ |
| F1-04 | Sistema de temas por era | Orquestador diseña, worker implementa | F1-01 | ⬜ |
| F1-05 | Layout raíz, menú y pie de página | Worker | F1-04 | ⬜ |
| F1-06 | Páginas provisionales de cada ruta | Worker | F1-05 | ⬜ |
| F1-07 | Bloque "Lo último" en la portada | Worker | F1-03, F1-05 | ⬜ |
| F1-08 | Cielo: dibujo de constelaciones y estrellas | Worker | F1-03, F1-04 | ⬜ |
| F1-09 | Cielo: interacción e hilos | Worker | F1-08 | ⬜ |
| F1-10 | Cielo: vista por era, línea de tiempo y nebulosas | Worker | F1-09 | ⬜ |
| F1-11 | Cielo: versión para celular y lista accesible | Worker | F1-10 | ⬜ |
| F1-12 | Reproductor persistente (versión inicial) | Worker | F1-03, F1-05 | ⬜ |
| F1-13 | Verificación final de la fase | Orquestador | todas | ⬜ |

### F1-01 — Rama `artista` y proyecto Next.js en `web/`
- **Objetivo:** crear la base del nuevo sitio sin tocar el sitio actual.
- **Archivos:** `web/` (nuevo), `.gitignore` de la raíz si hace falta.
- **Terminado cuando:**
  - Existe la rama `artista`.
  - `web/` tiene Next.js con App Router, TypeScript, ESLint y carpeta `src/`.
  - `npm run dev`, `npm run build` y `npm run lint` funcionan dentro de `web/`.
  - Nada fuera de `web/` cambió (salvo `.gitignore`).

### F1-02 — Conexión con Firebase
- **Objetivo:** reutilizar el proyecto de Firebase actual desde Next.js.
- **Archivos:** `web/src/lib/firebase.ts`, `web/.env.example`.
- **Terminado cuando:**
  - La configuración se lee de variables `NEXT_PUBLIC_FIREBASE_*`.
  - `web/.env.example` lista las variables sin valores reales.
  - Firebase se inicializa una sola vez y solo en el navegador cuando haga falta.
  - El build no falla si faltan las variables.

### F1-03 — Tipos y datos iniciales
- **Objetivo:** el modelo de datos del plan, con el contenido real que ya tenemos.
- **Archivos:** `web/src/types/`, `web/src/content/`.
- **Terminado cuando:**
  - Hay tipos para `Constellation`, `Work`, `Era`, `Thread`, `Signal` y `Track` según la sección 5 del plan.
  - Los datos incluyen: las tres constelaciones; las obras BDUEM, Rulos, nohablobien / part3, puzzles y este sitio; la era BDUEM (en órbita) y la era 2 (nebulosa); los hilos iniciales; las canciones con duraciones y links; una señal de ejemplo.
  - Hay funciones de consulta: obras por constelación, obras por era, hilos de una obra, era actual, lo último publicado.

### F1-04 — Sistema de temas por era
- **Objetivo:** que todo el sitio cambie de estética según la era.
- **Archivos:** `web/src/styles/tokens.css`, `web/src/components/theme/`.
- **Terminado cuando:**
  - Hay tokens base (tema "cielo") para colores, tipografía, espaciado y radios.
  - Un componente `EraTheme` aplica las variables de una era a su contenido.
  - Existe el tema de la era BDUEM.
  - El cambio de tema tiene transición suave y respeta `prefers-reduced-motion`.
- **Diseño (orquestador):**
  - **Tipo:** `EraThemeTokens` en `web/src/types/theme.ts` (ya existe). Cada campo, salvo `backdrop`, se mapea a una variable CSS con `ERA_THEME_VARS`: `--era-bg`, `--era-bg-elevated`, `--era-fg`, `--era-fg-muted`, `--era-accent`, `--era-accent-contrast`, `--era-line`, `--era-glow`, `--era-font-display`, `--era-font-body`.
  - **`web/src/styles/tokens.css`** (importado una vez desde `globals.css`):
    - En `:root`, el tema base **cielo** como valores por defecto de las `--era-*`: bg `#07080d`, bg-elevated `#11131b`, fg `#e9e9ef`, fg-muted `#8b8d99`, accent `#a9b4ff`, accent-contrast `#07080d`, line `rgba(233,233,239,0.14)`, glow `rgba(169,180,255,0.35)`, font-display y font-body `var(--font-inter), system-ui, sans-serif`.
    - Escalas fijas que no cambian por era: `--space-1…8` (4, 8, 12, 16, 24, 32, 48, 64 px), `--radius-sm/md/lg/full` (4, 8, 16, 9999 px), `--text-xs…3xl` con `clamp()` fluido, `--ease-out`, `--duration-theme: 600ms`.
    - `body` usa `background: var(--era-bg)`, `color: var(--era-fg)` y `font-family: var(--era-font-body)`. Los títulos `h1–h3` usan `var(--era-font-display)`.
    - Con `@media (prefers-reduced-motion: reduce)`, `--duration-theme: 0ms`.
  - **`web/src/lib/theme.ts`:** `eraThemeStyle(tokens): React.CSSProperties`, que convierte los tokens en un objeto `{ "--era-bg": … }`.
  - **`web/src/components/theme/EraTheme.tsx`:** componente de servidor `<EraTheme era={era} as?="div" className?>`.
    - Renderiza el contenedor con `data-era={era.id}`, `data-backdrop={tokens.backdrop}` y el `style` de `eraThemeStyle`.
    - Pinta su propio `background` y `color`, y hace transición de `background-color` y `color` con `--duration-theme`.
    - Si `era` es `null`, no aplica variables y hereda el cielo.
  - **`web/src/components/theme/Backdrop.tsx`** (+ `.module.css`): fondo decorativo según `data-backdrop`.
    - `stars`: campo de estrellas con CSS puro (gradientes radiales repetidos), sin JS.
    - `grain`: ruido sutil con un SVG inline como `background-image`.
    - `none`: nada.
    - Va en `position: fixed` detrás del contenido, con `pointer-events: none` y `aria-hidden`.
  - **Fuentes:** las variables `--font-inter`, `--font-cinzel` y `--font-crimson` las define F1-05 con `next/font`. En F1-04 los tokens ya las referencian con fallback (`system-ui`, `serif`, `Georgia`).
  - **Prueba:** página temporal `web/src/app/temas/page.tsx` que muestra el cielo y debajo cada era de `content/eras.ts` envuelta en `<EraTheme>`, con un título, un párrafo, un botón con acento y una línea. Se borra en F1-13.

### F1-05 — Layout raíz, menú y pie de página
- **Archivos:** `web/src/app/layout.tsx`, `web/src/components/layout/`.
- **Terminado cuando:**
  - Menú con: Inicio, Música, Libros, Proyectos, Videos, Tienda, Sobre mí.
  - Menú usable en celular.
  - Pie de página con links a Spotify, Apple Music y YouTube.
  - Metadatos base (título, descripción, idioma `es`).
  - Hay un espacio reservado para el reproductor persistente.

### F1-06 — Páginas provisionales de cada ruta
- **Objetivo:** que ningún link del menú dé error 404.
- **Archivos:** `web/src/app/**/page.tsx`.
- **Terminado cuando:** existen `/musica`, `/libros`, `/libros/bduem`, `/proyectos`, `/eras/[slug]`, `/videos`, `/tienda` y `/sobre-mi` con un título y texto de "próximamente".

### F1-07 — Bloque "Lo último" en la portada
- **Archivos:** `web/src/components/home/Latest*`.
- **Terminado cuando:**
  - Muestra la obra publicada más reciente (hoy: nohablobien / part3) con portada, nombre y botones a plataformas.
  - Queda visible arriba del cielo sin tener que hacer scroll en celular.

### F1-08 — Cielo: dibujo de constelaciones y estrellas
- **Archivos:** `web/src/components/sky/`.
- **Terminado cuando:**
  - Las tres constelaciones se dibujan a partir de los datos, con líneas en orden cronológico.
  - El brillo de cada estrella depende de su fecha.
  - Las obras por publicar se ven apagadas.
  - Funciona sin datos de posición manual (posición automática por constelación) y acepta posición manual si existe.

### F1-09 — Cielo: interacción e hilos
- **Terminado cuando:**
  - Al pasar el cursor: nombre y portada. Al hacer clic: navega a la obra.
  - Las estrellas se recorren con el teclado.
  - Los hilos se dibujan entre constelaciones, con un estilo distinto por tipo (`guiño` más tenue).

### F1-10 — Cielo: vista por era, línea de tiempo y nebulosas
- **Terminado cuando:**
  - Elegir una era enciende su libro y sus obras en órbita, y atenúa el resto.
  - La línea de tiempo muestra las eras como franjas que pueden encimarse.
  - La era 2 se ve como nebulosa; al hacer clic muestra su señal como una "transmisión interceptada".

### F1-11 — Cielo: versión para celular y lista accesible
- **Terminado cuando:**
  - En pantallas angostas el cielo se recorre con un carrusel deslizable o una lista.
  - Existe una lista de texto equivalente al cielo para lectores de pantalla.
  - Sin scroll horizontal de página a 375 px.

### F1-12 — Reproductor persistente (versión inicial)
- **Archivos:** `web/src/components/player/`.
- **Terminado cuando:**
  - La música sigue sonando al cambiar de página.
  - Mini reproductor fijo abajo con play/pausa, siguiente, anterior, progreso y volumen.
  - Hay una cola de reproducción.
  - Toma los colores de la era de la canción.
  - Funciona con un audio de prueba (los audios reales llegan después).

### F1-13 — Verificación final de la fase
- **Terminado cuando:**
  - `build` y `lint` pasan sin errores.
  - Revisión en el navegador en escritorio y en celular (375 px).
  - Navegar entre páginas no corta el reproductor.
  - El plan y este tablero están actualizados.

---

## Fases siguientes (se detallan al empezar)

### Fase 2 — Libro
Migrar el lector, resaltados, citas, marcadores y notas del autor · página de la era BDUEM · publicación escalonada y redirecciones de `/parteN` · puzzles.

### Fase 3 — Música
Discografía · página de sencillo/disco con embeds y reproductor · letras y créditos.

### Fase 4 — Jabi, videos, tienda y sobre mí
Proyectos de software · páginas de era y "Conectado con" · videos y fotos · tienda con links · biografía y kit de prensa.

### Fase 5 — Admin ampliado
Obras, eras, hilos, señales y posiciones en el cielo · canciones y audios · videos y productos · newsletter con intereses · migrar los datos locales a Firestore.

### Fase 6 — Publicación
Vistas previas al compartir y ajustes para Google · rendimiento y accesibilidad · reglas de Firestore y Storage · despliegue en Firebase App Hosting.

---

## Registro

| Fecha | Tarea | Qué pasó |
|---|---|---|
| 2026-10-25 | — | Tablero creado |
| 2026-10-25 | — | Agentes worker y reviewer creados en `.claude/agents/` |
| 2026-10-25 | F1-01 | Worker creó Next.js 16.4.3 en `web/`. Reviewer pidió fijar la raíz del workspace (media); lo corrigió el orquestador en `next.config.ts`. Lint y build pasan. ✅ |
| 2026-10-25 | F1-02 | Worker conectó Firebase (`firebase` 13.1, `web/src/lib/firebase.ts`, `.env.example`). Reviewer: aprobada. ✅ |
| 2026-10-25 | F1-03 | Reviewer pidió correcciones: quitar la obra del libro 2 (una nebulosa no revela obras), `getLatestRelease` con fecha explícita y zona horaria de México, `hidden` en `getWorksByEra`. 🔁 |
| 2026-10-25 | F1-03 | Correcciones aplicadas y verificadas por el orquestador (tsc, lint, build). Pendiente confirmar con el artista la fecha exacta de Rulos (hoy aproximada: 2026-03-01). ✅ |
