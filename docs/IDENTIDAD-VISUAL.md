# Identidad visual de Supernoba

> Guía para que todo el sitio nuevo hable el mismo idioma visual que el sitio original (supernobaconb.web.app).
> Fuentes: el sitio original y su código (`src/` en la raíz), y la referencia de estructura que generó Gemini.
> Esta guía manda sobre cualquier decisión visual anterior del plan.

---

## 1. Lo que ya es tuyo (del sitio original)

| Elemento | Cómo es | Dónde está hoy |
|---|---|---|
| **Fondo** | Negro puro (`#000`), sin degradados de color | `src/index.css`, `Partes.css` |
| **Polvo de estrellas** | Puntos blancos dispersos al azar sobre el negro (≈100 estrellas, tamaños pequeños, algunas más brillantes) | `stars-container` en `BeforePage.tsx` |
| **Título** | **Uncial Antiqua** (letra uncial, de manuscrito antiguo), en mayúsculas, gris claro `#E0E0E0` | `FontEstrella.tsx` |
| **Firma** | La **estrella-brújula** reemplaza una "O" del título (BRILL✦ DE UNA…) | `public/logo512.png` / `logo192.png` |
| **Etiqueta vertical** | "SUPERNOBA" girado 90° y fijo en el borde izquierdo, serif, mayúsculas espaciadas | `.side-text` en `Partes.css` |
| **Texto** | Serif clásica (Times New Roman / Georgia), blanca, tono poético; títulos de sección en Uncial | `TextImages.css`, `InfoPanel.css` |
| **Fotos** | Blanco y negro, en marco tipo **polaroid** blanco y **ligeramente giradas** | `Photos.tsx`, imágenes en Cloudinary |
| **Paneles** | Tarjetas gris muy oscuro con borde fino y esquinas redondeadas, texto centrado | `InfoPanel` |
| **Movimiento** | Scroll **horizontal** cinematográfico con la rueda del ratón | `horizontal-scroll` |
| **Índice** | Secciones numeradas con subtítulo poético ("1. nebulosa — nacimiento de la idea del arte") | `BeforePage.tsx` |
| **Interfaz** | Mínima: botón redondo de menú arriba a la izquierda, pie diminuto con íconos, cuenta regresiva en una esquina | `HamburgerMenu`, `Footer` |

**En una frase:** monocromo, nocturno y literario. Negro absoluto, luz blanca de estrellas, letra de manuscrito y fotos analógicas en blanco y negro.

---

## 2. Lo que tomamos de la referencia de Gemini (estructura, no estética)

- El **cielo de constelaciones como centro**, con un ícono por faceta en las estrellas principales: libro (noba), nota musical (Supernoba), `</>` (Jabi).
- **Nebulosas** como nubes fotográficas suaves, no como manchas de color.
- La **línea de eras** con puntos y fases, y el **reproductor** fijo abajo.
- Un aviso de **"Nuevo"** destacado arriba del cielo.

Lo que **no** tomamos de Gemini: el azul marino, el dorado como color dominante, la tipografía de dashboard y la barra lateral de aplicación.

---

## 3. Reglas para el sitio nuevo

### Decisiones del artista (2026-10-25)
- **Portada y cielo base: radiante**, en la línea de la referencia de Gemini (espacio profundo, estrellas que brillan, nebulosas fotográficas, resplandor cálido en lo principal), pero **sin infantilizar**: sin íconos tipo app, sin colores de juguete, con elementos finos y mucho espacio.
- **El monocromo es de la era BDUEM**: negro puro, luz blanca, Uncial Antiqua y polaroids, exactamente como el sitio original. Entrar a BDUEM debe sentirse como entrar a ese mundo.
- **La estrella-brújula** (`logo512.png`) reemplaza la "O" también en **SUPERN✦BA**: es la firma de la marca.
- **Scroll horizontal** en las páginas de era y del libro; la portada es vertical.

### Portada radiante (cielo base)
- Fondo: espacio profundo, negro azulado (`#04060d` a `#0a1022` en un degradado muy suave), con polvo de estrellas blanco y algunas estrellas de 4 puntas que destellan.
- Nebulosas: nubes fotográficas suaves en gris azulado y humo, translúcidas.
- Luz: blanca, con un único **resplandor cálido** (`#f2d9a6` aprox.) reservado para la estrella principal, el aviso "Nuevo" y el foco. Nunca como color de fondo ni de bloques.
- Íconos de faceta en las estrellas principales con trazo fino: libro (noba), nota (Supernoba), `</>` (Jabi).

### Color de la era BDUEM (monocromo)
- Fondo base: negro puro `#000`. Superficies: `#0b0b0b` y `#141414` con borde `rgba(255,255,255,0.12)`.
- Texto: `#E0E0E0` (principal) y `#9a9a9a` (secundario).
- **La única luz es blanca.** Nada de verde, azul, dorado ni magenta como color de fondo. El brillo de estrellas y el foco de interacción son blancos.
- Las eras se distinguen por **textura, tipografía secundaria e imagen**, no por cambiar el fondo de color. Un acento de era, si existe, es un tinte muy leve sobre el blanco (por ejemplo, un blanco cálido para BDUEM), nunca un fondo de color.

### Tipografía
| Uso | Fuente |
|---|---|
| Nombre "SUPERNOBA" (marca) | **Cinzel Decorative**, elegida por el artista |
| Títulos de la era BDUEM | **Uncial Antiqua**, con la estrella-brújula sustituyendo la "O" (BRILL✦ DE UNA ESTRELLA MUERTA), como en el sitio original |
| Texto, poemas y tarjetas | Serif clásica: Cormorant Garamond o Crimson Pro (sustitutos web de Times/Georgia, más finas) |
| Controles pequeños (reproductor, tiempos) | Inter, solo donde la legibilidad lo exija |

### Composición
- La **etiqueta vertical "SUPERNOBA"** regresa en el borde izquierdo, en todas las páginas de escritorio.
- Mucho negro alrededor; elementos pequeños y precisos, nunca bloques llenos.
- Fotos siempre en blanco y negro, en polaroid girada.
- Paneles de texto como los del sitio original (gris oscuro, borde fino, texto centrado).
- El scroll horizontal se conserva en las páginas de cada era y del libro; la portada puede ser vertical para que el cielo y "Nuevo" se encuentren rápido.

### Cielo
- Fondo de polvo de estrellas blanco en toda la portada (no solo al elegir una era).
- Estrellas blancas; las principales con la estrella-brújula o un ícono fino de su faceta.
- Líneas de constelación e hilos en blanco translúcido; los tipos de hilo se distinguen por trazo (continuo, punteado), no por color.
- Nebulosas como nubes grises translúcidas.

---

## 4. Qué cambia respecto a lo construido

| Pieza | Hoy | Con esta guía |
|---|---|---|
| Fondo base | Verde-negro con crema y dorado | Negro puro y blanco |
| Nombre | Cinzel Decorative crema | Cinzel Decorative en `#E0E0E0` |
| Era BDUEM, títulos | Cinzel Decorative | Uncial Antiqua con la estrella-brújula en la "O" |
| Portada | Eclipse ilustrado | Polvo de estrellas, nombre, "Nuevo" y el cielo |
| Constelaciones | Verde-cian, crema y violeta | Blancas, con ícono por faceta |
| Era BDUEM | Fondo sepia | Negro con su textura y tipografía; la diferencia se da por imagen y letra |
| Etiqueta vertical | No existe | Regresa en el borde izquierdo |
| Fotos | No hay | Polaroids en blanco y negro donde haya imagen de obra |
