import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Next solo incrusta las variables NEXT_PUBLIC_* si se referencian de forma literal.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/** Indica si están las variables obligatorias de Firebase. */
export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

/** App de Firebase, inicializada una sola vez y solo cuando se pide. */
export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase no está configurado. Copia web/.env.example a web/.env.local y llena las variables NEXT_PUBLIC_FIREBASE_*.",
    );
  }
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

/** Instancia de Firestore. */
export function getDb(): Firestore {
  return getFirestore(getFirebaseApp());
}

/** Instancia de Auth. */
export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

/** Proveedor de inicio de sesión con Google. */
export function getGoogleProvider(): GoogleAuthProvider {
  return new GoogleAuthProvider();
}
