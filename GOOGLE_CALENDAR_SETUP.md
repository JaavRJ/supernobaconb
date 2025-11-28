# Configuración de Google Calendar API

## Paso 1: Habilitar Firebase Authentication

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **supernobaconb**
3. Ve a **Authentication** en el menú lateral
4. Click en **Get Started** (si no está habilitado)
5. En la pestaña **Sign-in method**:
   - Click en **Google**
   - Activa el toggle
   - Configura el email de soporte del proyecto
   - Click en **Guardar**

## Paso 2: Configurar Google Calendar API (Opcional - para método avanzado)

### Opción A: Usar links directos (Recomendado - Ya implementado)
✅ **No requiere configuración adicional**
- El sistema usa links directos de Google Calendar
- Funciona inmediatamente
- El usuario hace click y se abre Google Calendar con el evento pre-llenado

### Opción B: Usar Google Calendar API (Avanzado)
Si quieres que los eventos se agreguen automáticamente sin que el usuario tenga que confirmar:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto o créalo
3. Habilita **Google Calendar API**:
   - Busca "Calendar API" en la barra de búsqueda
   - Click en "Enable"
4. Configura OAuth consent screen:
   - Ve a **APIs & Services** → **OAuth consent screen**
   - Selecciona **External**
   - Completa la información requerida
5. Crea credenciales:
   - Ve a **Credentials**
   - Click en **Create Credentials** → **OAuth client ID**
   - Tipo: **Web application**
   - Authorized JavaScript origins: `http://localhost:3000` y tu dominio de producción
   - Authorized redirect URIs: Agrega tus URLs
6. Copia el **Client ID** y actualiza `src/services/calendarService.ts`

## Paso 3: Actualizar Firestore Rules

Agrega estas reglas para los suscriptores:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reacciones (ya existentes)
    match /reactions/{document=**} {
      allow read: if true;
      allow write: if true;
    }
    
    match /userReactions/{document=**} {
      allow read: if true;
      allow write: if true;
    }
    
    // Suscriptores del newsletter
    match /subscribers/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Paso 4: Configurar fechas de publicación

Edita `src/config/publicationDates.ts` y actualiza las fechas según tu plan de publicación:

```typescript
export const PUBLICATION_DATES = {
    parte2: '2025-12-15',  // Cambia esta fecha
    parte3: '2026-01-20',  // Y esta
    parte4: '2026-02-25',  // Y esta
};
```

## Verificación

1. Abre tu aplicación
2. Completa la lectura de una parte
3. Verifica que aparece el modal de newsletter
4. Prueba el botón "Suscribirme con Google"
5. Verifica que se abre la ventana de login de Google
6. Verifica que después del login se guarda en Firestore
7. Prueba "Agregar a calendario"
8. Verifica que se abre Google Calendar con el evento

## Notas Importantes

⚠️ **Dominio autorizado**: Asegúrate de agregar tu dominio en Firebase Authentication → Settings → Authorized domains

⚠️ **Método actual**: El sistema usa links directos de Google Calendar (Opción A), que funciona sin configuración adicional de API

💡 **Para producción**: Considera implementar la Opción B para una experiencia más fluida

## Exportar suscriptores

Para enviar emails a tus suscriptores:

1. Abre la consola del navegador
2. Ejecuta:
```javascript
import { exportSubscribersCSV } from './services/newsletterService';
const csv = await exportSubscribersCSV();
console.log(csv);
```
3. Copia el CSV y úsalo con tu servicio de email preferido
