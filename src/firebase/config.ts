// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Tu configuración de Firebase
// IMPORTANTE: Reemplaza estos valores con los de tu proyecto Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCAV5m9GIj5Fd92fZsB2opYEBAC-BNGWEg",
    authDomain: "supernobaconb.firebaseapp.com",
    projectId: "supernobaconb",
    storageBucket: "supernobaconb.firebasestorage.app",
    messagingSenderId: "897617191412",
    appId: "1:897617191412:web:a2c02429ff2e514460d9a1",
    measurementId: "G-CY1YC8Q3E0"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);

// Inicializar Authentication
export const auth = getAuth(app);

// Proveedor de Google
export const googleProvider = new GoogleAuthProvider();

export default app;
