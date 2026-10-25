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
| 1 — Base | 🔨 En curso | 13 / 14 |
| 2 — Libro | ⬜ Pendiente | se detalla al empezar |
| 3 — Música | ⬜ Pendiente | se detalla al empezar |
| 4 — Jabi, videos, tienda y sobre mí | ⬜ Pendiente | se detalla al empezar |
| Pase de diseño con materiales reales | ⬜ Pendiente | se adelanta si llegan antes los materiales |
| 5 — Admin ampliado | ⬜ Pendiente | se detalla al empezar |
| 6 — Publicación | ⬜ Pendiente | se detalla al empezar |

---

## Fase 1 — Base

| ID | Tarea | Quién | Depende de | Estado |
|---|---|---|---|---|
| F1-01 | Rama `artista` y proyecto Next.js en `web/` | Worker | — | ✅ |
| F1-02 | Conexión con Firebase | Worker | F1-01 | ✅ |
| F1-03 | Tipos y datos iniciales | Worker | F1-01 | ✅ |
| F1-04 | Sistema de temas por era | Orquestador diseña, worker implementa | F1-01 | ✅ |
| F1-05 | Layout raíz, menú y pie de página | Worker | F1-04 | ✅ |
| F1-06 | Páginas provisionales de cada ruta | Worker | F1-05 | ✅ |
| F1-07 | Bloque "Lo último" en la portada | Worker | F1-03, F1-05 | ✅ |
| F1-08 | Cielo: dibujo de constelaciones y estrellas | Worker | F1-03, F1-04 | ✅ |
| F1-09 | Cielo: interacción e hilos | Worker | F1-08 | ✅ |
| F1-10 | Cielo: vista por era, línea de tiempo y nebulosas | Worker | F1-09 | ✅ |
| F1-11 | Cielo: versión para celular y lista accesible | Worker | F1-10 | ✅ |
| F1-12 | Reproductor persistente (versión inicial) | Worker | F1-03, F1-05 | ✅ |
| F1-13 | Verificación final de la fase | Orquestador | todas | ✅ |
| F1-14 | Recorrido de diseño con el artista | Orquestador + artista | F1-13 | 🔨 |

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
  - **Prueba:** página temporal `web/src/app/temas/page.tsx` que muestra el cielo y debajo cada era de `content/eras.ts` envuelta en `<EraTheme>`, con un título, un párrafo, un botón con acento y una línea. Se borra al final de F1-14.

### F1-05 — Layout raíz, menú y pie de página
- **Archivos:** `web/src/app/layout.tsx`, `web/src/components/layout/`.
- **Terminado cuando:**
  - Menú con: Inicio, Música, Libros, Proyectos, Videos, Tienda, Sobre mí.
  - Menú usable en celular.
  - Pie de página con links a Spotify, Apple Music y YouTube.
  - Metadatos base (título, descripción, idioma `es`).
  - Hay un espacio reservado para el reproductor persistente.
  - Las fuentes Inter, Cinzel Decorative y Crimson Pro se cargan con `next/font` y definen `--font-inter`, `--font-cinzel` y `--font-crimson`.
- **Notas de F1-04:** el `body` siempre usa el color del cielo, así que el rebote de scroll de una página dentro de `EraTheme` lo muestra; hay que resolverlo aquí. La transición de tema solo se ve si el mismo contenedor cambia de era sin volver a montarse.

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

- **Notas de la revisión de F1-08:** el `<svg>` tiene `role="img"`, que oculta a los lectores de pantalla los hijos interactivos; al volver las estrellas enlaces o botones, cambiarlo a `role="group"` (o similar). Los ids `sky-title`, `sky-desc` y `sky-halo-*` son fijos: usar un prefijo si hay más de un cielo por página.

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
- **Notas de la revisión de F1-08:** a 375 px el SVG escala a 0.34, así que el nombre de la constelación se ve a ~10 px y la faceta a ~6 px (ilegible). Con muchas obras por constelación (30 o más) la colocación automática deja de garantizar la separación mínima, y dos obras con la misma `skyPosition` o dos núcleos en una constelación se enciman.

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

### F1-14 — Recorrido de diseño con el artista
- **Objetivo:** el diseño de la fase 1 es un primer pase funcional; aquí se define la dirección visual con el artista.
- **Cómo:** recorrer juntos el sitio en el navegador (escritorio y celular) y anotar qué funciona y qué no, en la portada, el cielo, el menú, el reproductor y los temas de cada era.
- **Terminado cuando:**
  - Hay una lista de cambios de diseño acordados, anotada en este tablero.
  - Los ajustes acordados de tipografía, espacios, colores y composición de la portada están aplicados (con el mismo ciclo worker → reviewer).
- **Cambios acordados en el recorrido (2026-10-25):**
  1. **Portada:** se mantiene el orden ("Lo último" primero, el cielo después), pero con un encabezado con más presencia y "Lo último" más grande y equilibrado.
  2. **Cielo:** quitar el marco; el cielo va de borde a borde.
  3. **Eras:** que el cambio se note más: cielo base más azul noche y BDUEM más cálida y dorada.
  4. **Tipografía de la marca:** el artista descartó las cuatro opciones propuestas (Syne, Unbounded, Michroma, Instrument Serif) por no tener identidad, y eligió la de su mockup: **Cinzel Decorative** (nombre y títulos destacados), **Crimson Pro** (texto) e **Inter** (interfaz).
  5. ~~**Portada como el mockup del artista** (eclipse, verde-negro).~~ Descartado: el artista pidió partir de su identidad visual (ver abajo).
  6. **Identidad visual (decisión final):** el orquestador estudió el sitio original y escribió [IDENTIDAD-VISUAL.md](IDENTIDAD-VISUAL.md). El artista aprobó el mockup de `web/public/mockup/` (`portada.html` y `bduem.html`): **portada radiante** (espacio profundo azul-negro, polvo de estrellas, nebulosas fotográficas, un único resplandor cálido) y **era BDUEM en monocromo** como el sitio original. La estrella-brújula reemplaza la "O" en SUPERN✦BA y en el título de BDUEM. Scroll horizontal en eras y libro. Se implementa en las tareas ID-01 a ID-06.
  - Al terminar, se borran las páginas de prueba `/temas` y `/reproductor-prueba`, el audio `web/public/audio/prueba.wav` y la carpeta `web/public/mockup/`.

### Identidad visual (parte de F1-14)

Referencia obligatoria para todas: [IDENTIDAD-VISUAL.md](IDENTIDAD-VISUAL.md) y los mockups `web/public/mockup/portada.html` y `bduem.html` (se ven en `http://localhost:3000/mockup/…`).

| ID | Tarea | Quién | Depende de | Estado |
|---|---|---|---|---|
| ID-01 | Base: paleta radiante, fuentes, logo, marca SUPERN✦BA y fondo cósmico | Worker | — | ✅ |
| ID-02 | Portada: aviso "Nuevo" y composición del mockup | Worker | ID-01 | ✅ |
| ID-03 | Cielo radiante: núcleo con la estrella-brújula, íconos de faceta, nebulosa fotográfica, eras | Worker | ID-01 | 👀 |
| ID-04 | Era BDUEM en monocromo con scroll horizontal | Worker | ID-01 | ✅ |
| ID-05 | Reproductor y pie con la nueva estética | Worker | ID-01 | ✅ |
| ID-06 | Limpieza y verificación final | Orquestador | todas | ⬜ |

#### ID-01 — Base
- **Archivos:** `web/src/styles/tokens.css`, `web/src/app/layout.tsx`, `web/src/app/globals.css`, `web/public/brand/` (nuevo), `web/src/components/brand/` (nuevo), `web/src/components/theme/Backdrop*`, `web/src/components/layout/SiteHeader*`.
- **Terminado cuando:**
  - Tokens del cielo base con la paleta radiante de IDENTIDAD-VISUAL (fondo azul-negro en degradado, texto blanco frío, un solo acento cálido para resplandores) y contraste AA verificado.
  - Fuentes con `next/font`: Cinzel Decorative (marca), Uncial Antiqua (BDUEM), Cormorant Garamond (texto literario), Inter (interfaz); Crimson Pro y Cinzel se quitan si ya nadie las usa.
  - El logo (`public/logo512.png` de la raíz) copiado a `web/public/brand/estrella.png`.
  - Componente `StarWord` que escribe una palabra con la estrella-brújula en lugar de una "O" (se usa para SUPERN✦BA y para el título de BDUEM), accesible (el lector de pantalla lee la palabra completa).
  - El header usa SUPERN✦BA.
  - Nueva variante de fondo `cosmos` (polvo de estrellas determinista + algunas estrellas en cruz que destellan, sin `Math.random` en el render del servidor), usada por el cielo base en toda la página; `prefers-reduced-motion` respetado.

#### ID-02 — Portada
- **Archivos:** `web/src/app/page.tsx`, `page.module.css`, `web/src/components/home/*`.
- **Terminado cuando:** la portada sigue el mockup: aviso "Nuevo" centrado (etiqueta, título en Cinzel (como el mockup), era en cursiva, "Escuchar" cálido y "Ver en el cielo" que baja al cielo), luego el cielo y la línea de eras. Se borran `HomeHero`, `EclipseArt` y `LatestPlay` si ya no se usan; la lógica de fecha de "lo último" se conserva.

#### ID-03 — Cielo radiante
- **Archivos:** `web/src/components/sky/*`, colores en `web/src/content/constellations.ts`.
- **Terminado cuando:** estrellas blancas con halo; el núcleo de un libro se dibuja con la estrella-brújula y resplandor cálido; ícono fino de faceta junto a la estrella principal de cada constelación (libro, nota, `</>`); hilos blancos con trazo por tipo y `inspira` en tono cálido; nebulosa como nube fotográfica gris (`feTurbulence`); selector y línea de eras como en el mockup (puntos y píldoras). Todo lo de F1-08 a F1-11 sigue funcionando.

#### ID-04 — Era BDUEM en monocromo
- **Archivos:** `web/src/content/eras.ts` (tema de BDUEM), `web/src/types/content.ts` y `web/src/content/works.ts` (subtítulos de las partes y fotos), `web/src/components/era/*` (nuevo), `web/src/app/libros/bduem/`, `web/src/app/eras/[slug]/`, `web/next.config.ts` (imágenes de Cloudinary).
- **Terminado cuando:** el tema de BDUEM es negro puro y blanco con Uncial Antiqua y Cormorant; `/libros/bduem` (y `/eras/bduem`) es la experiencia del mockup con scroll horizontal en escritorio y vertical en celular: etiqueta vertical "SUPERNOBA", título con la estrella en la "O", índice de las cuatro partes con sus subtítulos poéticos, polaroid en blanco y negro, panel de texto y las obras de la era en polaroids con su hilo en texto. Accesible con teclado y sin atrapar el scroll vertical en lectores de pantalla.

#### ID-05 — Reproductor y pie
- **Archivos:** `web/src/components/player/*.module.css`, `web/src/components/layout/SiteFooter*`, `PlayerSlot*`.
- **Terminado cuando:** el mini reproductor es la barra flotante del mockup (cristal oscuro, bordes redondeados, progreso con el acento cálido) y el pie es mínimo como el del sitio original; sin regresiones de F1-12.

#### ID-06 — Limpieza y verificación
- Borrar páginas y archivos de prueba, verificar build, rutas, navegador en escritorio y celular, y cerrar F1-14.

---

## Fases siguientes (se detallan al empezar)

### Fase 2 — Libro
Migrar el lector, resaltados, citas, marcadores y notas del autor · página de la era BDUEM · publicación escalonada y redirecciones de `/parteN` · puzzles.

### Fase 3 — Música
Discografía · página de sencillo/disco con embeds y reproductor · letras y créditos.

### Fase 4 — Jabi, videos, tienda y sobre mí
Proyectos de software · páginas de era y "Conectado con" · videos y fotos · tienda con links · biografía y kit de prensa.

### Pase de diseño con materiales reales
Cuando lleguen portadas, fotos y la estética de cada era (se adelanta si llegan antes): reemplazar portadas generadas y textos de relleno · ajustar el tema definitivo de cada era · revisar portada, cielo y páginas de obra con imágenes reales en escritorio y celular.

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
| 2026-10-25 | — | Fecha de Rulos confirmada por el artista: 2026-03-13 (también inicio de la fase "en órbita" de BDUEM) |
| 2026-10-25 | F1-04 | Worker implementó los temas; contraste WCAG AA verificado en los tres. Reviewer pidió correcciones (fuente del cuerpo por era, contexto de apilamiento del fondo, fallbacks de fuente); `EraTheme` ahora renderiza el `Backdrop`. Orquestador revisó `/temas` en escritorio y a 375 px. ✅ |
| 2026-10-25 | F1-05 | Worker hizo layout, menú (móvil accesible), pie, fuentes con `next/font` y espacio del reproductor. Reviewer encontró que el menú móvil se reabría al volver a una ruta (media) y detalles de accesibilidad; corregidos. Orquestador verificó en el navegador: menú, Escape, foco y que el menú ya no se reabre al ir y volver. Pendiente de diseño: el header queda fuera de `EraTheme` y siempre usa el cielo. ✅ |
| 2026-10-25 | F1-06 | Worker creó las páginas provisionales; obra y era con su tema, la era 2 no revela nada. Reviewer probó en producción y encontró que la primera visita a un slug inexistente respondía 200 (media); se corrigió con `ensureStatic = "navigation"` (Cache Components no admite `dynamicParams`). Orquestador verificó con `next start`: 404 en la primera y segunda visita. ✅ |
| 2026-10-25 | F1-07 | Worker hizo "Lo último" (fecha con `"use cache"` + `cacheLife("hours")`, aprobado por el reviewer). Orquestador vio en el navegador que el fondo de estrellas se salía de su sección: `Backdrop` pasa de `fixed` a `absolute` dentro de `EraTheme`. Más detalles de accesibilidad. ✅ |
| 2026-10-25 | F1-08 | Worker dibujó el cielo (`layoutSky` pura y determinista + SVG). Reviewer: aprobada; se corrigió que el parpadeo pisaba el brillo por fecha. Notas para F1-09 y F1-11 anotadas en sus secciones. Orquestador lo revisó en el navegador. ✅ |
| 2026-10-25 | F1-12 | Worker hizo el reproductor (provider con un solo `<audio>`, mini reproductor, Media Session, audio de prueba generado). Reviewer: aprobada; ajustes de robustez (errores de carga, Media Session, volumen). Orquestador verificó en el navegador que sigue sonando al navegar y que avanza de pista. ✅ |
| 2026-10-25 | F1-09 | Worker hizo la interacción (tarjeta en hover y foco, navegación del lado del cliente, flechas) y los hilos con estilo por tipo. Reviewer pidió correcciones (flechas bloqueaban Alt+←, tarjeta fuera del cielo a 375 px, foco por ratón pegado) y detectó un aviso de navegación instantánea en las rutas dinámicas, resuelto con `instant = false` (documentado en Next 16) sin perder el 404 real. Orquestador verificó en el navegador, también a 375 px. ✅ |
| 2026-10-25 | F1-10 | Worker hizo el selector de era (el cielo toma el tema de la era con transición), la línea de tiempo con fases encimadas y la nebulosa con su señal como "transmisión interceptada". Reviewer pidió correcciones: la nebulosa no se atenuaba (también visto por el orquestador), el panel podía recortarse en celular, y la línea de tiempo revelaba la fecha de inicio de la era 2. Decisión del orquestador: una nebulosa no muestra fechas; su franja empieza difuminada. Orquestador verificó en el navegador y que el HTML no contiene datos de la era 2. ✅ |
| 2026-10-25 | — | Se agregan dos momentos de diseño: F1-14 (recorrido de diseño con el artista al cerrar la fase 1) y el "Pase de diseño con materiales reales". |
| 2026-10-25 | F1-11 | Worker hizo el cielo vertical para pantallas angostas (dos SVG, uno visible por CSS), el toque en dos pasos y la vista "Ver como lista". Reviewer detectó una regresión: el panel de señal se cerraba al tocarlo porque había dos montados; ahora tarjeta y panel solo se montan en la escena visible. También áreas de toque de 44 px y contraste de la lista. Orquestador verificó a 375 px y en escritorio. Para F1-14: los hilos cruzan las etiquetas "Jabi" y "noba" a 375 px. ✅ |
| 2026-10-25 | F1-13 | Verificación del orquestador: tipos, lint y build sin errores (todas las rutas estáticas o con prerender parcial); en modo producción las 13 rutas dan 200 y los slugs inexistentes 404 desde la primera visita; el HTML no contiene datos de la era 2; en el navegador, consola limpia tras reiniciar el servidor, el reproductor sigue sonando al navegar por el menú y desde una estrella, y sin scroll horizontal a 375 px en todas las páginas. El sitio viejo no cambió respecto a `main`. Las páginas de prueba se conservan para F1-14. ✅ |
| 2026-10-25 | F1-14 | El artista rechazó el primer pase (eclipse, verde-negro) por no usar su identidad. El orquestador estudió el sitio original, escribió IDENTIDAD-VISUAL.md y armó un mockup aprobado. Se definen las tareas ID-01 a ID-06. |
| 2026-10-25 | ID-01 | Worker hizo la base: paleta radiante, fuentes (Cinzel Decorative, Uncial Antiqua, Cormorant Garamond, Inter), `StarWord` con la estrella-brújula en la "O" (máscara de luminancia, probada en Chromium, Firefox y WebKit), header SUPERN✦BA y fondo `cosmos`. Reviewer pidió legibilidad del header al hacer scroll, logo con su formato real (JPEG) y subrayado del enlace activo; corregido y revisado en el navegador. ✅ |
| 2026-10-25 | ID-02 | Worker hizo el aviso "Nuevo" del mockup (Escuchar con Spotify o el reproductor, Ver en el cielo) y borró la portada del eclipse. Reviewer: aprobada, casi idéntica al mockup a 1440 px y sin scroll horizontal a 390 px. ✅ |
| 2026-10-25 | ID-05 | Worker hizo el reproductor flotante del mockup (altura reservada medida con ResizeObserver) y el pie mínimo con íconos. Reviewer: aprobada. Orquestador verificó en el navegador que se ve como el mockup y sigue sonando al navegar. ✅ |
| 2026-10-25 | ID-04 | Worker hizo la era BDUEM en monocromo: tema negro y blanco con Uncial y Cormorant, `HorizontalScroll` (rueda → avance horizontal sin secuestrar la página), etiqueta vertical, índice poético, polaroids en B/N y panel del sitio original. Reviewer pidió correcciones (arrastre que impedía seleccionar texto, eras sin libro, botón deshabilitado que parecía activo, accesibilidad de imágenes, Firefox). Orquestador hizo que el header y el fondo de página sean negros en páginas de era, y verificó en el navegador a 1440 y 390 px. ✅ |
