# 🌟 Brillo de una Estrella Muerta (BDUM)

> *Una experiencia de lectura digital inmersiva para una novela serializada en cuatro partes.*

**BDUM** — *Brillo de una Estrella Muerta* — es una aplicación web de lectura construida con React y Firebase. Presenta una novela dividida en cuatro partes con temática espacial (Nebulosa → Gigante Roja → Supernoba → Enana Blanca), ofreciendo una experiencia de lectura tipo Kindle con fondo de estrellas animado, scroll horizontal cinematográfico y un completo sistema de anotaciones del autor.

---

## 🚀 Demo en vivo

El proyecto está desplegado en **Firebase Hosting**.

---

## ✨ Características principales

### 📖 Lector inmersivo (KindleReader)
- **Dos modos de lectura**: paginado horizontal (tipo e-reader) y scroll vertical continuo
- **Paginación dinámica**: calcula automáticamente el contenido que cabe en pantalla según el tamaño de fuente y la ventana
- **Ajuste de fuente**: tamaño configurable entre 14 px y 24 px
- **Navegación por teclado**: flechas, PageUp/PageDown, Espacio y Escape
- **Modo inmersivo**: oculta la UI y maximiza el área de lectura
- **Indicador de tiempo de lectura** estimado en minutos

### 🖊️ Herramientas de lectura
- **Resaltado de texto**: selecciona cualquier párrafo y resáltalo con color
- **Citas guardadas**: guarda fragmentos y compártelos como imagen estilo Instagram
- **Marcadores**: guarda tu posición exacta por parte, capítulo y página
- **Barra de reacciones**: reacciona a cada capítulo con emojis

### 📝 Notas del autor
- Las notas se integran directamente en el texto como superíndices interactivos
- Dos modalidades: **tooltip** (popover) y **modal** (ventana completa)
- Gestionadas desde el panel de administración y servidas desde Firestore

### 🎨 Diseño
- Fondo de cielo estrellado con animación generativa (100 estrellas CSS aleatorias)
- Scroll **horizontal** cinematográfico en las páginas de cada parte, controlado con la rueda del ratón
- Fotos del libro mostradas con rotación aleatoria tipo polaroid (imágenes servidas desde Cloudinary)
- Variables CSS para modo oscuro y glassmorphism cohesivo

### 🔐 Autenticación
- **Login con Google** mediante Firebase Auth
- Rutas protegidas por parte (solo accesibles cuando la parte está publicada)
- Migración automática de datos locales (localStorage) a Firebase al iniciar sesión

### ☁️ Sincronización de datos
- **Doble almacenamiento**: localStorage como fallback + Firestore como almacenamiento principal
- Sincronización automática de resaltados, citas, marcadores y progreso de lectura
- Listener en tiempo real (onSnapshot) para resaltados cuando el usuario está autenticado

### 📬 Newsletter
- Modal de suscripción que aparece al terminar cada parte
- Guarda suscriptores en Firestore con lista de partes para notificar
- Función de exportación CSV para el administrador

### 📅 Publicación escalonada
- Sistema de fechas de publicación configurables en `src/config/publicationDates.ts`
- `ProtectedRoute` bloquea el acceso a partes no publicadas aún
- El menú hamburguesa refleja dinámicamente qué partes están disponibles

### 🔒 Panel de administración (`/admin`)
- Acceso protegido (rol `admin` en Firestore)
- **Parts Manager**: crear/editar metadatos de cada parte
- **Chapters Manager**: editor de capítulos con Quill (rich text)
- **Notes Manager**: gestionar notas del autor (tooltip o modal) por capítulo
- **PDF Manager**: subir y gestionar PDFs descargables por parte

### 🧩 Páginas de puzzles (easter eggs)
- Ruta `/0618am` → puzzle cuadrático
- Ruta `/0618am/030806` → puzzle de estrellas draggables

---

## 🗂️ Estructura del proyecto

```
bduem2/
├── public/                        # Assets públicos (favicon, index.html)
├── src/
│   ├── assets/styles/             # CSS global (Partes.css, animations.css)
│   ├── components/
│   │   ├── admin/                 # AdminLayout, AdminProtectedRoute, SimpleEditor
│   │   ├── animations/            # Componentes de animación
│   │   ├── auth/                  # LoginButton, LoginModal
│   │   ├── controllers/           # EpisodeControllers
│   │   ├── navigation/            # PartLayout, HamburgerMenu, NavigationSystem,
│   │   │                          #   ProtectedRoute, ScrollProgress, BackToTop
│   │   ├── newsletter/            # NewsletterModal
│   │   ├── notifications/         # Sistema de notificaciones
│   │   ├── reading/               # KindleReader, KindleReaderVertical,
│   │   │                          #   KindleConfigModal, TextSelectionMenu,
│   │   │                          #   BookmarkButton, SavedQuotes, ReactionBar,
│   │   │                          #   AuthorNoteTooltip, AuthorNoteModal,
│   │   │                          #   PDFDownloadButton, ShareMenu,
│   │   │                          #   ImmersiveModeButton, FeatureTutorial,
│   │   │                          #   InstagramQuoteCard, ReadingTimeIndicator
│   │   ├── search/                # Componentes de búsqueda
│   │   ├── texts/                 # ChapterText{parte}_{capítulo}.tsx (contenido estático)
│   │   ├── UI/                    # Footer y componentes de UI general
│   │   ├── GalleryPartes.tsx      # Galería de partes en la portada
│   │   ├── InfoPanel.tsx          # Panel de información
│   │   ├── LoadingScreen.tsx      # Pantalla de carga
│   │   ├── ReadingSettings.tsx    # Panel lateral de configuración de lectura
│   │   └── Photos.tsx             # Componente de fotografía polaroid
│   ├── config/
│   │   ├── publicationDates.ts    # Fechas y títulos de publicación por parte
│   │   └── partsConfig.ts         # Flags para habilitar/deshabilitar partes
│   ├── contexts/
│   │   └── ThemeContext.tsx        # Contexto de tema (modo oscuro/claro)
│   ├── data/
│   │   ├── sampleChapters.ts      # Contenido estático de todos los capítulos
│   │   ├── authorNotes.ts         # Notas del autor en local (datos de prueba/fallback)
│   │   └── pdfLinks.ts            # URLs de PDFs por parte
│   ├── hooks/
│   │   └── useReadingProgress.ts  # Hook para guardar/recuperar progreso de scroll
│   ├── pages/
│   │   ├── admin/                 # AdminDashboard, PartsManager, ChaptersManager,
│   │   │                          #   NotesManager, PDFManager
│   │   ├── cifrados/              # Cuadratico, PuzzleStars (easter eggs)
│   │   ├── parts/                 # Parte1.tsx … Parte5.tsx (páginas de cada parte)
│   │   ├── BeforePage.tsx         # Portada / home page
│   │   ├── DuringPage.tsx         # Página intermedia de lectura
│   │   └── HomeRoute.tsx          # Decide qué mostrar en "/"
│   ├── scripts/                   # Scripts de utilidad
│   ├── services/
│   │   ├── authService.ts         # Login/logout con Google, escucha de estado de auth
│   │   ├── authorNotesLoaderService.ts # Carga notas del autor desde Firestore
│   │   ├── calendarService.ts     # Integración con Google Calendar
│   │   ├── chapterLoaderService.ts # Carga capítulos desde Firestore
│   │   ├── contentService.ts      # CRUD completo de partes, capítulos, notas y PDFs
│   │   ├── migrationService.ts    # Migra datos de localStorage a Firebase al hacer login
│   │   ├── newsletterService.ts   # Suscripción, desuscripción y exportación CSV
│   │   ├── reactionsService.ts    # Reacciones de emoji por capítulo
│   │   ├── storageService.ts      # Subida de archivos a Firebase Storage
│   │   ├── userDataService.ts     # Resaltados, citas, marcadores, progreso, preferencias
│   │   └── adminService.ts        # Gestión de roles de administrador
│   ├── types/                     # Tipos TypeScript compartidos
│   ├── utils/
│   │   ├── highlightManager.ts    # CRUD de resaltados en localStorage
│   │   ├── quotesManager.ts       # CRUD de citas guardadas
│   │   ├── bookmarkManager.ts     # CRUD de marcadores
│   │   ├── sanitize.ts            # Sanitización HTML con DOMPurify
│   │   ├── validation.ts          # Validación de datos antes de guardar
│   │   ├── errorHandler.ts        # Manejador centralizado de errores
│   │   ├── dataMigration.ts       # Helpers para migración de datos (consola)
│   │   ├── readingTime.ts         # Estimación de tiempo de lectura
│   │   ├── instagramShareUtils.ts # Generación de imagen quote para compartir
│   │   └── adminSetup.ts          # Setup inicial de admin en Firestore
│   ├── App.tsx                    # Router principal con todas las rutas
│   └── index.tsx                  # Entry point
├── .firebase/                     # Configuración de Firebase (config.ts)
├── firebase.json                  # Hosting config
├── firestore.rules                # Reglas de seguridad de Firestore
├── firestore.indexes.json         # Índices de Firestore
└── package.json
```

---

## 🛠️ Stack tecnológico

| Categoría | Tecnología |
|---|---|
| Framework | React 19 + TypeScript |
| Routing | React Router DOM v7 |
| Backend / DB | Firebase v12 (Firestore, Auth, Storage, Hosting) |
| Animaciones | Framer Motion, GSAP, @react-spring/web, @use-gesture/react |
| UI Components | MUI v7 (@mui/material, @mui/icons-material) |
| Editor de texto | Quill / react-quill |
| Íconos | Lucide React |
| Sanitización | DOMPurify |
| PDF | jsPDF + html2canvas |
| Imágenes | Cloudinary (CDN con optimización automática `q_auto/f_auto`) |
| Estilos | CSS Modules + CSS Variables + Styled Components + Tailwind CSS |
| Build | Create React App (react-scripts 5) |

---

## ⚙️ Variables de entorno

Crea un archivo `.env` en la raíz del proyecto (`bduem2/`) con las siguientes variables de Firebase:

```env
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_MEASUREMENT_ID=
```

> ⚠️ **Nunca subas el archivo `.env` al repositorio.** Está incluido en `.gitignore`.

---

## 🏁 Instalación y desarrollo

### Requisitos previos
- Node.js ≥ 16
- npm ≥ 8
- Cuenta de Firebase con un proyecto configurado

### Pasos

```bash
# 1. Clona el repositorio
git clone <url-del-repositorio>
cd supernoba/bduem2

# 2. Instala las dependencias
npm install

# 3. Crea el archivo .env con tus credenciales de Firebase (ver sección anterior)

# 4. Inicia el servidor de desarrollo
npm start
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 📦 Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Inicia el servidor de desarrollo en `localhost:3000` |
| `npm run build` | Genera el bundle de producción en `/build` |
| `npm test` | Ejecuta los tests con Jest en modo interactivo |
| `npm run eject` | Expone la configuración de CRA (¡irreversible!) |

---

## 🔥 Configuración de Firebase

### Estructura de Firestore

```
/parts/{partNumber}/
    partNumber: number
    partTitle: string
    description: string
    /chapters/{chapterIndex}/
        number: string
        title: string
        content: string (HTML)
        updatedAt: Timestamp

/authorNotes/{noteId}/
    partNumber: number
    chapterIndex: number
    triggerText: string
    noteTitle: string
    noteContent: string
    type: "tooltip" | "modal"
    createdAt: Timestamp

/users/{userId}/
    /highlights/{highlightId}/   ← resaltados de texto
    /quotes/{quoteId}/           ← citas guardadas
    /bookmarks/{bookmarkId}/     ← marcadores
    /readingProgress/{partKey}/  ← progreso de lectura
    /preferences/settings/       ← preferencias (fontSize, readingMode, etc.)
    /profile/info/               ← perfil del usuario

/adminUsers/{userId}/
    role: "admin"

/reactions/{key}/               ← contadores de reacciones por capítulo
/userReactions/{key}/           ← registro de qué usuarios reaccionaron
/subscribers/{userId}/          ← suscriptores al newsletter
/pdfs/{partNumber}/             ← enlaces a PDFs descargables
```

### Reglas de seguridad (resumen)

- **Usuarios**: solo pueden leer/escribir sus propios datos.
- **Partes, capítulos, notas, PDFs**: lectura pública; escritura solo para admins.
- **Reacciones**: lectura y escritura públicas.
- **Suscriptores**: cada usuario solo accede a su propio documento.

### Configurar un administrador

Añade manualmente un documento en Firestore:

```
/adminUsers/{uid_del_usuario}
  role: "admin"
```

O usa el helper `src/utils/adminSetup.ts` desde la consola del navegador.

---

## 📅 Configuración de publicación de partes

Edita `src/config/publicationDates.ts` para definir cuándo se desbloquea cada parte:

```typescript
export const PUBLICATION_DATES = {
    parte2: '2025-12-08T00:00:00',
    parte3: '2025-12-15T00:00:00',
    parte4: '2025-12-22T22:00:00',
};
```

La **Parte 1** siempre está disponible. Las demás se desbloquean automáticamente cuando la fecha actual supera la fecha de publicación configurada.

---

## 🚢 Despliegue

El proyecto usa **Firebase Hosting**:

```bash
# Construir la aplicación
npm run build

# Desplegar a Firebase Hosting
firebase deploy
```

También puedes desplegar solo las reglas de Firestore:

```bash
firebase deploy --only firestore:rules
```

---

## 📖 Estructura narrativa

| Parte | Título | Estado |
|---|---|---|
| Parte 1 | Nebulosa | ✅ Disponible |
| Parte 2 | Gigante Roja | ✅ Disponible |
| Parte 3 | Supernoba | ✅ Disponible |
| Parte 4 | Enana Blanca | ✅ Disponible |

---

## 🧩 Easter eggs

| Ruta | Descripción |
|---|---|
| `/0618am` | Puzzle cuadrático interactivo |
| `/0618am/030806` | Puzzle de estrellas draggables |

---

## 📄 Licencia

Este proyecto es privado. Todos los derechos sobre el contenido narrativo y el código reservados al autor.
