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
| 1 — Base | ✅ Hecha | 14 / 14 |
| 2 — Libro | ✅ Hecha | 9 / 9 |
| 3 — Música | ⬜ Pendiente | 0 / 7 |
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
| F1-14 | Recorrido de diseño con el artista | Orquestador + artista | F1-13 | ✅ |

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
| ID-03 | Cielo radiante: núcleo con la estrella-brújula, íconos de faceta, nebulosa fotográfica, eras | Worker | ID-01 | ✅ |
| ID-04 | Era BDUEM en monocromo con scroll horizontal | Worker | ID-01 | ✅ |
| ID-05 | Reproductor y pie con la nueva estética | Worker | ID-01 | ✅ |
| ID-06 | Limpieza y verificación final | Orquestador | todas | ✅ |
| ID-07 | Portada: nombre gigante y "Nuevo" como estrella lateral | Worker | ID-02 | ✅ |

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

#### ID-07 — Portada: nombre gigante y "Nuevo" lateral
- **Pedido del artista:** el aviso "Nuevo" centrado se ve genérico y artificial. Regresa la idea del banner de su mockup de GPT: **SUPERN✦BA gigante** como primera impresión, pero sobre el cielo cósmico (no el fondo verde ni el eclipse). "Nuevo" pasa a un lateral o isla emergente.
- **Archivos:** `web/src/app/page.tsx`, `page.module.css`, `web/src/components/home/*`.
- **Terminado cuando:** hero con el nombre gigante y la estrella-brújula en la "O"; "Nuevo" integrado como una estrella con anotación en un lateral (escritorio) e isla flotante compacta en celular; el cielo de constelaciones sigue después; sin scroll horizontal; accesible.

#### ID-06 — Limpieza y verificación
- Borrar páginas y archivos de prueba, verificar build, rutas, navegador en escritorio y celular, y cerrar F1-14.

---

## Fase 2 — Libro

**Decisiones técnicas de la fase 2**
- **El texto del libro sale de Firestore**, no de archivos locales. Medido el 2026-10-25: `parts/{1..4}/chapters/0` tiene el texto completo de cada parte (17 000 a 69 000 caracteres de HTML pegado desde Word, con `MsoNormal`, `<o:p>` y estilos en línea) y `authorNotes` tiene 23 notas del autor; los dos se pueden leer sin sesión. `src/data/sampleChapters.ts` es texto de relleno viejo y `src/components/texts/*` son solo los fragmentos poéticos de las páginas de cada parte.
- El servidor de Next lee Firestore por su API REST con `"use cache"` y `cacheLife("hours")`, limpia el HTML (lista blanca de etiquetas) y lo parte en capítulos por sus títulos en negritas (cada parte tiene de 3 a 5). Así el texto llega ya renderizado, sin esperar a Firebase en el navegador, y lo que el artista edite en el admin aparece en unas horas. Si faltan las variables de Firebase, el build no falla y la página dice que el texto no está disponible.
- **Datos del lector** (resaltados, citas, marcadores, progreso y preferencias): mismas rutas de Firestore que el sitio viejo (`users/{uid}/highlights|quotes|bookmarks|readingProgress/part-N|preferences/settings`) para conservar lo que ya guardaron los lectores; sin sesión se guardan en el navegador y se suben al iniciar sesión con Google.
- Los fragmentos poéticos y las polaroids de las páginas viejas de cada parte se conservan como la **antesala** de la parte, en scroll horizontal, antes del texto.
- **Fuera de esta fase** (quedan anotados para después): reacciones, tarjeta de cita para Instagram, descarga en PDF, tutorial y aviso de newsletter del lector viejo.
- `web/.env.local` (ignorado por git) tiene la configuración pública de Firebase copiada del `.env` del sitio viejo.

| ID | Tarea | Quién | Depende de | Estado |
|---|---|---|---|---|
| F2-01 | Contenido del libro desde Firestore | Worker | — | ✅ |
| F2-02 | Sesión y datos del lector | Worker | — | ✅ |
| F2-03 | Puzzles `/0618am` y `/0618am/030806` | Worker | — | ✅ |
| F2-04 | Lector: página de la parte y lectura continua | Worker | F2-01 | ✅ |
| F2-05 | Publicación escalonada, redirecciones y "Leer la Parte 1" | Worker | F2-01 | ✅ |
| F2-06 | Antesala de cada parte: fragmentos y polaroids | Worker | F2-04 | ✅ |
| F2-07 | Modo páginas y configuración de lectura | Worker | F2-02, F2-04 | ✅ |
| F2-08 | Resaltados, citas, marcadores y notas del autor | Worker | F2-02, F2-07 | ✅ |
| F2-09 | Verificación final de la fase | Orquestador | todas | ✅ |

Referencia visual obligatoria para el lector: la sección "Color de la era BDUEM" de [IDENTIDAD-VISUAL.md](IDENTIDAD-VISUAL.md) y los componentes de `web/src/components/era/` (`VerticalLabel`, `Polaroid`, `EraPanel`, `HorizontalScroll`) y `web/src/components/brand/StarWord`. Negro puro, luz blanca, Uncial Antiqua en títulos y Cormorant Garamond en el texto; nada de color.

### F2-01 — Contenido del libro desde Firestore
- **Archivos:** `web/src/types/book.ts` (nuevo), `web/src/lib/book/` (nuevo), `web/package.json` y `web/package-lock.json` (solo para agregar `sanitize-html` y `@types/sanitize-html`).
- **Terminado cuando:**
  - `getBookPart(partNumber)` (servidor, `"use cache"` + `cacheLife("hours")`) devuelve la parte con sus capítulos `{ index, title, html }` leída de `parts/{n}/chapters` por la API REST de Firestore (proyecto de `NEXT_PUBLIC_FIREBASE_PROJECT_ID`), o `null` si no hay configuración o falla la red, sin romper el build.
  - El HTML se limpia con lista blanca (`p`, `br`, `em`, `i`, `strong`, `b`, `h2`, `h3`, `blockquote`), sin clases ni estilos de Word ni `<o:p>`; los párrafos vacíos (`&nbsp;`) se quitan; los títulos en negritas se vuelven `<h2>` y separan los capítulos.
  - `getAuthorNotes(partNumber)` devuelve las notas de `authorNotes` de esa parte, y el HTML del capítulo marca la primera aparición de cada `triggerText` con `<span data-note-id>` (sin romper etiquetas si el texto cruza una cursiva; si no se encuentra, la nota se omite y se avisa en el log del servidor).
  - Funciones puras de publicación en `web/src/lib/book/publication.ts`: `isPartPublished(part, now)`, `partSlug(n)` y `parsePartSlug("parte-3")`, usando `releaseDate` de `web/src/content/works.ts` con la zona horaria de México.
  - Tiempo de lectura estimado por capítulo y por parte (palabras / 200).
  - Probado contra Firestore real: las 4 partes con sus capítulos (1: 5, 2: 4, 3: 4, 4: 3) y las notas marcadas.

### F2-02 — Sesión y datos del lector
- **Archivos:** `web/src/lib/reader/` (nuevo), `web/src/components/auth/` (nuevo).
- **Terminado cuando:**
  - Hook `useAuth()` con el usuario actual, `signIn()` (Google, ventana emergente) y `signOut()`, cargando Firebase solo en el navegador (`web/src/lib/firebase.ts`).
  - Servicio de datos del lector con tipos `Highlight`, `Quote`, `Bookmark`, `ReadingProgress` y `ReaderPreferences` compatibles con los documentos del sitio viejo (`src/services/userDataService.ts`), y funciones para listar, guardar y borrar cada uno.
  - Con sesión usa las mismas rutas de Firestore del sitio viejo; sin sesión, `localStorage`; al iniciar sesión sube lo local sin duplicar (por `id`).
  - El progreso guarda capítulo y posición relativa (0–1) además de los campos viejos, y se escribe con espera (no en cada evento de scroll).
  - Botón `SignInButton` pequeño y accesible con la estética BDUEM (sin dependencias nuevas de íconos).
  - Nada de esto rompe el build ni el render del servidor si faltan las variables de Firebase.

### F2-03 — Puzzles `/0618am` y `/0618am/030806`
- **Archivos:** `web/src/app/0618am/` (nuevo), `web/src/components/puzzles/` (nuevo).
- **Terminado cuando:**
  - `/0618am` es el puzzle de `src/pages/cifrados/Cuadratico.tsx` con la misma lógica y respuestas, y `/0618am/030806` es el de `PuzzleStars.tsx` (arrastrar estrellas a la constelación).
  - El arrastre usa Pointer Events, sin `@react-spring` ni `@use-gesture`; funciona con ratón y con el dedo, y a 390 px de ancho.
  - Estética monocroma (negro, estrellas blancas, serif); las páginas no aparecen en el menú.
  - Las rutas tienen `robots: noindex` (son secretos).

### F2-04 — Lector: página de la parte y lectura continua
- **Archivos:** `web/src/app/libros/bduem/leer/` (nuevo), `web/src/components/reader/` (nuevo).
- **Terminado cuando:**
  - `/libros/bduem/leer/parte-1` … `parte-4` se generan con `generateStaticParams`; otro slug da 404 real.
  - La página va dentro de `EraTheme` de BDUEM: etiqueta vertical "SUPERNOBA", encabezado con "Parte N" y el título en Uncial Antiqua (con la estrella en la "O" vía `StarWord` cuando el título la tenga, como "SUPERN✦BA"), el subtítulo poético y el tiempo de lectura.
  - El texto se lee en una columna de Cormorant Garamond, `#E0E0E0` sobre negro, de unos 34 em de ancho, con títulos de capítulo en Uncial y un índice de capítulos.
  - Barra superior mínima y fija: volver a BDUEM, nombre de la parte, progreso de lectura y tiempo restante; deja espacio para los controles de F2-07 y F2-08.
  - Al final: enlace a la parte siguiente (o al libro en la Parte 4) y a la anterior.
  - Si la parte no está publicada: fecha de publicación y cuenta regresiva, sin el texto. Si Firestore no responde: mensaje claro, sin error.
  - Metadatos con título y descripción de la parte. Sin scroll horizontal a 390 px; teclado y lector de pantalla bien.

### F2-05 — Publicación escalonada, redirecciones y "Leer la Parte 1"
- **Archivos:** `web/next.config.ts`, `web/src/components/era/BduemEra.tsx` (+ su `.module.css`).
- **Terminado cuando:**
  - `/parte1` … `/parte4` redirigen de forma permanente a `/libros/bduem/leer/parte-1` … `parte-4`; `/pruebas` da 404.
  - En la era BDUEM, "Leer la Parte 1" es un enlace activo al lector y desaparece "Próximamente".
  - Cada parte del índice es un enlace al lector si está publicada; si no, se ve apagada con su fecha (usa `isPartPublished` de F2-01).

### F2-06 — Antesala de cada parte: fragmentos y polaroids
- **Archivos:** `web/src/content/bduemPrelude.ts` (nuevo), `web/src/components/reader/PartPrelude*` (nuevo), la página de F2-04 para insertarla.
- **Terminado cuando:**
  - Los fragmentos poéticos de `src/components/texts/ChapterText{N}_*.tsx` y las fotos de Cloudinary de `src/pages/parts/Parte{N}.tsx` están como datos por parte.
  - Antes del texto, cada parte abre con su antesala en `HorizontalScroll` (escritorio) y vertical en celular: título de la parte, fragmentos alternados con polaroids en blanco y negro con giro fijo (determinista) y un último panel "Empezar a leer" que lleva al primer capítulo.
  - No atrapa el scroll vertical: al terminar la antesala se puede seguir al texto.

### F2-07 — Modo páginas y configuración de lectura
- **Archivos:** `web/src/components/reader/*`.
- **Terminado cuando:**
  - Dos modos: **continuo** (vertical, el de F2-04) y **páginas** (paginado horizontal con columnas CSS, como el `KindleReader` viejo): flechas del teclado, deslizar en celular, clic en los bordes y número de página.
  - Panel de configuración: modo, tamaño de letra (5 pasos) e interlineado; se guarda con las preferencias de F2-02.
  - Al cambiar de modo o de tamaño se conserva el punto de lectura.
  - Guarda el progreso (F2-02) y ofrece "Continuar donde te quedaste" al volver.

### F2-08 — Resaltados, citas, marcadores y notas del autor
- **Archivos:** `web/src/components/reader/*`.
- **Terminado cuando:**
  - Al seleccionar texto aparece un menú pequeño: **Resaltar**, **Guardar cita**, **Copiar** (y **Compartir** con la API del navegador si existe); también en celular.
  - Los resaltados se dibujan sobre el texto en blanco translúcido (sin colores) y se pueden quitar; se restauran al volver, también los guardados por el sitio viejo para la misma parte.
  - Panel "Mis citas y marcadores" con lista, ir al lugar y borrar.
  - Botón de marcador para el capítulo y la posición actual.
  - Las notas del autor (`data-note-id`) se ven como una marca discreta y abren una tarjeta con título y texto (con teclado y con toque), con el estilo de `EraPanel`.
  - Sin sesión funciona en el navegador e invita a iniciar sesión para guardarlo en la cuenta.

### F2-09 — Verificación final de la fase
- **Terminado cuando:** tipos, lint y build sin errores; en producción `/libros/bduem/leer/parte-1…4` dan 200, otros slugs 404 y `/parte1…4` redirigen; el lector y los puzzles revisados en el navegador a 1440 y 390 px; el plan y este tablero actualizados.

---

## Fase 3 — Música

**Decisiones de la fase 3**
- **Letras públicas** (decisión del artista, 2026-10-25): se leen sin sesión y Google las puede indexar.
- **Material del artista listo**: letras, créditos, audios propios y portadas en alta. Se entrega en `web/materiales/musica/` (carpeta ignorada por git, ver F3-01) y el orquestador lo pasa a datos.
- **Dónde vive el material en esta fase**: letras y créditos en `web/src/content/` (como el resto del contenido; pasan a Firestore en la Fase 5); portadas optimizadas en `web/public/musica/` y audios en `web/public/audio/` (MP3, ≤ 3 MB por adelanto). En la Fase 5 los audios pasan a Firebase Storage.
- **Estética**: `/musica` es parte del cielo base (radiante). La página de cada sencillo toma el tema de su era: Rulos y nohablobien / part3 son de la era BDUEM, así que van en monocromo con Uncial y Cormorant. **Las portadas se muestran a color** (son la obra), con el marco fino de las polaroids, sin giro; es la única excepción al blanco y negro de la era y se confirma con el artista al revisarla en el navegador.
- **Embeds de Spotify y YouTube con fachada**: no se cargan hasta que alguien pulsa "Escuchar en Spotify" o "Ver video", para no meter cookies de terceros ni pesar en la carga.
- **Reproductor propio** para adelantos y exclusivas, con una etiqueta que dice cuál es cuál; las canciones publicadas también enlazan a las plataformas.

| ID | Tarea | Quién | Depende de | Estado |
|---|---|---|---|---|
| F3-01 | Material: letras, créditos, portadas y audios | Artista entrega, orquestador + worker | — | ⬜ |
| F3-02 | Fachada para embeds de Spotify y YouTube | Worker | — | ⬜ |
| F3-03 | Discografía `/musica`: constelación y lista | Worker | — (usa F3-01 si ya está) | ⬜ |
| F3-04 | Página de sencillo `/musica/[slug]` | Worker | F3-01, F3-02 | ⬜ |
| F3-05 | Letras y créditos | Worker | F3-01, F3-04 | ⬜ |
| F3-06 | Reproductor a pantalla completa con portada y letra | Worker | F3-01 | ⬜ |
| F3-07 | Verificación final de la fase | Orquestador | todas | ⬜ |

**Orden y paralelo:** F3-02 y F3-03 empiezan ya (no comparten archivos). F3-01 arranca cuando llegue el material. Después F3-04 y F3-06 en paralelo, luego F3-05 y al final F3-07.

### F3-01 — Material: letras, créditos, portadas y audios
- **Entrega del artista** en `web/materiales/musica/` (se agrega `materiales/` a `web/.gitignore`), una carpeta por canción con su `id` (`rulos`, `nohablobien`, `part3`):
  - `letra.txt` (estrofas separadas por una línea en blanco).
  - `creditos.txt` (una línea por rol, por ejemplo "Producción: …").
  - `audio.mp3` y, en `audio.txt`, si es **adelanto** o **exclusiva**.
  - La portada de cada sencillo en `web/materiales/musica/portadas/` (`rulos.jpg`, `nohablobien-part3.jpg`), en el mayor tamaño que tengas.
- **Archivos:** `web/.gitignore`, `web/src/types/content.ts` (`Track`: `lyrics` como estrofas, `credits`, `audioKind`), `web/src/content/tracks.ts`, `web/src/content/works.ts` (`coverUrl`), `web/public/musica/`, `web/public/audio/`.
- **Terminado cuando:**
  - Cada canción tiene su letra, créditos y audio con su tipo; cada sencillo, su portada.
  - Portadas en WebP o JPEG de hasta 1400 px y ≤ 300 KB, más una de 512 px para el reproductor y la sesión de medios.
  - Audios en MP3 de ≤ 3 MB; si son más pesados, se acortan o se recomprimen y se avisa al artista.
  - El aviso "Nuevo" de la portada y el reproductor ya usan la portada real.
  - Nada de `web/materiales/` entra a git.

### F3-02 — Fachada para embeds de Spotify y YouTube
- **Archivos:** `web/src/components/music/Embed*` (nuevo).
- **Terminado cuando:**
  - `<SpotifyEmbed url>` y `<YouTubeEmbed url>` muestran primero una tarjeta ligera (portada o miniatura, título y un botón "Escuchar en Spotify" o "Ver video"); al pulsarla se carga el `iframe` oficial (`open.spotify.com/embed/…`, `youtube-nocookie.com/embed/…`).
  - Antes del clic no hay ninguna petición a Spotify ni a YouTube (verificable en la pestaña de red), salvo la miniatura de YouTube, que se sirve desde `i.ytimg.com` o desde una imagen local.
  - Aceptan URL de canción, álbum y video tal como están en `content/`.
  - Accesibles (botón real, título del `iframe`), sin desbordar a 390 px y con la estética de la era donde se usen (variables `--era-*`).

### F3-03 — Discografía `/musica`: constelación y lista
- **Archivos:** `web/src/app/musica/page.tsx`, `web/src/components/music/Discography*` (nuevo).
- **Terminado cuando:**
  - Arriba, la constelación **Supernoba** sola (reutiliza el dibujo y la lógica de `web/src/components/sky/`, sin duplicarla: si hace falta, se agrega una opción para filtrar por constelación) con sus estrellas enlazadas a cada sencillo.
  - Debajo, la vista de lista: cada sencillo con portada, nombre, fecha, era, número de canciones, y botones "Escuchar" (reproductor propio si hay audio) y a plataformas.
  - Un selector "Constelación / Lista" en escritorio; en celular la lista va primero.
  - Las obras por publicar aparecen apagadas con su fecha.
  - Página en el tema base radiante, accesible y sin scroll horizontal a 390 px.

### F3-04 — Página de sencillo `/musica/[slug]`
- **Archivos:** `web/src/app/musica/[slug]/page.tsx`, `web/src/components/music/Release*` (nuevo).
- **Terminado cuando:**
  - Toma el tema de su era (`EraTheme`) con etiqueta vertical "SUPERNOBA": portada grande con marco fino, título, tipo y fecha, era y botones a Spotify, Apple Music, YouTube y el smart link.
  - Lista de canciones con número, duración, explícito y botón de reproducir (reproductor propio con la etiqueta adelanto/exclusiva, o enlace a la plataforma si no hay audio).
  - Embed de Spotify del sencillo y videos de YouTube con la fachada de F3-02.
  - Sección **"Conectado con"** con sus hilos: por ejemplo, part3 → "inspirada en la Parte 3: Supernoba" con enlace a `/libros/bduem/leer/parte-3`.
  - Deja un lugar claro para letras y créditos (F3-05).
  - 404 real en slugs inexistentes, metadatos con título y descripción, accesible y sin scroll horizontal a 390 px.

### F3-05 — Letras y créditos
- **Archivos:** `web/src/components/music/Lyrics*` y `Credits*` (nuevos), la página de F3-04 para insertarlos.
- **Terminado cuando:**
  - Cada canción tiene su letra completa en la página del sencillo, con estrofas, en Cormorant, y un ancla propia (`/musica/nohablobien-part3#letra-part3`).
  - Los créditos aparecen bajo cada letra o al final del sencillo, en texto pequeño.
  - La letra está en el HTML del servidor (indexable) y se puede copiar.
  - Si una canción no tiene letra, la sección no aparece.

### F3-06 — Reproductor a pantalla completa con portada y letra
- **Archivos:** `web/src/components/player/*`.
- **Terminado cuando:**
  - El mini reproductor se expande a una vista completa con la portada grande, título, sencillo, la etiqueta adelanto/exclusiva, controles, cola y la letra de la canción (si la tiene), con el tema de la era de la canción.
  - Se cierra con Escape, con el botón de bajar o con un gesto hacia abajo en celular; el foco se maneja bien y el resto de la página queda inerte mientras está abierta.
  - La sesión de medios del sistema muestra la portada real.
  - La música sigue sonando al navegar, como en F1-12.

### F3-07 — Verificación final de la fase
- **Terminado cuando:** tipos, lint y build sin errores; en producción `/musica`, `/musica/rulos` y `/musica/nohablobien-part3` dan 200 y un slug inexistente 404; antes de pulsar un embed no hay peticiones a Spotify ni YouTube; los audios suenan y siguen al navegar; revisión en el navegador a 1440 y 390 px; el plan y este tablero actualizados.

---

## Fases siguientes (se detallan al empezar)

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
| 2026-10-25 | ID-03 | Worker hizo el cielo radiante: escenario transparente sobre el cosmos, estrellas blancas, núcleo con la estrella-brújula y resplandor cálido, íconos de faceta, hilos por trazo con `inspira` cálido, nebulosa fotográfica con `feTurbulence` y eras en píldoras. Reviewer: aprobada. Pendiente para Fase 6: medir el costo de repintado del filtro de la nebulosa junto al parpadeo de estrellas en celulares de gama baja. ✅ |
| 2026-10-25 | ID-06 | Orquestador: borró `/temas`, `/reproductor-prueba`, el audio de prueba y los mockups, y quitó Crimson Pro (sin uso). Tipos, lint y build sin errores; en producción todas las rutas dan 200, los slugs inexistentes y las páginas borradas 404, y el HTML no tiene datos de la era 2. Revisado en el navegador a 1440 y 390 px. Se detuvieron servidores de prueba que dejaron los agentes. ✅ |
| 2026-10-25 | F1-14 | Identidad visual aplicada. **Fase 1 terminada.** Nota: el reproductor ya no tiene página de prueba; se podrá probar cuando haya audios reales (Fase 3). ✅ |
| 2026-10-25 | ID-07 | El artista rechazó el aviso "Nuevo" centrado. Worker hizo el hero con SUPERN✦BA gigante sobre el cielo cósmico y "Nuevo" como estrella con anotación en el lateral (escritorio) e isla flotante (celular). Orquestador lo verificó en el navegador a 1440 y 390 px y corrigió el título cortado de la isla; sin reviewer por ser un cambio acotado. ✅ |
| 2026-10-25 | ID-07 | Ajuste pedido por el artista: la isla de celular estaba chueca y estorbaba. Ahora es una pastilla "Nuevo" que se abre en un panel compacto y solo aparece mientras se ve la primera pantalla. Verificado a 390 px. ✅ |
| 2026-10-25 | F2 | Orquestador midió el contenido real: el texto completo y las notas del autor están en Firestore (lo local era relleno). Se detallan las tareas F2-01 a F2-09. |
| 2026-10-25 | F2-01 | Worker hizo la lectura de Firestore por REST con caché, la limpieza con `sanitize-html`, el corte en capítulos (5, 4, 4, 3) y el marcado de notas (23 de 23). Reviewer: aprobada; el orquestador agregó un tiempo límite a la red. La lista blanca final es `p`, `br`, `em`, `strong` (los `h2` los genera el corte). Para F2-08: el título y texto de las notas se muestran como texto, no como HTML. ✅ |
| 2026-10-25 | F2-03 | Worker migró los dos puzzles sin librerías de arrastre (Pointer Events, teclado con flechas, tablero que escala). Reviewer: aprobada; el orquestador corrigió la cancelación del arrastre y el multitoque. ✅ |
| 2026-10-25 | F2-02 | Worker hizo la sesión con Google y los datos del lector con las rutas del sitio viejo. Reviewer pidió corregir una carrera al cerrar sesión durante la migración (media), datos del usuario anterior en pantalla y errores silenciosos; corregidos. Desvíos aceptados: con sesión no se guarda copia local; letra por defecto 20 px. Falta probarlo contra Firestore real con la interfaz (F2-07/F2-08). ✅ |
| 2026-10-25 | F2-05 | Worker hizo las redirecciones permanentes de `/parte1…4`, el enlace "Leer la Parte 1" y el índice con partes enlazadas o apagadas según su fecha (`"use cache"` + `cacheLife("hours")`). Reviewer pidió contraste en la parte apagada (media); el orquestador la dejó en #7a7a7a (4.9:1). ✅ |
| 2026-10-25 | F2-04 | Worker hizo `/libros/bduem/leer/parte-N` (estática, 404 real en otros slugs): encabezado en Uncial con la estrella en la "O", índice de capítulos, texto en Cormorant a 34em, barra fija con progreso y tiempo restante (bajo el header global), final con enlaces y estados "por publicar" (cuenta regresiva) y "no disponible". Reviewer: aprobada. Orquestador lo revisó en el navegador a 1440 y 390 px (sin scroll horizontal, texto a 20 px en celular) y corrigió el título de capítulo repetido: el `h2` del HTML ahora es el encabezado del capítulo, conservando la nota del autor de "Cielo Estrellado". Nota: una parte puede tardar hasta 1 h en abrirse después de su fecha (caché). ✅ |
| 2026-10-25 | F2-07 | Worker hizo el modo páginas (columnas CSS, flechas, deslizar, clic en los bordes, "pág. X de N"), el panel "Aa" (modo, 5 tamaños, 3 interlineados, índice de capítulos) y "Continuar donde te quedaste"; montó `ReaderDataProvider` y corrigió un `new Date()` en el render de F2-02 que rompía el prerender. Reviewer pidió (bajas) que el foco no quede en otra página y un índice en modo páginas; el orquestador vio en el navegador que las flechas fallaban tras cerrar el panel. Corregido. Verificado a 1440 y 390 px: al cambiar el ancho se conserva el punto (pág. 3/32 → 4/60). Decisión: en modo páginas la portada y la antesala no se muestran. ✅ |
| 2026-10-25 | F2-06 | Worker pasó a datos los 16 fragmentos y 16 fotos de las páginas viejas (5, 4, 4, 3) y creó `PartPrelude` con `HorizontalScroll` y polaroids. Reviewer: aprobada. Orquestador la integró entre la portada y el texto, sin repetir el título de la parte, con paneles numerados para lector de pantalla; verificada a 1440 (rueda → horizontal) y 390 px (vertical, sin desborde). ✅ |
| 2026-10-25 | F2-03 | Orquestador revisó los puzzles en el navegador: el encabezado no tomaba el negro de la era y había un `<main>` dentro de otro; corregido. A 390 px el margen de acierto de las estrellas nunca baja de 22 px. ✅ |
| 2026-10-25 | F2-08 | Worker hizo el menú de selección (Resaltar, Guardar cita, Copiar, Compartir), los resaltados con la CSS Custom Highlight API (respaldo con `<mark>`) anclados por capítulo, desplazamiento y contexto, también los del sitio viejo; marcador y panel "Mis citas y marcadores" con invitación a iniciar sesión; notas del autor enfocables con su tarjeta. Reviewer marcó como alta que el nombre del resaltado no coincidía con el CSS: el orquestador comprobó en el navegador que sí coincide (CSS Modules transforma los dos) y que el resaltado se dibuja y se guarda. El orquestador hizo opaca la barra del lector porque las polaroids de la antesala se veían encima al hacer scroll. Pendiente menor: el efecto de resaltados se repite al cambiar letra o modo (solo rendimiento). ✅ |
| 2026-10-25 | F2-09 | Verificación del orquestador: tipos, lint y build sin errores. En producción (`next start` en otro puerto, ya detenido): `/libros/bduem/leer/parte-1…4` dan 200 con el texto y las notas en el HTML; `parte-5` y `foo` dan 404; `/parte1…4` redirigen con 308; `/pruebas` da 404; los puzzles dan 200 con `noindex`; la era BDUEM enlaza las cuatro partes. Consola limpia en producción. Lector revisado en el navegador a 1440 y 390 px en los dos modos, con antesala, panel "Aa", resaltado y nota del autor. Sin probar todavía: guardar en la cuenta con sesión de Google real. **Fase 2 terminada.** ✅ |
