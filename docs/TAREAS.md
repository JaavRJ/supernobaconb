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
| 3 — Música | ✅ Hecha | 7 / 7 |
| 4 — Jabi, videos, tienda y sobre mí | ✅ Hecha | 10 / 10 |
| Ajustes del artista tras la fase 4 | 🔨 En curso | 11 / 14 |
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
- **Dónde vive el material en esta fase**: letras y créditos en `web/src/content/` (como el resto del contenido; pasan a Firestore en la Fase 5); portadas optimizadas en `web/public/musica/` y audios en `web/public/audio/` (MP3 a 128 kbps, ≤ 4 MB por canción). En la Fase 5 los audios pasan a Firebase Storage.
- **Estética**: `/musica` es parte del cielo base (radiante). La página de cada sencillo toma el tema de su era: Rulos y nohablobien / part3 son de la era BDUEM, así que van en monocromo con Uncial y Cormorant. **Las portadas se muestran a color** (son la obra), con el marco fino de las polaroids, sin giro; es la única excepción al blanco y negro de la era y se confirma con el artista al revisarla en el navegador.
- **Embeds de Spotify y YouTube con fachada**: no se cargan hasta que alguien pulsa "Escuchar en Spotify" o "Ver video", para no meter cookies de terceros ni pesar en la carga.
- **Reproductor propio** con los audios del artista, sin etiquetas de "adelanto" o "exclusiva" (decisión del artista, 2026-10-25); las canciones publicadas también enlazan a las plataformas.

| ID | Tarea | Quién | Depende de | Estado |
|---|---|---|---|---|
| F3-01 | Material: letras, créditos, portadas y audios | Artista entrega, orquestador + worker | — | ✅ |
| F3-02 | Fachada para embeds de Spotify y YouTube | Worker | — | ✅ |
| F3-03 | Discografía `/musica`: constelación y lista | Worker | — (usa F3-01 si ya está) | ✅ |
| F3-04 | Página de sencillo `/musica/[slug]` | Worker | F3-01, F3-02 | ✅ |
| F3-05 | Letras y créditos | Worker | F3-01, F3-04 | ✅ |
| F3-06 | Reproductor a pantalla completa con portada y letra | Worker | F3-01 | ✅ |
| F3-07 | Verificación final de la fase | Orquestador | todas | ✅ |

**Orden y paralelo:** F3-02 y F3-03 empiezan ya (no comparten archivos). F3-01 arranca cuando llegue el material. Después F3-04 y F3-06 en paralelo, luego F3-05 y al final F3-07.

### F3-01 — Material: letras, créditos, portadas y audios
- **Entrega del artista** en `web/materiales/musica/` (se agrega `materiales/` a `web/.gitignore`), una carpeta por canción con su `id` (`rulos`, `nohablobien`, `part3`):
  - `letra.txt` (estrofas separadas por una línea en blanco).
  - `creditos.txt` (una línea por rol, por ejemplo "Producción: …").
  - `audio.mp3`.
  - La portada de cada sencillo en `web/materiales/musica/portadas/` (`rulos.jpg`, `nohablobien-part3.jpg`), en el mayor tamaño que tengas.
- **Archivos:** `web/.gitignore`, `web/src/types/content.ts` (`Track`: `lyrics` como estrofas, `credits`), `web/src/content/tracks.ts`, `web/src/content/works.ts` (`coverUrl`), `web/public/musica/`, `web/public/audio/`.
- **Terminado cuando:**
  - Cada canción tiene su letra, créditos y audio; cada sencillo, su portada.
  - Portadas en WebP o JPEG de hasta 1400 px y ≤ 300 KB, más una de 512 px para el reproductor y la sesión de medios.
  - Audios en MP3 a 128 kbps (≤ 4 MB); si son más pesados, se recomprimen y se avisa al artista.
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
  - Lista de canciones con número, duración, explícito y botón de reproducir (reproductor propio, o enlace a la plataforma si no hay audio).
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
  - El mini reproductor se expande a una vista completa con la portada grande, título, sencillo, controles, cola y la letra de la canción (si la tiene), con el tema de la era de la canción.
  - Se cierra con Escape, con el botón de bajar o con un gesto hacia abajo en celular; el foco se maneja bien y el resto de la página queda inerte mientras está abierta.
  - La sesión de medios del sistema muestra la portada real.
  - La música sigue sonando al navegar, como en F1-12.

### F3-07 — Verificación final de la fase
- **Terminado cuando:** tipos, lint y build sin errores; en producción `/musica`, `/musica/rulos` y `/musica/nohablobien-part3` dan 200 y un slug inexistente 404; antes de pulsar un embed no hay peticiones a Spotify ni YouTube; los audios suenan y siguen al navegar; revisión en el navegador a 1440 y 390 px; el plan y este tablero actualizados.

---

## Fase 4 — Jabi, videos, tienda y sobre mí

**Decisiones de la fase 4**
- **Proyectos de Jabi** (elegidos con el artista, 2026-10-25): *Este sitio* (ya existía), **AURA** (agente de accesibilidad para Android), **Diablos AeroVision** (Hackathon ISAC 2026) y **RailSense** (ganador del track Open Source, Hackathon Mobility & AI 2025). Los textos salen de sus README; nada se inventa. El repositorio de AURA es privado: la página dice "código privado" y no enlaza (pendiente: el artista decide si lo hace público). Los puzzles `/0618am` siguen siendo estrella oculta y no aparecen en la lista.
- **Estética**: `/proyectos`, `/videos`, `/tienda` y `/sobre-mi` van en la base **radiante**. Los proyectos no nacen de un libro, así que su página también es radiante (incluido *Este sitio*, que se liga al libro por su hilo `construye`). Las **capturas de pantalla se muestran a color** con marco fino y sin giro (como las portadas: son la obra); las **fotos** del artista siempre en blanco y negro y en polaroid girada. Scroll vertical (el horizontal es de las páginas del libro).
- **Fotos**: las del sitio viejo (Cloudinary, ya en `bduemPrelude.ts` y en las obras) y las del kit de prensa actual del artista (`Supernoba EPK (1).pdf`: retrato, farol, árbol con ave, estatua), optimizadas en `web/public/fotos/`.
- **Tienda**: por ahora solo el libro físico, con el link de Amazon del kit (`https://a.co/d/00hx9lsU`). Sin precio (no lo tenemos); "Comprar en Amazon" abre en pestaña nueva.
- **Kit de prensa**: el artista ya tiene uno (una página de Canva, en inglés). El orquestador lo reescribe y mejora en **español e inglés** con la identidad del sitio, y lo publica como PDF descargable más un ZIP de fotos y portadas en alta. La bio larga es un **borrador que el artista aprueba** antes de la Fase 6.
- **Contacto**: Instagram `@supernobaconb` (se agrega también al pie) y un correo de prensa que el artista aún no da: `site.pressEmail` es opcional y, mientras falte, solo se muestra Instagram.
- **Material del orquestador**: capturas en `web/public/proyectos/<id>/` (WebP ≤ 1600 px, ≤ 250 KB) y fotos en `web/public/fotos/`; los originales grandes se quedan en `web/materiales/` (ignorada por git).
- **"Conectado con"** sale de una sola función y un solo componente, usados por la página de sencillo y la de proyecto. En la página del libro, las polaroids de "obras" solo muestran obras unidas al libro por un hilo (así los proyectos sin relación con BDUEM no aparecen ahí).

| ID | Tarea | Quién | Depende de | Estado |
|---|---|---|---|---|
| F4-01 | Material: capturas de proyectos y fotos | Orquestador | — | ✅ |
| F4-02 | Datos: proyectos, videos, fotos, productos y contacto | Worker | — | ✅ |
| F4-03 | "Conectado con" compartido | Worker | — | ✅ |
| F4-04 | `/proyectos`: constelación Jabi y lista | Worker | F4-02 | ✅ |
| F4-05 | Visor de imágenes y `/videos`: videoclips y galería | Worker | F4-02 | ✅ |
| F4-06 | `/proyectos/[slug]`: detalle del proyecto | Worker | F4-01, F4-02, F4-03, F4-05 | ✅ |
| F4-07 | `/tienda` con links externos | Worker | F4-02 | ✅ |
| F4-08 | Biografía y kit de prensa (ES/EN) | Orquestador | F4-01 | ✅ |
| F4-09 | `/sobre-mi`: biografía, fotos, kit y contacto | Worker | F4-02, F4-05, F4-08 | ✅ |
| F4-10 | Verificación final de la fase | Orquestador | todas | ✅ |

**Orden y paralelo:** F4-02 y F4-03 en paralelo (no comparten archivos) mientras el orquestador hace F4-01. Después F4-04, F4-05 y F4-07 en paralelo. Luego F4-06 y F4-08 (orquestador) al mismo tiempo, F4-09 y al final F4-10. Solo un agente corre `npm run build` a la vez.

### F4-01 — Material: capturas de proyectos y fotos
- **Archivos:** `web/public/proyectos/<id>/` y `web/public/fotos/` (nuevos); originales en `web/materiales/proyectos/` y `web/materiales/fotos/`.
- **Terminado cuando:**
  - Cada proyecto tiene de 2 a 4 capturas reales: *Este sitio* (portada, lector y página de sencillo del sitio nuevo), AURA (capturas de su reporte de usabilidad), AeroVision (la app pública) y RailSense (resultados del repositorio).
  - Las fotos del kit (retrato, farol, árbol, estatua) en WebP de hasta 1600 px, más el retrato en 2400 px para el kit.
  - Cada imagen ≤ 250 KB (salvo las del kit) y con su ancho y alto anotados para `next/image`.

### F4-02 — Datos: proyectos, videos, fotos, productos y contacto
- **Archivos:** `web/src/types/content.ts`, `web/src/content/works.ts`, `web/src/content/threads.ts`, `web/src/content/projects.ts`, `videos.ts`, `photos.ts`, `products.ts` (nuevos), `web/src/content/index.ts`, `web/src/content/site.ts`.
- **Terminado cuando:**
  - Tipos `ProjectDetail` (tagline, párrafos, rol, logro opcional, stack, puntos clave, capturas con ancho/alto/alt, repo o "privado", demo, video), `Video` (título, URL de YouTube, obra ligada), `Photo` (src, ancho, alto, alt, origen) y `Product` (nombre, descripción, imagen, precio opcional, link externo, obra ligada).
  - Obras nuevas en la constelación Jabi: `aura`, `diablos-aerovision` y `railsense`, con fecha, resumen, links y `href` `/proyectos/<id>`; *Este sitio* actualizado.
  - Los tres videoclips, las fotos (Cloudinary del sitio viejo + kit) y el libro físico como producto.
  - `site.ts`: `instagram` (el pie lo muestra en F4-09) y `pressEmail` opcional.
  - Funciones de consulta: `getProjects()`, `getProjectDetail(id)`, `getVideos()`, `getPhotos()`, `getProducts()`.
  - El cielo de la portada sigue bien con cuatro estrellas en Jabi (sin encimarse, también a 390 px).

### F4-03 — "Conectado con" compartido
- **Archivos:** `web/src/lib/connections.ts`, `web/src/components/works/Connections*` (nuevos), `web/src/components/music/ReleaseView.tsx`, `web/src/components/music/Release.module.css`, `web/src/components/era/BduemEra.tsx`.
- **Terminado cuando:**
  - `getConnections(work)` (pura) devuelve los hilos de una obra y sus canciones con su frase y enlace, para **todos** los tipos de hilo, incluido `construye` en los dos sentidos ("construido para el libro *Brillo de una Estrella Muerta*" / "su sitio y su lector: *Este sitio*"), sin nombrar eras.
  - `<Connections work>` pinta la sección "Conectado con" con las variables `--era-*` (sirve en monocromo y en radiante) y no aparece si no hay hilos.
  - La página de sencillo usa el componente sin cambiar cómo se ve (part3 → Parte 3 sigue igual).
  - En la página del libro solo aparecen como obras las unidas al libro por un hilo.

### F4-04 — `/proyectos`: constelación Jabi y lista
- **Archivos:** `web/src/app/proyectos/page.tsx` (+ `page.module.css`), `web/src/components/projects/ProjectList*` (nuevo).
- **Terminado cuando:**
  - Encabezado "Proyectos" con la faceta "el que piensa", como `/musica`.
  - La constelación Jabi sola (`<Sky only="jabi" />`) con sus estrellas enlazadas, y la lista de proyectos (en celular la lista primero).
  - Cada proyecto: número, nombre, tagline, año, rol, logro (si tiene) y stack corto, con enlace a su página; la estrella oculta no aparece.
  - Base radiante, accesible, sin scroll horizontal a 390 px.

### F4-05 — Visor de imágenes y `/videos`: videoclips y galería
- **Archivos:** `web/src/components/media/Lightbox*`, `web/src/components/videos/*` (nuevos), `web/src/app/videos/page.tsx` (+ `page.module.css`).
- **Terminado cuando:**
  - `Lightbox` reutilizable: abre una imagen grande en un diálogo modal (Escape, botón cerrar, flechas para pasar, foco atrapado y devuelto, resto de la página inerte, gesto en celular), con opción de mostrarla a color o en blanco y negro.
  - `/videos` muestra los videoclips con la fachada de `YouTubeEmbed` (sin peticiones a YouTube antes del clic, salvo miniaturas), cada uno con su canción y enlace al sencillo.
  - Galería de fotos en polaroids B/N con giro determinista; al tocar una se abre el visor.
  - Base radiante, accesible, sin scroll horizontal a 390 px.

### F4-06 — `/proyectos/[slug]`: detalle del proyecto
- **Archivos:** `web/src/app/proyectos/[slug]/page.tsx`, `web/src/components/projects/ProjectView*` (nuevo).
- **Terminado cuando:**
  - Encabezado con nombre, tagline, año, rol y logro; botones a demo, video y repositorio (o "código privado").
  - Descripción, puntos clave y stack.
  - Capturas a color con marco fino; al tocarlas se abren en el `Lightbox` a color.
  - "Conectado con" (F4-03) si tiene hilos; enlace de vuelta a Proyectos.
  - Base radiante (ya no `EraTheme` de la era), 404 real en slugs inexistentes, metadatos, accesible y sin scroll horizontal a 390 px.

### F4-07 — `/tienda` con links externos
- **Archivos:** `web/src/app/tienda/page.tsx` (+ `page.module.css`), `web/src/components/shop/*` (nuevo).
- **Terminado cuando:**
  - Cada producto con imagen, nombre, descripción, precio solo si existe y "Comprar en …" que abre en pestaña nueva (con aviso para lector de pantalla).
  - El libro físico enlaza también a leerlo en línea (`/libros/bduem`).
  - Una línea discreta dice que vendrá más (discos, merch), sin "Próximamente" de relleno.
  - Base radiante, accesible, sin scroll horizontal a 390 px.

### F4-08 — Biografía y kit de prensa (ES/EN)
- **Archivos:** `web/src/content/bio.ts` (nuevo), `web/public/prensa/` (nuevo).
- **Terminado cuando:**
  - Bio corta (una línea), media (un párrafo) y larga (4–6 párrafos) en español e inglés, a partir del kit actual, el plan y los datos verificados (libro, sencillos, proyectos y logros), sin cifras ni afirmaciones que no podamos sostener.
  - `supernoba-kit-de-prensa.pdf` y `supernoba-press-kit.pdf` con la identidad del sitio (negro, estrella-brújula, Cinzel/Cormorant, fotos B/N): bio, lanzamientos, libro, fotos, links y contacto.
  - `supernoba-fotos-prensa.zip` con el retrato y las portadas en alta y un archivo de créditos.
  - Marcado como borrador hasta que el artista lo apruebe.

### F4-09 — `/sobre-mi`: biografía, fotos, kit y contacto
- **Archivos:** `web/src/app/sobre-mi/page.tsx` (+ `page.module.css`), `web/src/components/about/*` (nuevo), `web/src/components/layout/SiteFooter*` (ícono de Instagram).
- **Terminado cuando:**
  - Retrato en polaroid B/N, nombre con `StarWord`, la frase de las tres facetas y la bio larga en Cormorant.
  - Las tres facetas (Jabi, noba, Supernoba) enlazan a Proyectos, Libros y Música.
  - Algunas fotos más con el visor de F4-05.
  - "Kit de prensa": descargas del PDF en español e inglés y del ZIP de fotos (con tamaño del archivo).
  - Contacto: Instagram y, si existe `site.pressEmail`, el correo.
  - Instagram en el pie del sitio. Base radiante, accesible, sin scroll horizontal a 390 px.

### F4-10 — Verificación final de la fase
- **Terminado cuando:** tipos, lint y build sin errores; en producción `/proyectos`, los cuatro proyectos, `/videos`, `/tienda` y `/sobre-mi` dan 200, un proyecto inexistente 404 y los PDF y el ZIP se descargan; antes de pulsar un video no hay peticiones a YouTube salvo miniaturas; ninguna página nombra eras; revisión en el navegador a 1440 y 390 px; el plan y este tablero actualizados.

---

## Pase de movimiento — el cielo se navega y SUPERNOBA se vuelve cielo

Pedido del artista (2026-10-28), con ethercoded.com como referencia de sensación, no de peso: **sin three.js ni modelos 3D**, solo CSS, SVG y Pointer Events. Todo el movimiento se apaga con `prefers-reduced-motion: reduce`; sin JavaScript la página se ve completa y quieta.

| Tarea | Estado | Archivos | Depende de |
|---|---|---|---|
| MV-01 Cielo navegable | ✅ | `web/src/components/sky/useSkyCamera.ts`, `SkyInteractive.tsx`, `Sky.module.css` | — |
| MV-02 SUPERNOBA vivo y que se vuelve cielo | 🔨 | `web/src/components/brand/StarWord.tsx` + `.module.css`, `web/src/components/home/HeroMotion.tsx` (nuevo), `web/src/app/page.tsx` + `page.module.css` | — |
| MV-04 Viajar a una constelación | ✅ | `web/src/components/sky/` | MV-01 |
| MV-05 Área y viaje más naturales | ✅ | `web/src/components/sky/` | MV-04 |
| MV-06 Cámara de viaje natural | 🔨 | `web/src/components/sky/useSkyCamera.ts`, `SkyInteractive.tsx`, `Sky.module.css` | MV-05 |
| MV-03 Revisión y verificación | ⬜ | — | MV-01, MV-02, MV-04 |

### MV-01 — Cielo navegable
El orquestador ya escribió `useSkyCamera.ts` (cámara con `--cam-x/--cam-y/--cam-z` en el escenario, arrastre con inercia, pellizco, ctrl + rueda, botones, `reveal` al enfocar con teclado) y lo conectó en `SkyInteractive.tsx` (envoltura `.camera`, capas `.dust`, controles). Falta el CSS y pulir:
- `.camera`: `position: relative`, `transform: translate(var(--cam-x), var(--cam-y)) scale(var(--cam-z))`, origen al centro; transición de 0.45 s solo con `[data-cam-animate]` en el escenario.
- `.navigable .scene`: `cursor: grab` (`grabbing` al arrastrar), `touch-action: pan-y`; con `[data-zoomed]` → `touch-action: none`. Sin selección de texto al arrastrar.
- `.dust` (dos capas, lejana y cercana): puntos y cuadritos pequeños (SVG en data URI repetido, guiño a ethercoded), `inset` negativo para que no se vean bordes, paralaje con la cámara (lejana ×0.3, cercana ×0.6 de traslado y zoom amortiguado) y deriva lenta propia.
- La tarjeta de la estrella no crece con el zoom: `scale: calc(1 / var(--cam-z, 1))`, `transform-origin: left top`.
- `.controls`: abajo a la derecha del cielo, botones píldora con texto en mayúsculas espaciado (`--font-ui`), foco visible; `.hint` "arrastra para navegar" sutil, oculto en celular si estorba.
- Sin regresiones: un clic o toque en una estrella sigue abriendo/activando como antes; arrastrar desde una estrella no navega; la nebulosa y su señal siguen funcionando; `/musica` (cielo `compact`) no cambia.
**Terminado:** tipos y lint sin errores; el cielo se mueve, acerca, aleja y centra; con movimiento reducido no hay deriva ni transición.

### MV-02 — SUPERNOBA vivo y que se vuelve cielo
- `StarWord` con prop opcional `letters`: cada carácter visible en `<span class="letter">` con `--i` y un desvío pseudoaleatorio determinista `--dx`, `--dy` (sin `Math.random`, para no romper la hidratación). La estrella-brújula también es una letra. Sin `letters` el marcado queda igual (se usa en otras páginas).
- **Al cargar:** las letras se arman desde puntos dispersos (desenfoque y opacidad, escalonado por `--i`), ~1.2 s.
- **En reposo:** un destello lento recorre las letras cada pocos segundos y la estrella gira o pulsa muy despacio. Nada que distraiga al leer.
- **Al bajar:** `HeroMotion` (cliente, sin dependencias) escribe `--hero-p` (0 → 1 mientras el hero sale de la pantalla) en `document.documentElement` con `requestAnimationFrame`. Cada letra se encoge, se desenfoca y se apaga mientras un punto de luz aparece en su centro y viaja hacia abajo y afuera, escalonado: el nombre se deshace en estrellas que caen al cielo. La estrella de la "O" baja hacia el cielo y es la última en irse. El cielo entra con una escala y opacidad leves ligadas a `--hero-p`.
- El valor por defecto deja todo visible: si no corre el JS, el nombre está armado y el cielo opaco.
- Lector de pantalla: sigue leyendo "SUPERNOBA" una vez.
**Terminado:** tipos y lint sin errores; sin desajuste de hidratación; con movimiento reducido el nombre está quieto y completo.

### MV-04 — Viajar a una constelación
Pedido del artista tras probar MV-01: arrastrar y acercar sirve, pero se queda corto. Desde el mapa completo, al elegir una constelación (Música, Proyectos o Literatura) la cámara **viaja** hacia ella.
- **Disparadores (ajuste del artista):** el mapa completo se ve igual que hoy. Cada constelación tiene un **área** suave alrededor de sus estrellas, invisible en reposo; al pasar el mouse o enfocarla se resalta (relleno tenue de su color, borde punteado, brillo) y su nombre se ilumina. En el mapa completo, el clic en el área (también sobre sus estrellas) hace el viaje; las estrellas no abren su obra en esa vista. Cada área es un botón accesible ("Viajar a …"). Sin fila de píldoras.
- **Detalles al llegar:** dentro de la constelación sus estrellas recuperan la tarjeta y el enlace a la obra; las otras quedan atenuadas y sin interacción, pero sus áreas sirven para viajar directo a ellas.
- **Destino:** se calcula en el cliente con la caja de las estrellas de esa constelación en la orientación visible (con margen): centro y zoom para que llene la escena (tope `MAX_ZOOM`). El hook expone `flyTo(fx, fy, z)`.
- **Efecto de viaje (~1.1 s):** la cámara se mueve con una curva suave (no la transición corta de los botones); las capas de polvo se estiran y aceleran (más escala y traslado que la cámara, paralaje exagerado); una capa de estelas radiales sutil (gradiente cónico repetido o similar, centrada en el destino) aparece y se apaga; un desenfoque leve a mitad del viaje. Nada de librerías.
- **Llegada:** las otras constelaciones, hilos y nebulosa se atenúan; aparece el nombre de la constelación en grande (Cinzel) con su faceta y un botón "← mapa completo" (también con Escape) que regresa con el mismo viaje a la inversa. Arrastrar y acercar siguen funcionando estando ahí. Cambiar directo de una constelación a otra con las píldoras viaja entre ellas.
- **Accesibilidad:** las píldoras con `aria-pressed`; al llegar, el foco va al título de la constelación; el anuncio "Viajando a Música" en una región `aria-live`. Con movimiento reducido no hay estelas ni desenfoque: corte directo con un fundido corto.
- `/musica` (cielo `compact`) no cambia.
**Terminado:** tipos y lint sin errores; los tres viajes, el regreso y el cambio entre constelaciones funcionan en escritorio y en celular (orientación vertical).

### MV-05 — Área y viaje más naturales
Ajuste del artista tras probar MV-04: el área con borde punteado y relleno gris se ve fea, y el efecto de viaje parece sobrepuesto.
- **Área:** sin borde ni relleno plano. Al pasar el mouse la constelación se despierta con un aura difusa de su color (forma del área muy desenfocada, opacidad baja), sus líneas y estrellas brillan más y las demás bajan suave.
- **Viaje:** sin estelas fijas al centro ni estirado del polvo. La cámara vuela con `requestAnimationFrame` con un arco de zoom (despega alejándose un poco y se clava en el destino); el polvo la sigue con paralaje exagerado durante el vuelo, así el campo de estrellas pasa en la dirección real del viaje. Las otras constelaciones se desvanecen durante el vuelo y, al llegar, las líneas de la constelación destino se trazan.
**Terminado:** tipos y lint sin errores; movimiento reducido con corte directo.

### MV-06 — Cámara de viaje natural
Ajuste del artista tras probar MV-05: le gusta, pero el movimiento de la cámara se siente raro. Causa: `flyTo` interpola `x`, `y` (píxeles ya escalados por el zoom) y `z` por separado, con dos tramos de zoom pegados en `LIFT_AT`. Así el punto que mira la cámara se desvía y hay un quiebre a un tercio del vuelo.
- **Interpolar lo que se ve:** interpolar el **punto mirado** en fracciones de la escena (`fx`, `fy`, que se derivan de `x/(w·z)`) y el zoom en **escala logarítmica**; recalcular `x`, `y` a partir de ellos en cada cuadro. Así el centro avanza en línea recta y el zoom se siente parejo.
- **Arco de una sola pieza:** el alejamiento es una curva suave y continua (p. ej. `log z = lerp(log z0, log z1, e) − A·sin(π·e)`), con `A` proporcional a la distancia recorrida (en viajes cortos casi no se aleja; en largos, un poco más; tope moderado). Nada de dos tramos.
- **Ritmo:** una sola curva de aceleración suave (inicio y llegada lentos, sin arranque brusco: p. ej. easeInOutSine o una cúbica suavizada). La duración depende de la distancia (~0.9 s a ~1.5 s). La variable `--travel` y el CSS que dependa de la duración deben seguir sincronizados.
- **Lo demás igual:** interrumpir, regresar con Escape o "← mapa completo", cambiar de constelación y movimiento reducido (corte directo) funcionan como hoy.
- Incluye los detalles pendientes de la revisión de MV-05: el `setTimeout` del trazado en un ref (se limpia al iniciar otro viaje, al llegar y al desmontar), `t = Math.max(0, …)` en el cuadro, el botón "centrar" ignora el clic durante un viaje, y el filtro de desenfoque solo en el aura activa.
**Terminado:** tipos y lint sin errores; el centro de la vista viaja en línea recta sin desvíos ni quiebres.

### MV-03 — Revisión y verificación
Reviewer sobre los dos diffs. El orquestador lo revisa en el navegador a 1440 y 390 px: arrastre, zoom, centrar, clic en estrella, nebulosa, scroll del hero, consola limpia y `/musica` sin cambios.

---

## Ajustes del artista tras la fase 4

Revisión de pendientes con el artista (2026-10-28). Esta lista **no toca** los archivos del "Pase de movimiento" (`web/src/components/sky/`, `StarWord`, `web/src/components/home/HeroMotion.tsx`, `web/src/app/page.tsx` + `page.module.css`); lo que dependa de ellos espera a MV-03.

**Decisiones**
- **Jabi deja de ser un portafolio de software**: salen AURA, Diablos AeroVision y RailSense (datos, páginas y capturas). Jabi, "el que piensa", pasa a ser **Proceso**: un diario de cómo nacen las obras (notas, demos, bocetos, detrás de cámaras). La única obra de software que se queda es la web, que se llama **supernobaconb.web** (ya no "Este sitio"). El menú dice "Proceso" y la ruta es `/proceso`; `/proyectos` deja de existir (nunca se publicó). El diario empieza vacío: las entradas llegan con el material del artista o con el admin de la Fase 5.
- **Literatura**: "Libros" en el menú pasa a "Literatura" (las rutas siguen en `/libros`). `/libros` muestra los libros y los **escritos** sueltos (letras, poemas, textos). Un escrito que nace de un libro toma su estética; los demás van en la base radiante.
- **Tienda**: solo links externos, sin pagos propios (decidido).
- **Redes**: TikTok `@supernobaconb` además de Instagram y el correo.
- **Fotos y señal de la nebulosa**: las entrega el artista cuando las edite; se suben con el admin de la Fase 5 (hoy las imágenes se optimizan a WebP con ImageMagick y viven en `web/public/`).
- **Lector viejo**: las funciones que quedaron fuera en la Fase 2 se hacen ahora, compatibles con los datos que ya existen en Firestore (`reactions`, `userReactions`, `subscribers`).

| ID | Tarea | Quién | Depende de | Estado |
|---|---|---|---|---|
| AJ-01 | Jabi como Proceso y la web como supernobaconb.web | Worker | — | ✅ |
| AJ-02 | Literatura: libros y escritos | Worker | AJ-01 | ✅ |
| AJ-03 | TikTok en el pie y en Sobre mí | Worker | AJ-01 | ✅ |
| AJ-04 | "Lo último" y las partes se actualizan a la hora exacta | Worker | — | ✅ |
| AJ-05 | Kit de prensa ligero, sin software y con TikTok | Orquestador | AJ-01, AJ-03 | ✅ |
| AJ-06 | Prueba del lector con cuenta de Google real | Orquestador + artista | — | ⬜ |
| AJ-07 | Resaltados del lector sin repintado innecesario | Worker | — | ✅ |
| AJ-08 | Reacciones por capítulo | Worker | AJ-07 | ✅ |
| AJ-09 | Tarjeta de cita para Instagram | Worker | AJ-08 | ✅ |
| AJ-10 | Descarga de cada parte en PDF | Worker | — | ✅ |
| AJ-11 | Tutorial de primera visita en el lector | Worker | AJ-09, AJ-10 | ✅ |
| AJ-12 | Aviso de newsletter en el lector | Worker | AJ-11 | ✅ |
| AJ-13 | Cielo: etiqueta "Proceso", nebulosa y parpadeo optimizados | Worker | MV-03, AJ-01 | ⛔ |
| AJ-14 | Verificación final | Orquestador | todas | ⬜ |

**Orden y paralelo:** AJ-01, AJ-04, AJ-07 y AJ-10 arrancan juntos (no comparten archivos). AJ-02 y AJ-03 van después de AJ-01 (comparten `site.ts`, `types/content.ts` e `index.ts`). Los del lector (AJ-07 → AJ-08 → AJ-09 → AJ-11 → AJ-12) van en fila porque comparten `web/src/components/reader/`; el botón de PDF de AJ-10 se agrega al lector después de AJ-09. AJ-06 se hace con el artista en cuanto pueda iniciar sesión. Solo un agente corre `npm run build` a la vez.

### AJ-01 — Jabi como Proceso y la web como supernobaconb.web
- **Archivos:** `web/src/types/content.ts`, `web/src/content/` (`works.ts`, `projects.ts`, `threads.ts`, `constellations.ts`, `site.ts`, `index.ts`, `diary.ts` nuevo), `web/src/app/proyectos/` → `web/src/app/proceso/`, `web/src/components/projects/`, `web/src/components/diary/` (nuevo), `web/src/app/sobre-mi/page.tsx`, `web/public/proyectos/`.
- **Terminado cuando:**
  - No queda rastro de AURA, Diablos AeroVision ni RailSense (obras, fichas, capturas).
  - La obra web se llama "supernobaconb.web", con id y ruta `supernobaconb-web` (`/proceso/supernobaconb-web`), y sus hilos siguen funcionando ("construido para el libro…").
  - Tipo `DiaryEntry` (fecha, título, cuerpo en párrafos, imágenes opcionales, obra ligada opcional) y `content/diary.ts` vacío; `/proceso/[slug]` sirve entradas del diario y la página de la web (que conserva capturas y "Conectado con").
  - `/proceso`: faceta "el que piensa", la constelación Jabi sola, la web destacada y el diario; con el diario vacío, una línea honesta sin "Próximamente".
  - Menú "Proceso"; Sobre mí enlaza Jabi a `/proceso`; descripción de la constelación sin "software".
  - `/proyectos` y slugs desconocidos dan 404; tipos, lint y build sin errores.

### AJ-02 — Literatura: libros y escritos
- **Archivos:** `web/src/types/content.ts` (tipo `escrito`), `web/src/content/writings.ts` (nuevo), `web/src/content/index.ts`, `web/src/content/site.ts` (etiqueta del menú), `web/src/app/libros/page.tsx` (+ css), `web/src/app/libros/escritos/[slug]/` (nuevo), `web/src/components/literature/` (nuevo).
- **Terminado cuando:**
  - Menú "Literatura" → `/libros`, con encabezado "Literatura" y la faceta "el que escribe".
  - `/libros` muestra los libros (hoy BDUEM, con su polaroid y enlace) y una sección "Escritos" que solo aparece si hay escritos.
  - Un escrito (letra, poema o texto) tiene título, fecha, tipo y cuerpo (estrofas o párrafos), y su página `/libros/escritos/[slug]` con 404 real; si nace de un libro toma su estética, si no la radiante. Los escritos son obras de noba, así que aparecen solos en el cielo.
  - Verificado con un escrito de prueba que **no** se queda en el repositorio.

### AJ-03 — TikTok en el pie y en Sobre mí
- **Archivos:** `web/src/content/site.ts`, `web/src/components/layout/SiteFooter.tsx`, `web/src/app/sobre-mi/page.tsx`.
- **Terminado cuando:** TikTok (`https://www.tiktok.com/@supernobaconb`) aparece en el pie con un ícono de trazo fino como los demás y en el contacto de Sobre mí.

### AJ-04 — "Lo último" y las partes se actualizan a la hora exacta
- **Archivos:** `web/src/lib/schedule.ts` (nuevo) y los componentes que hoy usan `cacheLife("hours")` para decidir qué está publicado (`components/home/LatestRelease.tsx`, `components/era/BduemEra.tsx`, los del lector que leen la publicación, `components/music/Discography.tsx`).
- **Terminado cuando:** el caché de esas piezas vence justo en la siguiente fecha de publicación conocida (o en horas si no hay ninguna próxima), según la guía de `cacheLife` de Next 16; una parte o un sencillo aparece como publicado en la primera visita después de su fecha. Probado con una fecha de prueba cercana que no se queda en el repositorio.

### AJ-05 — Kit de prensa ligero, sin software y con TikTok
- **Terminado cuando:** cada PDF pesa menos de 1.5 MB (imágenes reducidas al tamaño en que se imprimen), abre rápido, ya no lista proyectos de software (la web se menciona solo en la bio) y trae TikTok.

### AJ-06 — Prueba del lector con cuenta de Google real
- **Cómo:** el artista inicia sesión en el navegador integrado (la contraseña la escribe él). El orquestador prueba que resaltado, cita, marcador y progreso se guardan en la cuenta; que al recargar y en otra pestaña siguen; que lo guardado sin sesión se sube al entrar sin duplicarse; y que al cerrar sesión no queda nada del usuario en pantalla.
- **Terminado cuando:** todo lo anterior funciona o sus fallas quedan corregidas (con worker y reviewer).

### AJ-07 — Resaltados del lector sin repintado innecesario
- **Archivos:** `web/src/components/reader/*` (resaltados).
- **Terminado cuando:** cambiar letra, interlineado o modo no vuelve a calcular los rangos de todos los resaltados; solo se recalculan cuando cambia la lista o el texto. Medido antes y después.

### AJ-08 — Reacciones por capítulo
- **Archivos:** `web/src/lib/reader/reactions.ts` (nuevo), `web/src/components/reader/*`.
- **Terminado cuando:** al final de cada capítulo hay cuatro reacciones (corazón, triste, mente volada, estrella) con su conteo, dibujadas con íconos de trazo fino en blanco; leen y escriben `reactions/{parte}_{capítulo}` y `userReactions/{id}_{parte}_{capítulo}` como el sitio viejo (mismo id local `userId`); una reacción por persona y capítulo, que se puede cambiar; conteos en vivo; sin errores si Firebase no responde.

### AJ-09 — Tarjeta de cita para Instagram
- **Archivos:** `web/src/components/reader/*` (menú de selección y panel de citas), `web/src/lib/reader/quoteCard.ts` (nuevo).
- **Terminado cuando:** "Compartir" en una selección o en una cita guardada abre la vista previa de una imagen de 1080×1920 (negro, polvo de estrellas, la cita en Cormorant, el título de la parte en Uncial, BRILL✦ DE UNA ESTRELLA MUERTA y "supernobaconb") con dos o tres variantes monocromas; se comparte con la API del navegador (como archivo) o se descarga. Hecha con canvas, sin dependencias nuevas, esperando a que carguen las fuentes.

### AJ-10 — Descarga de cada parte en PDF
- **Archivos:** `web/src/app/libros/bduem/leer/[parte]/pdf/route.ts` (nuevo), `web/src/lib/book/pdf.ts` (nuevo), fuentes en `web/src/lib/book/fonts/` (licencia OFL), `web/package.json` (solo `pdf-lib` y `@pdf-lib/fontkit`), y el botón en el lector después de AJ-09.
- **Terminado cuando:** cada parte publicada se descarga como PDF generado del mismo texto de Firestore (portada con el título, capítulos con títulos en Uncial y texto en Cormorant, números de página), en caché; una parte no publicada o inexistente da 404.

### AJ-11 — Tutorial de primera visita en el lector
- **Terminado cuando:** la primera vez que alguien abre el lector ve una guía corta (3–5 pasos: seleccionar para resaltar o citar, compartir, marcador, ajustes "Aa", descargar PDF) que se puede saltar, no vuelve a salir (guardado en el navegador, con `useHydrated` para no romper la hidratación) y se puede reabrir desde el panel "Aa".

### AJ-12 — Aviso de newsletter en el lector
- **Archivos:** `web/src/lib/newsletter.ts` (nuevo), `web/src/components/reader/*`.
- **Terminado cuando:** al terminar una parte aparece un aviso discreto "¿Quieres enterarte cuando salga algo nuevo?" que pide iniciar sesión con Google y guarda `subscribers/{uid}` compatible con el sitio viejo (`email`, `displayName`, `subscribedAt`, `notifyFor`) más `interests: ["libro"]`; si ya está suscrito, lo dice; se puede cerrar y no insiste.

### AJ-13 — Cielo: etiqueta "Proceso", nebulosa y parpadeo optimizados
- **Bloqueada** hasta que termine el Pase de movimiento (MV-03), porque toca `web/src/components/sky/`.
- **Terminado cuando:** la píldora de Jabi dice "Proceso"; la nebulosa no recalcula su filtro en cada cuadro (por ejemplo, con una imagen pre-renderizada o un filtro estático) y el parpadeo usa solo `opacity`/`transform`, se pausa fuera de pantalla y con la pestaña oculta; medido con el rendimiento del navegador con CPU ralentizada, antes y después.

### AJ-14 — Verificación final
- **Terminado cuando:** tipos, lint y build sin errores; en producción las rutas nuevas dan 200 y las quitadas 404; el lector y sus funciones nuevas probados en el navegador a 1440 y 390 px; plan y tablero actualizados.

---

## Fases siguientes (se detallan al empezar)

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
| 2026-10-25 | F3 | Artista: letras públicas y material listo (letras, créditos, audios y portadas). Se detallan F3-01 a F3-07 y se crea `web/materiales/musica/` (ignorada por git) para la entrega. |
| 2026-10-25 | F3-02 | Worker hizo `SpotifyEmbed` y `YouTubeEmbed` con fachada (iframe solo al pulsar, IDs validados, `youtube-nocookie`, foco al iframe). Reviewer: solo bajas; el orquestador agregó `referrerPolicy`, enlace de respaldo solo `https` y más contraste en el tipo. La revisión visual queda para F3-04, donde se usan. ✅ |
| 2026-10-25 | F3-03 | Worker hizo `/musica`: constelación Supernoba sola (opción `only` en `Sky`, sin selector de eras, línea de tiempo ni nebulosas) y lista de sencillos con portada, fecha, era, canciones, "Escuchar" y plataformas; obras por publicar apagadas. Reviewer: sin problemas en el cielo de la portada; el orquestador corrigió el nombre accesible de los enlaces a plataformas. Verificado en el navegador a 1440 y 390 px, y la portada sin cambios. Para revisar con el artista: en escritorio "Constelación" muestra el cielo y la lista, y "Lista" oculta el cielo. ✅ |
| 2026-10-25 | F3 | Artista: los audios del reproductor propio no llevan etiqueta de "adelanto" o "exclusiva"; se quita `audio.txt` de la entrega. |
| 2026-10-25 | F3-01 | El artista entregó letras, créditos, audios (MP3, WAV de 86 MB y FLAC) y portadas en PNG de 3500 px. El orquestador convirtió los audios a MP3 de 128 kbps (2.7, 3.9 y 2.6 MB; duraciones iguales a Spotify) y las portadas a WebP de 1400 px (175 y 231 KB) más JPEG de 512 px, sin instalar nada en el sistema. Worker pasó letras por estrofas, créditos, audios y portadas a los datos; el reproductor y la sesión de medios usan la portada real. Orquestador comprobó que las 96 líneas de letra coinciden con los archivos del artista y, en el navegador, que "Escuchar" en `/musica` reproduce el audio propio y sigue sonando al navegar. Sin reviewer: cambio de datos verificado línea por línea. ✅ |
| 2026-10-25 | F3-06 | Worker hizo el reproductor a pantalla completa (diálogo modal en portal, resto de la página inerte, Escape, botón y gesto hacia abajo; escritorio: portada, controles y cola a la izquierda y letra a la derecha; celular: una columna con pestañas Letra / Cola). Reviewer: aprobada; el orquestador agregó la cancelación del gesto. Verificado en el navegador a 1440 y 390 px: la letra se ve, Escape cierra, el foco vuelve y la música no se corta. ✅ |
| 2026-10-25 | F3-04 | Worker hizo la página de sencillo en el tema BDUEM: portada a color con marco, título con la estrella, canciones con reproducir y la que suena marcada, embeds con fachada y "Conectado con" desde los hilos (part3 → Parte 3 del libro). Reviewer: aprobada; el orquestador agregó `aria-current`. Verificado a 1440 y 390 px. Para revisar con el artista: un video de YouTube grande por canción. ✅ |
| 2026-10-25 | F3-05 | Worker hizo `Lyrics` y `Credits` (servidor, letra en el HTML con ancla por canción, créditos en `dl`, enlace "Letra" en la lista). Orquestador lo revisó a 1440 y 390 px: agregó margen lateral en celular y ajustó el ancla a la altura del header. Sin reviewer: componente de presentación verificado en el navegador. ✅ |
| 2026-10-25 | F3-07 | Verificación del orquestador: tipos, lint y build sin errores; en producción `/musica`, `/musica/rulos` y `/musica/nohablobien-part3` dan 200, `/musica/nada` 404, audios y portadas 200; el HTML trae las letras y el enlace a la Parte 3 y ningún iframe; en el navegador, antes de pulsar solo se piden miniaturas de `i.ytimg.com`, y Spotify carga al pulsar. Consola limpia. Servidor de prueba detenido. **Fase 3 terminada.** Para revisar con el artista: un video grande por canción en la página del sencillo y el selector Constelación/Lista de `/musica`. ✅ |
| 2026-10-25 | F3 | Ajustes pedidos por el artista: en la página del sencillo se ven hasta dos videos y, si hay más, un botón "Ver más videos (N)" muestra el resto; en `/musica` se quita el selector Constelación/Lista (siempre se ven los dos, el cielo arriba en escritorio y la lista primero en celular). Verificado en el navegador. |
| 2026-10-25 | — | Pedido del artista: la portada no debe dejar ver que viene una nueva era. Worker quitó del cielo el selector de eras, "Ver como lista" y la línea de tiempo (que mostraba una segunda franja), y borró `SkyList`, `Timeline` y `eraTimeline`. El orquestador hizo que la nebulosa viaje con un nombre neutro (`nebulosa-1`) en vez del id de su era. Se conserva la nebulosa con su señal. Verificado en el navegador a 1440 y 390 px y que el HTML de `/` no contiene "era-2". |
| 2026-10-25 | — | Decisión del artista: las eras no se presentan como "eras" en el sitio, quedan implícitas en el mapa y la estética. Orquestador quitó "ERA · … · EN ÓRBITA" de la página del libro, "Era …" de la página del sencillo (ahora solo el libro, con enlace), "guiño a la era" → "guiño al libro", y borró la ruta `/eras/[slug]` (`/eras/bduem` y `/eras/era-2` dan 404). Verificado: ninguna página muestra la palabra "era" salvo el propio texto del libro. Plan e identidad visual actualizados. |
| 2026-10-25 | F2-07 | El artista vio un error de Next en `/libros/bduem/leer/parte-N`: desajuste de hidratación cuando hay progreso guardado. `ReaderDataProvider` (fuera del `Suspense`) se hidrata antes que el lector y, al hidratar `ReaderShell`, el aviso "Continuar donde te quedaste" ya aparecía en el cliente y no en el servidor. El orquestador lo condicionó a `useHydrated`. Verificado en el navegador con progreso, preferencia de modo páginas y un resaltado guardados: sin errores en las 4 partes y "Continuar" lleva al punto guardado. ✅ |
| 2026-10-25 | F4 | Artista: proyectos elegidos de su GitHub (AURA, Diablos AeroVision, RailSense, además de *Este sitio*), fotos del sitio viejo y de su kit de prensa, tienda solo con el libro físico (Amazon), kit de prensa a mejorar en español e inglés, contacto por Instagram y un correo que aún falta. Se detallan F4-01 a F4-10. |
| 2026-10-25 | F4-03 | Worker sacó "Conectado con" a `lib/connections.ts` + `components/works/Connections` (todos los tipos de hilo, incluido `construye` en los dos sentidos) y la página del libro solo muestra obras con hilo. Reviewer: aprobada; el orquestador confirmó que Rulos sigue en la página del libro. ✅ |
| 2026-10-25 | — | Pedido del artista: la estrella en la "O" solo en SUPERNOBA y en el título de BDUEM. `StarWord` ya no la pone en otros textos (sencillos, otras partes del libro). Verificado en portada, libro, lector y sencillos; identidad visual actualizada. |
| 2026-10-25 | F4-01 | Orquestador: capturas reales de los cuatro proyectos (este sitio y la app pública de AeroVision con Chrome sin ventana por CDP, AURA de su reporte de usabilidad, RailSense de su repositorio) y fotos del kit, en WebP ≤ 250 KB. ✅ |
| 2026-10-25 | F4-02 | Worker hizo tipos y datos (proyectos con textos de sus README, videos derivados de las canciones, 21 fotos con medidas reales, el libro impreso, `site.instagram`). El orquestador vio que el aviso "Nuevo" mostraba Diablos AeroVision y limitó "lo último" a música y libros; llenó las capturas. Reviewer: aprobada. Cielo con cuatro estrellas en Jabi sin encimarse. ✅ |
| 2026-10-25 | F4-08 | Orquestador: bio corta, media y larga en español e inglés (`content/bio.ts`, borrador para aprobar) y kit de prensa en PDF de dos páginas por idioma con la identidad del sitio, más ZIP de fotos y portadas en alta. Generadores en `web/materiales/prensa/` (fuera de git) para rehacerlo cuando llegue el correo de prensa. ✅ |
| 2026-10-25 | F4-04 | Worker hizo `/proyectos`: constelación Jabi y lista con número, nombre, tagline, año, rol, logro con ✦ cálido, stack y miniatura. Orquestador lo revisó a 1440 y 390 px y recortó a proporción fija las miniaturas casi cuadradas. Sin reviewer (presentación verificada en el navegador). ✅ |
| 2026-10-25 | F4-07 | Worker hizo `/tienda`: el libro impreso como pieza editorial con polaroid, "Comprar en Amazon" (pestaña nueva) y "Leer en línea". Verificado por el orquestador a 1440 y 390 px. ✅ |
| 2026-10-25 | F4-05 | Worker hizo el `Lightbox` (diálogo nativo, teclado, gestos, B/N opcional) y `/videos` (tres videoclips con fachada y 21 fotos en polaroids). Reviewer pidió correcciones (clic de fondo tras arrastre, `onClose` doble, foco al desmontar, pie repetido); aplicadas. El orquestador hizo que la imagen del visor cargue de inmediato. Verificado en el navegador: abre, flechas, Escape, foco devuelto, sin scroll horizontal a 390 px. ✅ |
| 2026-10-25 | F4-06 | Worker hizo `/proyectos/[slug]` en base radiante: encabezado, acciones (demo, video, repositorio o "Código privado"), capturas que abren el visor a color, puntos clave, stack y "Conectado con"; 404 real. El orquestador puso las capturas de celular de AURA en una sola fila y corrigió un texto alternativo. Verificado a 1440 y 390 px; build sin errores. ✅ |
| 2026-10-25 | F4-09 | Worker hizo `/sobre-mi`: retrato en polaroid vertical, SUPERN✦BA, las tres facetas enlazadas, bio larga, fotos con el visor, descargas del kit (PDF español e inglés y ZIP, con tamaño) y contacto (Instagram; el correo aparece solo si existe `site.pressEmail`); Instagram en el pie. Verificado por el orquestador a 1440 y 390 px. ✅ |
| 2026-10-25 | F4-10 | Verificación del orquestador: tipos, lint y build sin errores. En producción (`next start` en el puerto 3100, ya detenido) `/proyectos`, los cuatro proyectos, `/videos`, `/tienda`, `/sobre-mi` y los tres archivos de prensa dan 200; `/proyectos/nada` y `/proyectos/puzzles-0618am` 404; ninguna página nombra eras ni tiene `iframe` o correo en el HTML; en `/videos` antes del clic solo hay peticiones al propio sitio (miniaturas por el optimizador); consola limpia. Se detuvieron dos servidores de prueba que dejaron los workers (3123 y 3124). Pendiente del artista: aprobar la bio y el kit, dar el correo de prensa y decidir si el repositorio de AURA se hace público. **Fase 4 terminada.** ✅ |
| 2026-10-28 | — | El artista dio el correo de prensa (supernoba.contacto@gmail.com) y escribió su biografía. Sobre mí usa su texto tal cual en primera persona (introducción, Literatura, Música, Desarrollo y cierre); el kit de prensa y los metadatos usan una versión en tercera persona en español e inglés hecha a partir de ese texto. Kit regenerado con el correo. Verificado en el navegador a 1440 y 390 px. |
| 2026-10-28 | AJ | Revisión de pendientes con el artista: Jabi pasa de proyectos de software a Proceso (diario), la web se llama supernobaconb.web, Libros pasa a Literatura con escritos, tienda solo con links, TikTok, y se hacen las funciones del lector viejo, la prueba con Google y las optimizaciones. Se detallan AJ-01 a AJ-14. |
| 2026-10-28 | AJ-01 | Worker quitó AURA, AeroVision y RailSense; la web pasó a supernobaconb.web en `/proceso/supernobaconb-web`; `/proceso` con la constelación Jabi, la web destacada y el diario (vacío, con una línea honesta). Verificado en el navegador. Pendiente en AJ-13: la píldora del cielo aún dice "Proyectos". ✅ |
| 2026-10-28 | AJ-07 | Worker quitó letra, interlineado y modo de las dependencias del cálculo de resaltados. Orquestador midió en el navegador: 0 recálculos de rangos tras cinco cambios, y el resaltado sigue dibujado. ✅ |
| 2026-10-28 | AJ-10 | Worker hizo `/libros/bduem/leer/parte-N/pdf` con `pdf-lib` + `fontkit` (A5, portada, capítulos en Uncial, texto en Cormorant, números de página; 80–274 KB por parte), 404 en partes no publicadas. Orquestador agregó `outputFileTracingIncludes` para las fuentes y revisó el PDF. ✅ |
| 2026-10-28 | AJ-02/03 | Worker hizo Literatura (`/libros` con el libro y escritos cuando existan, `/libros/escritos/[slug]` con su estética según el libro del que nacen; probado con un escrito temporal ya quitado) y TikTok en el pie y en Sobre mí. Tocó una línea de `sky/meta.ts` (etiqueta del tipo nuevo) por los tipos. ✅ |
| 2026-10-28 | AJ-04 | Worker hizo `lib/schedule.ts`: el caché de lo que depende de fechas vence en la siguiente publicación (`expire` en la fecha, `revalidate` un segundo antes) y envolvió esas piezas en `Suspense`. En `next dev` la primera visita tras la fecha aún vio la copia vieja (dev retiene al menos 300 s); se confirma en producción en AJ-14. ✅ |
| 2026-10-28 | — | Pedido del artista: botón de cerrar sesión y de descargar el PDF en el lector. El panel "Mis citas y marcadores" muestra la sesión con "Salir" y la barra tiene el ícono de descarga. |
| 2026-10-28 | AJ-08 | Worker hizo las reacciones (`reactions` / `userReactions` con el `userId` local del sitio viejo, transacción e `increment`, en vivo). Orquestador lo probó en el navegador con los conteos reales del sitio viejo (11 → 12 → 11). ✅ |
| 2026-10-28 | AJ-05 | Orquestador: el kit bajó de 6 MB a 0.5 MB por PDF (imágenes al tamaño impreso y polaroids con marco y giro dibujados en JPEG, porque Chrome rasterizaba las giradas), sin la lista de software, con TikTok y etiquetas "Música · Literatura". ✅ |
| 2026-10-28 | AJ-09 | Worker hizo la tarjeta de cita en canvas (Noche, Papel y Polaroid) con vista previa, compartir como archivo y descargar. Orquestador la revisó en el navegador: fuentes reales y la estrella en BRILL✦. ✅ |
| 2026-10-28 | AJ-11/12 | Worker hizo la guía de primera visita (5 pasos que señalan marcador, Aa y descarga; se marca con `hasSeenTutorial`; "Ver la guía otra vez" en Aa) y el aviso de novedades al final de cada parte (`subscribers/{uid}` con `merge`, compatible con el sitio viejo, más `interests`). Orquestador lo revisó en el navegador. ✅ |
| 2026-10-28 | — | Pedido del artista: en la tarjeta de cita el título va en dos líneas sin la estrella y con @supernobaconb. El orquestador hizo además el header negro sólido en el lector (el texto se asomaba debajo del degradado). |
