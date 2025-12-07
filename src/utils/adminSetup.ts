/**
 * Helper para crear usuario admin desde la consola del navegador
 * 
 * USO:
 * 1. Inicia sesión en la app
 * 2. Abre la consola del navegador (F12)
 * 3. Escribe: window.createFirstAdmin()
 */

import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

// Función para crear el primer usuario admin
const createFirstAdmin = async () => {
    try {
        const user = auth.currentUser;

        if (!user) {
            console.error('❌ No hay usuario autenticado');
            console.log('👉 Por favor inicia sesión primero');
            return;
        }

        console.log('📧 Email:', user.email);
        console.log('🔑 UID:', user.uid);
        console.log('⏳ Creando usuario admin...');

        const adminDocRef = doc(db, 'adminUsers', user.uid);
        await setDoc(adminDocRef, {
            uid: user.uid,
            email: user.email,
            role: 'admin',
            permissions: ['all'],
            createdAt: new Date()
        });

        console.log('✅ ¡Usuario admin creado exitosamente!');
        console.log('🔄 Recarga la página para que los cambios surtan efecto');
        console.log('📍 Ahora puedes acceder a: /admin');

    } catch (error) {
        console.error('❌ Error creando usuario admin:', error);
    }
};

// Exponer función globalmente
if (typeof window !== 'undefined') {
    (window as any).createFirstAdmin = createFirstAdmin;
    console.log('💡 Helper cargado. Usa: window.createFirstAdmin()');
}

export default createFirstAdmin;
