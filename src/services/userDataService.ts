import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    query,
    where,
    onSnapshot,
    writeBatch,
    Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { getCurrentUser } from './authService';
import type { Highlight } from '../utils/highlightManager';
import type { Quote } from '../utils/quotesManager';
import type { Bookmark } from '../utils/bookmarkManager';

// ============================================================================
// TYPES
// ============================================================================

export interface ReadingProgress {
    partNumber: number;
    scrollPosition: number;
    lastRead: string;
    completed: boolean;
}

export interface UserProfile {
    userId: string;
    email: string;
    displayName: string;
    createdAt: string;
    lastLogin: string;
}

export interface UserPreferences {
    readingMode: 'horizontal' | 'vertical';
    fontSize: number;
    hasSeenTutorial: boolean;
    hasConfigured: boolean;
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get current user ID or null if not authenticated
 */
const getUserId = (): string | null => {
    const user = getCurrentUser();
    return user?.uid || null;
};

/**
 * Check if user is authenticated
 */
export const isUserAuthenticated = (): boolean => {
    return getUserId() !== null;
};

// ============================================================================
// HIGHLIGHTS
// ============================================================================

/**
 * Save highlight to Firebase (if authenticated) and localStorage (as backup)
 */
export const saveHighlight = async (highlight: Highlight): Promise<void> => {
    const userId = getUserId();

    // Always save to localStorage
    const localHighlights = JSON.parse(localStorage.getItem('highlights') || '[]');
    const existingIndex = localHighlights.findIndex((h: Highlight) => h.id === highlight.id);
    if (existingIndex >= 0) {
        localHighlights[existingIndex] = highlight;
    } else {
        localHighlights.push(highlight);
    }
    localStorage.setItem('highlights', JSON.stringify(localHighlights));

    // If authenticated, also save to Firebase
    if (userId) {
        try {
            const highlightRef = doc(db, 'users', userId, 'highlights', highlight.id);
            await setDoc(highlightRef, highlight);
        } catch (error) {
            console.error('❌ Error guardando highlight en Firebase:', error);
            // Data is still in localStorage, so operation is not completely failed
        }
    }
};

/**
 * Get highlights - Firebase first (if authenticated), fallback to localStorage
 */
export const getHighlights = async (
    partNumber?: number,
    chapterIndex?: number
): Promise<Highlight[]> => {
    const userId = getUserId();

    console.log('🔍 getHighlights called:', { userId, partNumber, chapterIndex });

    // If authenticated, try Firebase first
    if (userId) {
        try {
            const highlightsRef = collection(db, 'users', userId, 'highlights');
            let q = query(highlightsRef);

            if (partNumber !== undefined) {
                q = query(highlightsRef, where('partNumber', '==', partNumber));
            }

            const snapshot = await getDocs(q);

            let highlights = snapshot.docs.map(doc => {
                const data = doc.data() as Highlight;
                return data;
            });

            // Filter by chapter if specified
            if (chapterIndex !== undefined) {
                highlights = highlights.filter(h => h.chapterIndex === chapterIndex);
            }

            // Also sync to localStorage
            if (highlights.length > 0) {
                localStorage.setItem('highlights', JSON.stringify(highlights));
            }

            return highlights;
        } catch (error) {
            console.error('❌ Error cargando highlights desde Firebase, usando localStorage:', error);
            // Fallback to localStorage
        }
    } else {
        console.log('⚠️ Usuario no autenticado, usando localStorage');
    }

    // Fallback to localStorage (or if not authenticated)
    const stored = localStorage.getItem('highlights');
    const highlights: Highlight[] = stored ? JSON.parse(stored) : [];

    if (partNumber !== undefined && chapterIndex !== undefined) {
        const filtered = highlights.filter(
            h => h.partNumber === partNumber && h.chapterIndex === chapterIndex
        );
        return filtered;
    }

    return highlights;
};

/**
 * Delete highlight from Firebase and localStorage
 */
export const deleteHighlight = async (highlightId: string): Promise<void> => {
    const userId = getUserId();

    // Delete from localStorage
    const localHighlights = JSON.parse(localStorage.getItem('highlights') || '[]');
    const filtered = localHighlights.filter((h: Highlight) => h.id !== highlightId);
    localStorage.setItem('highlights', JSON.stringify(filtered));

    // If authenticated, also delete from Firebase
    if (userId) {
        try {
            const highlightRef = doc(db, 'users', userId, 'highlights', highlightId);
            await deleteDoc(highlightRef);
        } catch (error) {
            console.error('❌ Error eliminando highlight de Firebase:', error);
        }
    }
};

/**
 * Listen to highlights changes in real-time (only if authenticated)
 */
export const syncHighlightsListener = (
    callback: (highlights: Highlight[]) => void
): Unsubscribe | null => {
    const userId = getUserId();

    if (!userId) {
        console.log('⚠️ No autenticado, no se puede sincronizar highlights en tiempo real');
        return null;
    }

    const highlightsRef = collection(db, 'users', userId, 'highlights');

    return onSnapshot(highlightsRef, (snapshot) => {
        const highlights = snapshot.docs.map(doc => doc.data() as Highlight);

        // Also update localStorage
        localStorage.setItem('highlights', JSON.stringify(highlights));

        callback(highlights);
    }, (error) => {
        console.error('❌ Error en listener de highlights:', error);
    });
};

// ============================================================================
// QUOTES
// ============================================================================

/**
 * Save quote to Firebase (if authenticated) and localStorage (as backup)
 */
export const saveQuote = async (quote: Quote): Promise<void> => {
    const userId = getUserId();

    // Always save to localStorage
    const localQuotes = JSON.parse(localStorage.getItem('quotes') || '[]');

    // Check if quote already exists (prevent duplicates)
    const existingIndex = localQuotes.findIndex((q: Quote) => q.id === quote.id);
    if (existingIndex >= 0) {
        localQuotes[existingIndex] = quote;
    } else {
        localQuotes.push(quote);
    }

    localStorage.setItem('quotes', JSON.stringify(localQuotes));

    // If authenticated, also save to Firebase
    if (userId) {
        try {
            const quoteRef = doc(db, 'users', userId, 'quotes', quote.id);
            await setDoc(quoteRef, quote);
            console.log('✅ Quote guardado en Firebase:', quote.id);
        } catch (error) {
            console.error('❌ Error guardando quote en Firebase:', error);
        }
    } else {
        console.log('⚠️ Usuario no autenticado, quote solo en localStorage');
    }
};

/**
 * Get quotes - Firebase first (if authenticated), fallback to localStorage
 */
export const getQuotes = async (partNumber?: number): Promise<Quote[]> => {
    const userId = getUserId();

    // If authenticated, try Firebase first
    if (userId) {
        try {
            const quotesRef = collection(db, 'users', userId, 'quotes');
            let q = query(quotesRef);

            if (partNumber !== undefined) {
                q = query(quotesRef, where('partNumber', '==', partNumber));
            }

            const snapshot = await getDocs(q);

            const quotes = snapshot.docs.map(doc => {
                const data = doc.data() as Quote;
                return data;
            });

            // Also sync to localStorage
            if (quotes.length > 0) {
                localStorage.setItem('quotes', JSON.stringify(quotes));
            }

            return quotes;
        } catch (error) {
            console.error('❌ Error cargando quotes desde Firebase, usando localStorage:', error);
        }
    } else {
    }

    // Fallback to localStorage
    const stored = localStorage.getItem('quotes');
    const quotes: Quote[] = stored ? JSON.parse(stored) : [];

    if (partNumber !== undefined) {
        const filtered = quotes.filter(q => q.partNumber === partNumber);
        return filtered;
    }

    return quotes;
};

/**
 * Delete quote from Firebase and localStorage
 */
export const deleteQuote = async (quoteId: string): Promise<void> => {
    const userId = getUserId();

    // Delete from localStorage
    const localQuotes = JSON.parse(localStorage.getItem('quotes') || '[]');
    const filtered = localQuotes.filter((q: Quote) => q.id !== quoteId);
    localStorage.setItem('quotes', JSON.stringify(filtered));

    // If authenticated, also delete from Firebase
    if (userId) {
        try {
            const quoteRef = doc(db, 'users', userId, 'quotes', quoteId);
            await deleteDoc(quoteRef);
        } catch (error) {
            console.error('❌ Error eliminando quote de Firebase:', error);
        }
    }
};

// ============================================================================
// BOOKMARKS
// ============================================================================

/**
 * Save bookmark to Firebase (if authenticated) and localStorage (as backup)
 */
export const saveBookmark = async (bookmark: Bookmark): Promise<void> => {
    const userId = getUserId();

    // Always save to localStorage
    const localBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const existingIndex = localBookmarks.findIndex((b: Bookmark) => b.id === bookmark.id);
    if (existingIndex >= 0) {
        localBookmarks[existingIndex] = bookmark;
    } else {
        localBookmarks.push(bookmark);
    }
    localStorage.setItem('bookmarks', JSON.stringify(localBookmarks));

    // If authenticated, also save to Firebase
    if (userId) {
        try {
            const bookmarkRef = doc(db, 'users', userId, 'bookmarks', bookmark.id);
            await setDoc(bookmarkRef, bookmark);
            console.log('✅ Bookmark guardado en Firebase:', bookmark.id);
        } catch (error) {
            console.error('❌ Error guardando bookmark en Firebase:', error);
        }
    } else {
        console.log('⚠️ Usuario no autenticado, bookmark solo en localStorage');
    }
};

/**
 * Get bookmarks - Firebase first (if authenticated), fallback to localStorage
 */
export const getBookmarks = async (partNumber?: number): Promise<Bookmark[]> => {
    const userId = getUserId();

    // If authenticated, try Firebase first
    if (userId) {
        try {
            const bookmarksRef = collection(db, 'users', userId, 'bookmarks');
            let q = query(bookmarksRef);

            if (partNumber !== undefined) {
                q = query(bookmarksRef, where('partNumber', '==', partNumber));
            }

            const snapshot = await getDocs(q);

            const bookmarks = snapshot.docs.map(doc => {
                const data = doc.data() as Bookmark;
                return data;
            });

            // Also sync to localStorage
            if (bookmarks.length > 0) {
                localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            }

            return bookmarks;
        } catch (error) {
            console.error('❌ Error cargando bookmarks desde Firebase, usando localStorage:', error);
        }
    } else {
    }

    // Fallback to localStorage
    const stored = localStorage.getItem('bookmarks');
    const bookmarks: Bookmark[] = stored ? JSON.parse(stored) : [];

    if (partNumber !== undefined) {
        const filtered = bookmarks.filter(b => b.partNumber === partNumber);
        return filtered;
    }
    return bookmarks;
};

/**
 * Delete bookmark from Firebase and localStorage
 */
export const deleteBookmark = async (bookmarkId: string): Promise<void> => {
    const userId = getUserId();

    // Delete from localStorage
    const localBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const filtered = localBookmarks.filter((b: Bookmark) => b.id !== bookmarkId);
    localStorage.setItem('bookmarks', JSON.stringify(filtered));

    // If authenticated, also delete from Firebase
    if (userId) {
        try {
            const bookmarkRef = doc(db, 'users', userId, 'bookmarks', bookmarkId);
            await deleteDoc(bookmarkRef);
        } catch (error) {
            console.error('❌ Error eliminando bookmark de Firebase:', error);
        }
    }
};

// ============================================================================
// READING PROGRESS
// ============================================================================

/**
 * Save reading progress to Firebase (if authenticated) and localStorage (as backup)
 */
export const saveReadingProgress = async (
    partNumber: number,
    progress: ReadingProgress
): Promise<void> => {
    const userId = getUserId();

    // Always save to localStorage
    localStorage.setItem(`reading-progress-part-${partNumber}`, JSON.stringify(progress));

    // If authenticated, also save to Firebase
    if (userId) {
        try {
            const progressRef = doc(db, 'users', userId, 'readingProgress', `part-${partNumber}`);
            await setDoc(progressRef, progress);
        } catch (error) {
            console.error('❌ Error guardando progreso en Firebase:', error);
        }
    }
};

/**
 * Get reading progress - Firebase first (if authenticated), fallback to localStorage
 */
export const getReadingProgress = async (partNumber?: number): Promise<ReadingProgress | ReadingProgress[] | null> => {
    const userId = getUserId();

    // If specific part requested
    if (partNumber !== undefined) {
        // If authenticated, try Firebase first
        if (userId) {
            try {
                const progressRef = doc(db, 'users', userId, 'readingProgress', `part-${partNumber}`);
                const snapshot = await getDoc(progressRef);

                if (snapshot.exists()) {
                    return snapshot.data() as ReadingProgress;
                }
            } catch (error) {
                console.error('❌ Error cargando progreso desde Firebase, usando localStorage:', error);
            }
        }

        // Fallback to localStorage
        const saved = localStorage.getItem(`reading-progress-part-${partNumber}`);
        return saved ? JSON.parse(saved) : null;
    }

    // Get all progress
    if (userId) {
        try {
            const progressRef = collection(db, 'users', userId, 'readingProgress');
            const snapshot = await getDocs(progressRef);
            const allProgress = snapshot.docs.map(doc => doc.data() as ReadingProgress);
            return allProgress;
        } catch (error) {
            console.error('❌ Error cargando progreso desde Firebase, usando localStorage:', error);
        }
    }

    // Fallback to localStorage
    const allProgress: ReadingProgress[] = [];
    for (let i = 1; i <= 4; i++) {
        const saved = localStorage.getItem(`reading-progress-part-${i}`);
        if (saved) {
            allProgress.push(JSON.parse(saved));
        }
    }
    return allProgress;
};

/**
 * Clear reading progress from Firebase and localStorage
 */
export const clearReadingProgress = async (partNumber: number): Promise<void> => {
    const userId = getUserId();

    // Clear from localStorage
    localStorage.removeItem(`reading-progress-part-${partNumber}`);

    // If authenticated, also clear from Firebase
    if (userId) {
        try {
            const progressRef = doc(db, 'users', userId, 'readingProgress', `part-${partNumber}`);
            await deleteDoc(progressRef);
        } catch (error) {
            console.error('❌ Error eliminando progreso de Firebase:', error);
        }
    }
};

// ============================================================================
// USER PROFILE
// ============================================================================

/**
 * Initialize or update user profile
 */
export const initializeUserProfile = async (): Promise<void> => {
    const user = getCurrentUser();
    if (!user) return;

    try {
        const profileRef = doc(db, 'users', user.uid, 'profile', 'info');
        const profileSnap = await getDoc(profileRef);

        const profileData: UserProfile = {
            userId: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            lastLogin: new Date().toISOString(),
            createdAt: profileSnap.exists() ? profileSnap.data().createdAt : new Date().toISOString()
        };

        await setDoc(profileRef, profileData);
    } catch (error) {
        console.error('❌ Error inicializando perfil de usuario:', error);
    }
};

// ============================================================================
// USER PREFERENCES
// ============================================================================

/**
 * Get default user preferences
 */
const getDefaultPreferences = (): UserPreferences => ({
    readingMode: 'horizontal',
    fontSize: 16,
    hasSeenTutorial: false,
    hasConfigured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
});

/**
 * Save user preferences to Firebase (if authenticated) and localStorage (as backup)
 */
export const saveUserPreferences = async (preferences: UserPreferences): Promise<void> => {
    const userId = getUserId();

    console.log('💾 saveUserPreferences called:', preferences);

    // Update timestamp
    const preferencesWithTimestamp = {
        ...preferences,
        updatedAt: new Date().toISOString()
    };

    // Always save to localStorage
    localStorage.setItem('userPreferences', JSON.stringify(preferencesWithTimestamp));

    // If authenticated, also save to Firebase
    if (userId) {
        try {
            const preferencesRef = doc(db, 'users', userId, 'preferences', 'settings');
            await setDoc(preferencesRef, preferencesWithTimestamp);
            console.log('✅ Preferences guardadas en Firebase');
        } catch (error) {
            console.error('❌ Error guardando preferences en Firebase:', error);
        }
    } else {
        console.log('⚠️ Usuario no autenticado, preferences solo en localStorage');
    }
};

/**
 * Get user preferences - Firebase first (if authenticated), fallback to localStorage
 */
export const getUserPreferences = async (): Promise<UserPreferences> => {
    const userId = getUserId();

    console.log('🔍 getUserPreferences called:', { userId });

    // If authenticated, try Firebase first
    if (userId) {
        try {
            const preferencesRef = doc(db, 'users', userId, 'preferences', 'settings');
            const snapshot = await getDoc(preferencesRef);

            if (snapshot.exists()) {
                const preferences = snapshot.data() as UserPreferences;

                // Also sync to localStorage
                localStorage.setItem('userPreferences', JSON.stringify(preferences));

                return preferences;
            } else {
                console.log('⚠️ No hay preferences en Firebase, usando defaults');
            }
        } catch (error) {
            console.error('❌ Error cargando preferences desde Firebase, usando localStorage:', error);
        }
    } else {
        console.log('⚠️ Usuario no autenticado, usando localStorage para preferences');
    }

    // Fallback to localStorage
    const stored = localStorage.getItem('userPreferences');
    if (stored) {
        const preferences = JSON.parse(stored) as UserPreferences;
        return preferences;
    }

    // Return defaults if nothing found
    return getDefaultPreferences();
};

/**
 * Update a specific preference
 */
export const updatePreference = async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
): Promise<void> => {
    const currentPreferences = await getUserPreferences();
    const updatedPreferences = {
        ...currentPreferences,
        [key]: value,
        updatedAt: new Date().toISOString()
    };
    await saveUserPreferences(updatedPreferences);
    console.log(`✅ Preference actualizada: ${key} = ${value}`);
};

/**
 * Check if user has configured their preferences
 */
export const hasUserConfigured = async (): Promise<boolean> => {
    const preferences = await getUserPreferences();
    return preferences.hasConfigured;
};

