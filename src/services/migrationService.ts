import { doc, setDoc, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getCurrentUser } from './authService';
import type { Highlight } from '../utils/highlightManager';
import type { Quote } from '../utils/quotesManager';
import type { Bookmark } from '../utils/bookmarkManager';
import type { ReadingProgress } from './userDataService';

// ============================================================================
// TYPES
// ============================================================================

export interface MigrationResult {
    success: boolean;
    highlightsMigrated: number;
    quotesMigrated: number;
    bookmarksMigrated: number;
    progressMigrated: number;
    errors: string[];
}

interface MigrationStatus {
    completed: boolean;
    completedAt?: string;
    highlightsCount: number;
    quotesCount: number;
    bookmarksCount: number;
    progressCount: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if there is any data in localStorage
 */
export const hasLocalData = (): boolean => {
    const highlights = localStorage.getItem('highlights');
    const quotes = localStorage.getItem('quotes');
    const bookmarks = localStorage.getItem('bookmarks');

    // Check reading progress for parts 1-4
    let hasProgress = false;
    for (let i = 1; i <= 4; i++) {
        if (localStorage.getItem(`reading-progress-part-${i}`)) {
            hasProgress = true;
            break;
        }
    }

    return !!(highlights || quotes || bookmarks || hasProgress);
};

/**
 * Check if migration has already been completed for this user
 */
export const isMigrationCompleted = async (userId: string): Promise<boolean> => {
    try {
        const migrationRef = doc(db, 'users', userId, 'migration', 'status');
        const migrationSnap = await getDoc(migrationRef);

        if (migrationSnap.exists()) {
            const status = migrationSnap.data() as MigrationStatus;
            return status.completed;
        }

        return false;
    } catch (error) {
        console.error('❌ Error verificando estado de migración:', error);
        return false;
    }
};

/**
 * Mark migration as completed
 */
export const markMigrationCompleted = async (
    userId: string,
    counts: {
        highlights: number;
        quotes: number;
        bookmarks: number;
        progress: number;
    }
): Promise<void> => {
    try {
        const migrationRef = doc(db, 'users', userId, 'migration', 'status');
        const status: MigrationStatus = {
            completed: true,
            completedAt: new Date().toISOString(),
            highlightsCount: counts.highlights,
            quotesCount: counts.quotes,
            bookmarksCount: counts.bookmarks,
            progressCount: counts.progress
        };

        await setDoc(migrationRef, status);
    } catch (error) {
        console.error('❌ Error marcando migración como completada:', error);
    }
};

/**
 * Check if user already has data in Firebase
 */
const hasFirebaseData = async (userId: string): Promise<{
    hasData: boolean;
    highlightsCount: number;
    quotesCount: number;
    bookmarksCount: number;
    progressCount: number;
}> => {
    try {
        const { collection, getDocs } = await import('firebase/firestore');

        // Check each collection
        const highlightsRef = collection(db, 'users', userId, 'highlights');
        const quotesRef = collection(db, 'users', userId, 'quotes');
        const bookmarksRef = collection(db, 'users', userId, 'bookmarks');
        const progressRef = collection(db, 'users', userId, 'readingProgress');

        const [highlightsSnap, quotesSnap, bookmarksSnap, progressSnap] = await Promise.all([
            getDocs(highlightsRef),
            getDocs(quotesRef),
            getDocs(bookmarksRef),
            getDocs(progressRef)
        ]);

        const counts = {
            highlightsCount: highlightsSnap.size,
            quotesCount: quotesSnap.size,
            bookmarksCount: bookmarksSnap.size,
            progressCount: progressSnap.size
        };

        const hasData = counts.highlightsCount > 0 ||
            counts.quotesCount > 0 ||
            counts.bookmarksCount > 0 ||
            counts.progressCount > 0;

        return { hasData, ...counts };
    } catch (error) {
        console.error('❌ Error verificando datos en Firebase:', error);
        return {
            hasData: false,
            highlightsCount: 0,
            quotesCount: 0,
            bookmarksCount: 0,
            progressCount: 0
        };
    }
};

/**
 * Download Firebase data to localStorage (replaces local data)
 */
const downloadFirebaseDataToLocal = async (userId: string): Promise<void> => {
    try {
        const { collection, getDocs } = await import('firebase/firestore');

        // Download highlights
        const highlightsRef = collection(db, 'users', userId, 'highlights');
        const highlightsSnap = await getDocs(highlightsRef);
        const highlights = highlightsSnap.docs.map(doc => doc.data());
        if (highlights.length > 0) {
            localStorage.setItem('highlights', JSON.stringify(highlights));
        }

        // Download quotes
        const quotesRef = collection(db, 'users', userId, 'quotes');
        const quotesSnap = await getDocs(quotesRef);
        const quotes = quotesSnap.docs.map(doc => doc.data());
        if (quotes.length > 0) {
            localStorage.setItem('quotes', JSON.stringify(quotes));
        }

        // Download bookmarks
        const bookmarksRef = collection(db, 'users', userId, 'bookmarks');
        const bookmarksSnap = await getDocs(bookmarksRef);
        const bookmarks = bookmarksSnap.docs.map(doc => doc.data());
        if (bookmarks.length > 0) {
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        }

        // Download reading progress
        const progressRef = collection(db, 'users', userId, 'readingProgress');
        const progressSnap = await getDocs(progressRef);
        progressSnap.docs.forEach(doc => {
            const data = doc.data();
            if (data.partNumber) {
                localStorage.setItem(`reading-progress-part-${data.partNumber}`, JSON.stringify(data));
            }
        });

    } catch (error) {
        console.error('❌ Error descargando datos de Firebase:', error);
    }
};

// ============================================================================
// MIGRATION HELPER FUNCTIONS
// ============================================================================

/**
 * Migrate highlights from localStorage to Firebase
 */
const migrateHighlights = async (userId: string, batch: any): Promise<number> => {
    const stored = localStorage.getItem('highlights');
    if (!stored) return 0;

    try {
        const highlights: Highlight[] = JSON.parse(stored);

        for (const highlight of highlights) {
            const highlightRef = doc(db, 'users', userId, 'highlights', highlight.id);
            batch.set(highlightRef, highlight);
        }

        return highlights.length;
    } catch (error) {
        console.error('❌ Error preparando highlights para migración:', error);
        return 0;
    }
};

/**
 * Migrate quotes from localStorage to Firebase
 */
const migrateQuotes = async (userId: string, batch: any): Promise<number> => {
    const stored = localStorage.getItem('quotes');
    if (!stored) return 0;

    try {
        const quotes: Quote[] = JSON.parse(stored);

        for (const quote of quotes) {
            const quoteRef = doc(db, 'users', userId, 'quotes', quote.id);
            batch.set(quoteRef, quote);
        }

        return quotes.length;
    } catch (error) {
        console.error('❌ Error preparando quotes para migración:', error);
        return 0;
    }
};

/**
 * Migrate bookmarks from localStorage to Firebase
 */
const migrateBookmarks = async (userId: string, batch: any): Promise<number> => {
    const stored = localStorage.getItem('bookmarks');
    if (!stored) return 0;

    try {
        const bookmarks: Bookmark[] = JSON.parse(stored);

        for (const bookmark of bookmarks) {
            const bookmarkRef = doc(db, 'users', userId, 'bookmarks', bookmark.id);
            batch.set(bookmarkRef, bookmark);
        }

        return bookmarks.length;
    } catch (error) {
        console.error('❌ Error preparando bookmarks para migración:', error);
        return 0;
    }
};

/**
 * Migrate reading progress from localStorage to Firebase
 */
const migrateReadingProgress = async (userId: string, batch: any): Promise<number> => {
    let count = 0;

    try {
        for (let i = 1; i <= 4; i++) {
            const stored = localStorage.getItem(`reading-progress-part-${i}`);
            if (stored) {
                const progress: ReadingProgress = JSON.parse(stored);
                const progressRef = doc(db, 'users', userId, 'readingProgress', `part-${i}`);
                batch.set(progressRef, progress);
                count++;
            }
        }

        return count;
    } catch (error) {
        console.error('❌ Error preparando progreso de lectura para migración:', error);
        return 0;
    }
};

/**
 * Main migration function - migrates all local data to Firebase
 */
export const migrateLocalDataToFirebase = async (): Promise<MigrationResult> => {
    const user = getCurrentUser();

    if (!user) {
        return {
            success: false,
            highlightsMigrated: 0,
            quotesMigrated: 0,
            bookmarksMigrated: 0,
            progressMigrated: 0,
            errors: ['Usuario no autenticado']
        };
    }

    const userId = user.uid;
    const errors: string[] = [];

    // Check if migration already completed
    const alreadyMigrated = await isMigrationCompleted(userId);
    if (alreadyMigrated) {
        return {
            success: true,
            highlightsMigrated: 0,
            quotesMigrated: 0,
            bookmarksMigrated: 0,
            progressMigrated: 0,
            errors: []
        };
    }

    // **NEW: Check if Firebase already has data**
    const firebaseData = await hasFirebaseData(userId);

    if (firebaseData.hasData) {
        await downloadFirebaseDataToLocal(userId);

        // Mark migration as completed
        await markMigrationCompleted(userId, {
            highlights: firebaseData.highlightsCount,
            quotes: firebaseData.quotesCount,
            bookmarks: firebaseData.bookmarksCount,
            progress: firebaseData.progressCount
        });

        return {
            success: true,
            highlightsMigrated: 0,
            quotesMigrated: 0,
            bookmarksMigrated: 0,
            progressMigrated: 0,
            errors: []
        };
    }

    // Check if there's local data to migrate
    if (!hasLocalData()) {
        await markMigrationCompleted(userId, {
            highlights: 0,
            quotes: 0,
            bookmarks: 0,
            progress: 0
        });
        return {
            success: true,
            highlightsMigrated: 0,
            quotesMigrated: 0,
            bookmarksMigrated: 0,
            progressMigrated: 0,
            errors: []
        };
    }

    try {
        // Use batch write for efficiency (max 500 operations per batch)
        const batch = writeBatch(db);

        // Migrate all data types
        const highlightsCount = await migrateHighlights(userId, batch);
        const quotesCount = await migrateQuotes(userId, batch);
        const bookmarksCount = await migrateBookmarks(userId, batch);
        const progressCount = await migrateReadingProgress(userId, batch);

        // Commit the batch
        await batch.commit();

        // Mark migration as completed
        await markMigrationCompleted(userId, {
            highlights: highlightsCount,
            quotes: quotesCount,
            bookmarks: bookmarksCount,
            progress: progressCount
        });

        return {
            success: true,
            highlightsMigrated: highlightsCount,
            quotesMigrated: quotesCount,
            bookmarksMigrated: bookmarksCount,
            progressMigrated: progressCount,
            errors
        };
    } catch (error: any) {
        console.error('❌ Error durante la migración:', error);
        errors.push(error.message || 'Error desconocido durante la migración');

        return {
            success: false,
            highlightsMigrated: 0,
            quotesMigrated: 0,
            bookmarksMigrated: 0,
            progressMigrated: 0,
            errors
        };
    }
};

/**
 * Sync data from Firebase back to localStorage (for backup)
 */
export const syncFirebaseToLocalStorage = async (): Promise<void> => {
    const user = getCurrentUser();
    if (!user) return;

    try {
        // This would be called by the individual get functions in userDataService
        // which already handle syncing to localStorage
    } catch (error) {
        console.error('❌ Error sincronizando datos:', error);
    }
};
