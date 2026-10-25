# Plan: de la página de BDUEM a un sitio de artista

> El sitio actual muestra solo el libro *Brillo de una Estrella Muerta*. La meta es convertirlo en una página de artista donde el libro sea una obra más, junto con la música, los videos y la tienda.

---

## 1. Decisiones tomadas

| Tema | Decisión |
|---|---|
| Tecnología | **Next.js** (App Router) + TypeScript. Reemplaza a Create React App, que ya está abandonado |
| Backend | Se queda en **Firebase**: Auth (Google), Firestore, Storage, y **App Hosting** para Next.js |
| Estética | **Una estética por era**, sobre una base neutra en forma de **cielo con constelaciones** |
| Música | **Ambos**: reproductor propio (adelantos y exclusivas) + embeds y links a plataformas |
| Secciones | Música, Libro, Sobre mí, Videos / galería, Tienda / merch, Newsletter / comunidad |
| Repositorio | Mismo repo, rama nueva. El sitio actual sigue en línea hasta el cambio |

---

## 2. Concepto: constelaciones, obras, eras e hilos

El sitio se organiza en dos ejes que se cruzan:

- **Por ámbito** (el espacio): tres constelaciones, una por cada faceta del artista.
- **Por era** (el tiempo): etapas que atraviesan las tres constelaciones y conectan todo lo hecho en ese momento.

### Las tres constelaciones (por ámbito)
| Constelación | Faceta | Qué contiene |
|---|---|---|
| **Jabi** | el que piensa | Proyectos de software, herramientas, experimentos, puzzles y secretos (`/0618am`) |
| **noba** | el que escribe | BDUEM y los libros o textos que vengan |
| **Supernoba** | el que canta | Sencillos, EPs, discos y videos |

### Obras (las estrellas)
Cada cosa que haces es una **obra** y es una estrella dentro de su constelación. Cada obra tiene:

- Nombre, slug, constelación y tipo (`libro` | `parte` | `sencillo` | `ep` | `album` | `video` | `proyecto` | `puzzle`)
- Fecha (si es futura, aparece como "por publicar")
- Portada e imágenes
- Era a la que pertenece
- Links (plataformas, tienda, repositorio, demo)
- Contenido propio: canciones, capítulos, capturas, etc.

### Eras (un libro por era)
Cada era nace de **un libro** y lleva su nombre. La primera es la **era BDUEM**.

- **El libro es el núcleo** de la era: la estrella central.
- **Las demás obras orbitan alrededor**: las canciones, videos o proyectos que salen de ese libro pertenecen a su era, aunque sean "aparte" del libro. Por ejemplo, Rulos y nohablobien / part3 son de la era BDUEM.
- **Una obra pertenece a la era del libro del que nace**, no a la fecha en que sale. Si una canción de BDUEM se publica cuando ya se está escribiendo el segundo libro, sigue siendo de la era BDUEM.
- La era define el **tema visual**: colores, tipografía, fondo, textura y animación de entrada. Al entrar a cualquier obra, el sitio toma el tema de su era. Una obra puede ajustar detalles, pero hereda la estética de su era.

#### Las eras se superponen
El proceso es: primero se escribe el libro, luego vienen las canciones, y mientras se graban ya se está escribiendo el siguiente libro. Por eso las eras **no son periodos consecutivos**, sino que se enciman en el tiempo.

Cada era pasa por fases que siguen el ciclo de vida de una estrella:

| Fase | Qué pasa | Cómo se ve en el sitio |
|---|---|---|
| **Nebulosa** | El libro se está escribiendo | Una nube tenue que deja ver solo una **señal** pequeña (ver abajo) |
| **Encendida** | El libro se publica | La estrella central brilla y la era toma la portada |
| **En órbita** | Salen canciones, videos y proyectos de la era | Las obras satélite aparecen alrededor del libro |
| **Cerrada** | La era termina | Se queda en el cielo, más tenue, con todas sus obras |

Estado actual:
- **Era BDUEM**: *en órbita*. El libro ya salió, hay canciones escritas, algunas grabadas y dos sencillos publicados.
- **Era 2**: *nebulosa*. El segundo libro se está escribiendo.

#### Señales de una nebulosa
Mientras una era es nebulosa, no se revela su nombre ni su contenido. Solo muestra **una señal**, algo pequeño que se puede cambiar con el tiempo:

- un video corto con efecto glitch
- una frase
- una imagen

Al hacer clic en la nebulosa, la señal aparece por un momento, como una transmisión interceptada. Las señales anteriores pueden quedar guardadas como un archivo que se completa cuando la era se enciende.

#### A qué era pertenece cada obra
- **Si nace de un libro**: a la era de ese libro, aunque salga después.
- **Si no nace de ningún libro** (por ejemplo, un proyecto de software): a la **era encendida más reciente** cuando se hizo. Hoy eso es la era BDUEM, porque la era 2 todavía es nebulosa.

Al usar el ciclo de vida de una estrella, cada era repite a pequeña escala lo que cuenta BDUEM (Nebulosa → Gigante Roja → Supernoba → Enana Blanca).

### Hilos (conexiones entre obras)
Los **hilos** unen obras específicas, incluso de constelaciones distintas, y dicen cómo se relacionan:

- `inspira`: una obra nace de otra
- `continúa`: una obra sigue la historia de otra
- `comparte universo`: personajes, símbolos o ideas en común
- `guiño`: pequeñas referencias a otra obra, sin relación directa (se dibuja más tenue que los demás hilos)
- `construye`: un proyecto de software hecho para otra obra (por ejemplo, este sitio y el lector de BDUEM)

Primer hilo confirmado: **BDUEM Parte 3 (Supernoba)** → `inspira` → **la canción part3**. La letra está inspirada en esa parte del libro.

En la página de cada obra aparece una sección *"Conectado con"* con sus hilos.

### El cielo (base neutra y navegación)
La portada es un **mapa del cielo** con las tres constelaciones.

- **Líneas de constelación**: unen las obras de un mismo ámbito, en orden cronológico.
- **Hilos**: líneas distintas (por ejemplo, punteadas o de luz) que cruzan entre constelaciones.
- **Vista por era**: al elegir una era, su libro y las obras que orbitan a su alrededor se encienden en las tres constelaciones y el resto se atenúa.
- **Línea de tiempo**: abajo del cielo, cada era es una franja con sus fases; las franjas se enciman cuando las eras se superponen (por ejemplo, la era BDUEM en órbita mientras la era 2 es nebulosa).
- **Nebulosas**: las eras en escritura aparecen como nubes tenues en el cielo, sin revelar todavía su contenido.
- **Brillo por fecha**: lo más nuevo brilla más; lo anterior se ve más tenue, como estrellas lejanas (guiño al título del libro).
- **Estrellas por publicar**: punto apagado o silueta con cuenta regresiva (como las fechas de publicación de las partes de hoy).
- **Estrellas ocultas**: llevan a secretos, como los puzzles de `/0618am` o canciones exclusivas.
- **Al pasar el cursor**: nombre y portada. **Al hacer clic**: transición hacia la era.

### Lo que hay que cuidar
- **Celular**: el mapa se convierte en una lista o un carrusel deslizable de estrellas.
- **Acceso directo a lo último**: un bloque visible por encima del mapa ("Nuevo: …") para quien llega desde Instagram y solo quiere escuchar lo nuevo.
- **Accesibilidad**: todas las estrellas también se pueden recorrer con el teclado y existe una lista de texto equivalente.

---

## 3. Mapa del sitio

| Ruta | Qué muestra |
|---|---|
| `/` | Acceso directo a lo último + mapa del cielo + videos recientes + newsletter |
| `/musica` | Discografía (vista de constelación y vista de lista) |
| `/musica/[slug]` | Disco o sencillo con su tema: canciones, embeds, reproductor propio, créditos, letras |
| `/libros` | Obras escritas |
| `/libros/bduem` | Página del libro con su estética espacial actual |
| `/libros/bduem/leer/[parte]` | El lector actual (KindleReader) migrado |
| `/proyectos` y `/proyectos/[slug]` | Constelación Jabi: proyectos de software con stack, capturas, repositorio y demo |
| `/eras/[slug]` | Una era: todas sus obras de las tres constelaciones y los hilos entre ellas |
| `/videos` | Videoclips y galería de fotos |
| `/tienda` | Merch, libro físico, discos |
| `/sobre-mi` | Biografía, fotos y kit de prensa descargable |
| `/0618am`, `/0618am/030806` | Puzzles (se quedan igual) |
| `/admin` | Panel ampliado |

**Redirecciones** de los links viejos:
- `/parte1` … `/parte4` → `/libros/bduem/leer/parte-1` … `parte-4`
- `/pruebas` se elimina

---

## 4. Componentes clave

### Reproductor persistente
- Vive en el layout raíz de Next.js, así que **la música sigue sonando al cambiar de página**.
- Mini reproductor fijo abajo, que se expande a pantalla completa con la portada.
- Cola de reproducción, siguiente / anterior, barra de progreso, volumen.
- Toma los colores de la era de la canción que suena.
- Audio en Firebase Storage (o Cloudinary, que ya se usa para imágenes).
- Las canciones publicadas en plataformas muestran embed y botones; el reproductor propio es para adelantos y exclusivas.

### Sistema de temas por era
- Variables CSS (`--era-bg`, `--era-fg`, `--era-accent`, `--era-font`, …) definidas por un componente `<EraTheme>` en cada ruta de era.
- La base neutra (el cielo) es el tema por defecto.
- Transición suave entre temas al navegar.

### Vista previa al compartir
- Cada era y cada canción generan su propia imagen y título para Instagram, WhatsApp y X (Open Graph), con la portada y los colores de la era.

---

## 5. Datos (Firestore)

| Colección | Contenido |
|---|---|
| `constellations` | Jabi, noba, Supernoba: nombre, faceta, color base, posición en el cielo |
| `works` | Obras: constelación, tipo, era, fecha, portada, links, posición en el cielo |
| `eras` | Nombre, libro central, fase actual (nebulosa / encendida / en órbita / cerrada), fechas de cada fase, descripción y **tema visual** |
| `threads` | Hilos: obra origen, obra destino, tipo de relación, nota opcional |
| `signals` | Señales de una era nebulosa: tipo (video / frase / imagen), contenido, fecha, si está activa |
| `tracks` | Canción: obra (sencillo/disco), número, duración, audio propio (opcional), links, letra, créditos |
| `projects` | Detalle de proyectos de software: stack, repositorio, demo, capturas |
| `videos` | Título, era, link de YouTube, miniatura |
| `products` | Producto: nombre, imagen, precio, link externo de compra |
| `subscribers` | Se reutiliza; se agregan **intereses**: `musica`, `libro` |
| Libro (actual) | Partes, capítulos y notas del autor se mantienen y se ligan a la era `bduem` |

Datos de usuario actuales (resaltados, citas, marcadores, progreso) se conservan tal cual.

---

## 6. Fases

### Fase 1 — Base
- [x] Crear el proyecto Next.js en una rama nueva y conectar Firebase
- [x] Sistema de temas por era y tema base (cielo)
- [x] Menú, pie de página y layout raíz
- [x] **Portada**: acceso directo a lo último + mapa del cielo con las tres constelaciones, hilos y vista por era (con versión para celular)
- [x] Reproductor persistente (versión inicial)
- [x] Contenido de relleno donde aún falten datos
- [x] **Recorrido de diseño con el artista** (resultado: [IDENTIDAD-VISUAL.md](IDENTIDAD-VISUAL.md)): revisar juntos el sitio en el navegador, anotar qué funciona y qué no, y ajustar tipografía, espacios, colores y la composición de la portada

### Fase 2 — Libro
- [x] Migrar el lector (paginado y vertical), resaltados, citas, marcadores y notas del autor
- [x] Página de la era BDUEM con su estética espacial
- [x] Publicación escalonada y redirecciones de `/parteN`
- [x] Migrar los puzzles
- Quedan para después: reacciones, tarjeta de cita para Instagram, descarga en PDF, tutorial y aviso de newsletter del lector viejo

### Fase 3 — Música
- [ ] Discografía (constelación + lista)
- [ ] Página de disco/sencillo con tema propio, embeds y reproductor
- [ ] Letras y créditos

### Fase 4 — Jabi, videos, tienda y sobre mí
- [ ] Página de proyectos de software y detalle de cada proyecto
- [ ] Páginas de era y sección "Conectado con" en cada obra
- [ ] Galería de videos y fotos
- [ ] Tienda con links externos (pagos integrados más adelante si hace falta)
- [ ] Biografía y kit de prensa

### Pase de diseño con materiales reales
Se hace cuando lleguen las portadas, fotos y la estética de cada era; si llegan antes, se adelanta.
- [ ] Reemplazar portadas generadas y textos de relleno por el material real
- [ ] Ajustar el tema de cada era (colores, tipografía, fondo) a su estética definitiva
- [ ] Revisar la portada, el cielo y las páginas de obra con imágenes reales, en escritorio y celular

### Fase 5 — Admin ampliado
- [ ] Gestión de obras, eras (con editor de tema) e hilos, y posición de cada estrella en el cielo
- [ ] Gestión de canciones (subida de audio), videos y productos
- [ ] Newsletter con intereses y exportación CSV

### Fase 6 — Publicación
- [ ] Vistas previas para links compartidos y ajustes para Google (metadatos, sitemap)
- [ ] Revisión de rendimiento y accesibilidad
- [ ] Actualizar reglas de Firestore y Storage
- [ ] Despliegue en Firebase App Hosting y cambio del sitio actual

---

## 7. Datos del artista

### Nombre e identidad
- Nombre artístico: **Supernoba**
- Bio actual (Spotify): *"Jabi el que piensa, noba el que escribe y Supernoba el que canta."*

Las tres facetas son las tres constelaciones del cielo (ver sección 2). Jabi incluye también el trabajo como desarrollador de software.

### Plataformas
| Plataforma | Link |
|---|---|
| Spotify | https://open.spotify.com/artist/3DYjzvSLoweDPSqo7hJUMb |
| Apple Music | https://music.apple.com/es/artist/supernoba/1885508885 |
| YouTube | https://www.youtube.com/@supernobaconb |
| Playlist del artista | [si noba se vuelve realidad](https://open.spotify.com/playlist/1Iq2f9Kj9EyHxFluGJpEKj) |

### Lanzamientos (todos de 2026, distribuidos por Too Lost)

**Rulos** — sencillo (13 de marzo de 2026)
| # | Canción | Duración | Spotify | YouTube |
|---|---|---|---|---|
| 1 | Rulos | 2:47 | [track](https://open.spotify.com/track/3opJtdXpDlA3PiqjjTd3zK) | [video](https://www.youtube.com/watch?v=xeutQrT_9Zo) |

- Spotify: https://open.spotify.com/album/3vixCWmufO5Wv8LcvefZGw
- Apple Music: https://music.apple.com/es/album/rulos-single/1882648270
- Smart link: https://too.fm/m5ydxrq

**nohablobien / part3** — sencillo de 2 canciones (4 de junio de 2026)
| # | Canción | Duración | Spotify | YouTube |
|---|---|---|---|---|
| 1 | nohablobien | 4:05 | [track](https://open.spotify.com/track/3r4nCGugc02JGQX7Hdd45r) | [video](https://www.youtube.com/watch?v=oiI7JcII8VI) |
| 2 | part3 | 2:42 | [track](https://open.spotify.com/track/3mPZgW0XKKdBZppMj8Z2y2) | [video](https://www.youtube.com/watch?v=CKwkJVSa9Bs) |

- Spotify: https://open.spotify.com/album/2ReUiyrnlUMqwwwpsXw3or
- Apple Music: https://music.apple.com/es/album/nohablobien-part3-single/1895483174
- Smart link: https://too.fm/nohablobien_part3

### Obras iniciales del cielo
| Obra | Constelación | Tipo | Era | Papel en la era |
|---|---|---|---|---|
| BDUEM (Partes 1–4) | noba | libro | BDUEM | núcleo |
| Rulos | Supernoba | sencillo | BDUEM | órbita |
| nohablobien / part3 | Supernoba | sencillo | BDUEM | órbita |
| Puzzles `/0618am` | Jabi | puzzle | BDUEM | órbita |
| Este sitio y el lector de BDUEM | Jabi | proyecto | BDUEM | órbita |
| Segundo libro (en escritura) | noba | libro | Era 2 | núcleo (nebulosa) |

### Hilos iniciales
- BDUEM Parte 3 (Supernoba) → `inspira` → part3
- BDUEM → `guiño` → Rulos
- BDUEM → `guiño` → nohablobien
- Lector de BDUEM / este sitio → `construye` → BDUEM

### Aún falta
- [ ] Portadas en alta calidad (las de Too Lost son links temporales)
- [ ] Fotos para la portada, sobre mí y prensa
- [ ] Biografía larga
- [ ] Instagram, TikTok y otras redes
- [ ] Colores o estética de cada era (si ya existe)
- [ ] Audios para el reproductor propio (adelantos o exclusivas)
- [ ] Productos de la tienda y dónde se compran
- [ ] Proyectos de software para Jabi: nombre, descripción, repositorio o demo, capturas
- [ ] Primera señal de la era 2 (video glitch, frase o imagen)
- [ ] Otros hilos entre obras (además de BDUEM Parte 3 → part3)

---

## 8. Pendientes por decidir

- Pagos integrados en la tienda (Stripe) o solo links externos a largo plazo
- Dominio propio para el sitio de artista
- ~~Si las letras de las canciones son públicas o exclusivas para suscriptores~~ Decidido (2026-10-25): públicas
