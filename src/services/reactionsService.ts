import { db } from '../firebase/config';
import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment,
    onSnapshot,
    Unsubscribe
} from 'firebase/firestore';

export type ReactionType = 'heart' | 'sad' | 'mind_blown' | 'star';

export interface Reactions {
    heart: number;
    sad: number;
    mind_blown: number;
    star: number;
}

// Obtener ID único del usuario (usando localStorage)
export const getUserId = (): string => {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('userId', userId);
    }
    return userId;
};

// Obtener reacciones de un capítulo
export const getReactions = async (
    partNumber: number,
    chapterIndex: number
): Promise<Reactions> => {
    const docId = `${partNumber}_${chapterIndex}`;
    const docRef = doc(db, 'reactions', docId);

    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as Reactions;
        } else {
            // Inicializar con 0
            const initialReactions: Reactions = {
                heart: 0,
                sad: 0,
                mind_blown: 0,
                star: 0
            };
            await setDoc(docRef, initialReactions);
            return initialReactions;
        }
    } catch (error) {
        console.error('Error getting reactions:', error);
        return { heart: 0, sad: 0, mind_blown: 0, star: 0 };
    }
};

// Obtener reacción del usuario actual
export const getUserReaction = async (
    userId: string,
    partNumber: number,
    chapterIndex: number
): Promise<ReactionType | null> => {
    const docId = `${userId}_${partNumber}_${chapterIndex}`;
    const docRef = doc(db, 'userReactions', docId);

    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().reaction as ReactionType;
        }
        return null;
    } catch (error) {
        console.error('Error getting user reaction:', error);
        return null;
    }
};

// Agregar o cambiar reacción
export const addReaction = async (
    userId: string,
    partNumber: number,
    chapterIndex: number,
    newReaction: ReactionType
): Promise<void> => {
    const reactionsDocId = `${partNumber}_${chapterIndex}`;
    const userReactionDocId = `${userId}_${partNumber}_${chapterIndex}`;

    const reactionsRef = doc(db, 'reactions', reactionsDocId);
    const userReactionRef = doc(db, 'userReactions', userReactionDocId);

    try {
        // Obtener reacción anterior del usuario
        const previousReaction = await getUserReaction(userId, partNumber, chapterIndex);

        // Si había una reacción anterior, decrementar
        if (previousReaction) {
            await updateDoc(reactionsRef, {
                [previousReaction]: increment(-1)
            });
        }

        // Incrementar la nueva reacción
        await updateDoc(reactionsRef, {
            [newReaction]: increment(1)
        });

        // Guardar la reacción del usuario
        await setDoc(userReactionRef, {
            reaction: newReaction,
            timestamp: new Date().toISOString()
        });

        console.log('✅ Reacción guardada:', newReaction);
    } catch (error) {
        console.error('Error adding reaction:', error);
        throw error;
    }
};

// Suscribirse a cambios en tiempo real
export const subscribeToReactions = (
    partNumber: number,
    chapterIndex: number,
    callback: (reactions: Reactions) => void
): Unsubscribe => {
    const docId = `${partNumber}_${chapterIndex}`;
    const docRef = doc(db, 'reactions', docId);

    return onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            callback(doc.data() as Reactions);
        } else {
            callback({ heart: 0, sad: 0, mind_blown: 0, star: 0 });
        }
    }, (error) => {
        console.error('Error in reactions subscription:', error);
    });
};
