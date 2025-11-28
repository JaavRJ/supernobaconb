# Configuración de Firebase para Reacciones

## Paso 1: Obtener credenciales de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto o crea uno nuevo
3. Ve a **Configuración del proyecto** (ícono de engranaje)
4. En la sección **Tus apps**, busca la configuración web
5. Copia los valores de `firebaseConfig`

## Paso 2: Actualizar config.ts

Abre `src/firebase/config.ts` y reemplaza los valores placeholder con tus credenciales:

```typescript
const firebaseConfig = {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "TU_PROJECT_ID.firebaseapp.com",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_PROJECT_ID.appspot.com",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
};
```

## Paso 3: Configurar Firestore

1. En Firebase Console, ve a **Firestore Database**
2. Haz click en **Crear base de datos**
3. Selecciona **Modo de prueba** (para desarrollo)
4. Elige una ubicación

## Paso 4: Actualizar reglas de Firestore

En Firebase Console, ve a **Firestore Database** → **Reglas** y pega:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura de reacciones a todos
    match /reactions/{document=**} {
      allow read: if true;
      allow write: if true;
    }
    
    // Permitir lectura/escritura de reacciones de usuario
    match /userReactions/{document=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

## Paso 5: Publicar reglas

Haz click en **Publicar** en la consola de Firebase.

## Verificación

Una vez configurado, las reacciones deberían funcionar automáticamente. Cada usuario recibirá un ID único almacenado en localStorage.
