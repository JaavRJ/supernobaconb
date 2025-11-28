import { db } from '../firebase/config';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    deleteDoc,
    getDocs,
    query,
    orderBy
} from 'firebase/firestore';

export interface Subscriber {
    userId: string;
    email: string;
    displayName: string;
    subscribedAt: string;
    calendarAdded: boolean;
    notifyFor: string[]; // ['parte2', 'parte3', etc.]
}

// Subscribe user to newsletter
export const subscribeUser = async (
    userId: string,
    email: string,
    displayName: string,
    partNumber: number
): Promise<void> => {
    const docRef = doc(db, 'subscribers', userId);

    try {
        // Check if user already exists
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // Update existing subscription
            const existingData = docSnap.data() as Subscriber;
            const nextPart = `parte${partNumber + 1}`;

            if (!existingData.notifyFor.includes(nextPart)) {
                await setDoc(docRef, {
                    ...existingData,
                    notifyFor: [...existingData.notifyFor, nextPart]
                });
            }
        } else {
            // Create new subscription
            const subscriber: Subscriber = {
                userId,
                email,
                displayName,
                subscribedAt: new Date().toISOString(),
                calendarAdded: false,
                notifyFor: [`parte${partNumber + 1}`]
            };

            await setDoc(docRef, subscriber);
        }

        console.log('✅ Usuario suscrito:', email);
    } catch (error) {
        console.error('❌ Error al suscribir usuario:', error);
        throw error;
    }
};

// Mark calendar as added
export const markCalendarAdded = async (userId: string): Promise<void> => {
    const docRef = doc(db, 'subscribers', userId);

    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            await setDoc(docRef, {
                ...docSnap.data(),
                calendarAdded: true
            });
        }
    } catch (error) {
        console.error('❌ Error al marcar calendario:', error);
        throw error;
    }
};

// Unsubscribe user
export const unsubscribeUser = async (userId: string): Promise<void> => {
    const docRef = doc(db, 'subscribers', userId);

    try {
        await deleteDoc(docRef);
        console.log('✅ Usuario desuscrito');
    } catch (error) {
        console.error('❌ Error al desuscribir:', error);
        throw error;
    }
};

// Check if user is subscribed
export const isUserSubscribed = async (userId: string): Promise<boolean> => {
    const docRef = doc(db, 'subscribers', userId);

    try {
        const docSnap = await getDoc(docRef);
        return docSnap.exists();
    } catch (error) {
        console.error('❌ Error al verificar suscripción:', error);
        return false;
    }
};

// Get user subscription
export const getUserSubscription = async (userId: string): Promise<Subscriber | null> => {
    const docRef = doc(db, 'subscribers', userId);

    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as Subscriber;
        }
        return null;
    } catch (error) {
        console.error('❌ Error al obtener suscripción:', error);
        return null;
    }
};

// Get all subscribers (admin function)
export const getAllSubscribers = async (): Promise<Subscriber[]> => {
    try {
        const q = query(collection(db, 'subscribers'), orderBy('subscribedAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const subscribers: Subscriber[] = [];
        querySnapshot.forEach((doc) => {
            subscribers.push(doc.data() as Subscriber);
        });

        return subscribers;
    } catch (error) {
        console.error('❌ Error al obtener suscriptores:', error);
        return [];
    }
};

// Export subscribers as CSV (for sending emails)
export const exportSubscribersCSV = async (): Promise<string> => {
    const subscribers = await getAllSubscribers();

    let csv = 'Email,Nombre,Fecha de Suscripción,Notificar Para\n';
    subscribers.forEach(sub => {
        csv += `${sub.email},${sub.displayName},${sub.subscribedAt},"${sub.notifyFor.join(', ')}"\n`;
    });

    return csv;
};
