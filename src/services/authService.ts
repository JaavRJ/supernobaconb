import { auth, googleProvider } from '../firebase/config';
import {
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged as firebaseOnAuthStateChanged,
    User
} from 'firebase/auth';
import { migrateLocalDataToFirebase } from './migrationService';
import { initializeUserProfile } from './userDataService';

// Sign in with Google
export const signInWithGoogle = async (): Promise<User> => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log('✅ Usuario autenticado:', result.user.email);

        // Initialize user profile
        await initializeUserProfile();

        // Attempt to migrate local data to Firebase
        try {
            const migrationResult = await migrateLocalDataToFirebase();
            if (migrationResult.success) {
                const totalMigrated =
                    migrationResult.highlightsMigrated +
                    migrationResult.quotesMigrated +
                    migrationResult.bookmarksMigrated +
                    migrationResult.progressMigrated;

                if (totalMigrated > 0) {
                    console.log(`✅ Migración completada: ${totalMigrated} items migrados a Firebase`);
                }
            } else {
                console.warn('⚠️ Migración completada con errores:', migrationResult.errors);
            }
        } catch (migrationError) {
            console.error('❌ Error durante la migración (datos siguen en localStorage):', migrationError);
        }

        return result.user;
    } catch (error: any) {
        console.error('❌ Error en autenticación:', error);
        throw new Error(error.message || 'Error al iniciar sesión con Google');
    }
};

// Sign out
export const signOut = async (): Promise<void> => {
    try {
        await firebaseSignOut(auth);
        console.log('✅ Sesión cerrada');
    } catch (error: any) {
        console.error('❌ Error al cerrar sesión:', error);
        throw error;
    }
};

// Get current user
export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};

// Listen to auth state changes
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
    return firebaseOnAuthStateChanged(auth, callback);
};

// Get user email
export const getUserEmail = (): string | null => {
    return auth.currentUser?.email || null;
};

// Get user display name
export const getUserDisplayName = (): string | null => {
    return auth.currentUser?.displayName || null;
};

// Get user ID
export const getUserId = (): string | null => {
    return auth.currentUser?.uid || null;
};
