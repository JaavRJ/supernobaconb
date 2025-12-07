import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getAuth } from 'firebase/auth';

export interface AdminUser {
    uid: string;
    email: string;
    role: 'admin' | 'editor' | 'viewer';
    permissions: string[];
    createdAt: Date;
}

/**
 * Verifica si el usuario actual es administrador
 */
export const isUserAdmin = async (): Promise<boolean> => {
    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            return false;
        }

        // Estructura correcta: adminUsers/{uid}
        const adminDocRef = doc(db, 'adminUsers', user.uid);
        const adminDoc = await getDoc(adminDocRef);

        if (!adminDoc.exists()) {
            return false;
        }

        const adminData = adminDoc.data() as AdminUser;
        return adminData.role === 'admin';
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
};

/**
 * Obtiene los datos del usuario admin
 */
export const getAdminUser = async (uid: string): Promise<AdminUser | null> => {
    try {
        const adminDocRef = doc(db, 'adminUsers', uid);
        const adminDoc = await getDoc(adminDocRef);

        if (!adminDoc.exists()) {
            return null;
        }

        return adminDoc.data() as AdminUser;
    } catch (error) {
        console.error('Error getting admin user:', error);
        return null;
    }
};

/**
 * Crea un nuevo usuario admin (solo para setup inicial)
 */
export const createAdminUser = async (
    uid: string,
    email: string,
    role: 'admin' | 'editor' | 'viewer' = 'admin'
): Promise<void> => {
    try {
        const adminDocRef = doc(db, 'adminUsers', uid);
        const adminUser: AdminUser = {
            uid,
            email,
            role,
            permissions: role === 'admin' ? ['all'] : [],
            createdAt: new Date()
        };

        await setDoc(adminDocRef, adminUser);
        console.log('✅ Admin user created:', email);
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        throw error;
    }
};

/**
 * Verifica si el usuario tiene un permiso específico
 */
export const hasPermission = async (permission: string): Promise<boolean> => {
    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            return false;
        }

        const adminUser = await getAdminUser(user.uid);
        if (!adminUser) {
            return false;
        }

        // Admin tiene todos los permisos
        if (adminUser.role === 'admin' || adminUser.permissions.includes('all')) {
            return true;
        }

        return adminUser.permissions.includes(permission);
    } catch (error) {
        console.error('Error checking permission:', error);
        return false;
    }
};
