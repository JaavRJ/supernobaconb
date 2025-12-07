import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Types
export interface Chapter {
    number: string;
    title: string;
    content: string;
    updatedAt?: Date;
}

export interface Part {
    partNumber: number;
    partTitle: string;
    description?: string;
    chapters: Chapter[];
}

export interface AuthorNote {
    id: string;
    partNumber: number;
    chapterIndex: number;
    triggerText: string;
    noteTitle: string;
    noteContent: string;
    type: 'tooltip' | 'modal';
    createdAt?: Date;
}

export interface PartPDF {
    partNumber: number;
    pdfUrl: string;
    filename: string;
    uploadedAt?: Date;
}

// ==================== PARTS ====================

/**
 * Obtiene todas las partes del libro
 */
export const getAllParts = async (): Promise<Part[]> => {
    try {
        const partsRef = collection(db, 'parts');
        const partsSnapshot = await getDocs(query(partsRef, orderBy('partNumber')));

        const parts: Part[] = [];
        for (const partDoc of partsSnapshot.docs) {
            const partData = partDoc.data();
            const chaptersRef = collection(db, 'parts', partDoc.id, 'chapters');
            const chaptersSnapshot = await getDocs(query(chaptersRef, orderBy('number')));

            const chapters: Chapter[] = chaptersSnapshot.docs.map(chapterDoc => ({
                ...chapterDoc.data(),
                updatedAt: chapterDoc.data().updatedAt?.toDate()
            } as Chapter));

            parts.push({
                partNumber: partData.partNumber,
                partTitle: partData.partTitle,
                description: partData.description,
                chapters
            });
        }

        return parts;
    } catch (error) {
        console.error('Error getting parts:', error);
        return [];
    }
};

/**
 * Obtiene una parte específica
 */
export const getPart = async (partNumber: number): Promise<Part | null> => {
    try {
        const partRef = doc(db, 'parts', partNumber.toString());
        const partDoc = await getDoc(partRef);

        if (!partDoc.exists()) {
            return null;
        }

        const partData = partDoc.data();
        const chaptersRef = collection(db, 'parts', partNumber.toString(), 'chapters');
        const chaptersSnapshot = await getDocs(query(chaptersRef, orderBy('number')));

        const chapters: Chapter[] = chaptersSnapshot.docs.map(chapterDoc => ({
            ...chapterDoc.data(),
            updatedAt: chapterDoc.data().updatedAt?.toDate()
        } as Chapter));

        return {
            partNumber: partData.partNumber,
            partTitle: partData.partTitle,
            description: partData.description,
            chapters
        };
    } catch (error) {
        console.error('Error getting part:', error);
        return null;
    }
};

/**
 * Crea o actualiza una parte
 */
export const savePart = async (part: Omit<Part, 'chapters'>): Promise<void> => {
    try {
        const partRef = doc(db, 'parts', part.partNumber.toString());
        await setDoc(partRef, {
            partNumber: part.partNumber,
            partTitle: part.partTitle,
            description: part.description || ''
        });
        console.log('✅ Part saved:', part.partTitle);
    } catch (error) {
        console.error('❌ Error saving part:', error);
        throw error;
    }
};

// ==================== CHAPTERS ====================

/**
 * Obtiene los capítulos de una parte
 */
export const getChapters = async (partNumber: number): Promise<Chapter[]> => {
    try {
        const chaptersRef = collection(db, 'parts', partNumber.toString(), 'chapters');
        const chaptersSnapshot = await getDocs(query(chaptersRef, orderBy('number')));

        return chaptersSnapshot.docs.map(doc => ({
            ...doc.data(),
            updatedAt: doc.data().updatedAt?.toDate()
        } as Chapter));
    } catch (error) {
        console.error('Error getting chapters:', error);
        return [];
    }
};

/**
 * Obtiene un capítulo específico
 */
export const getChapter = async (partNumber: number, chapterIndex: number): Promise<Chapter | null> => {
    try {
        const chapterRef = doc(
            db,
            'content',
            'book',
            'parts',
            partNumber.toString(),
            'chapters',
            chapterIndex.toString()
        );
        const chapterDoc = await getDoc(chapterRef);

        if (!chapterDoc.exists()) {
            return null;
        }

        return {
            ...chapterDoc.data(),
            updatedAt: chapterDoc.data().updatedAt?.toDate()
        } as Chapter;
    } catch (error) {
        console.error('Error getting chapter:', error);
        return null;
    }
};

/**
 * Guarda un capítulo
 */
export const saveChapter = async (
    partNumber: number,
    chapterIndex: number,
    chapter: Chapter
): Promise<void> => {
    try {
        const chapterRef = doc(
            db,
            'parts',
            partNumber.toString(),
            'chapters',
            chapterIndex.toString()
        );

        await setDoc(chapterRef, {
            ...chapter,
            updatedAt: Timestamp.now()
        });

        console.log('✅ Chapter saved:', chapter.title);
    } catch (error) {
        console.error('❌ Error saving chapter:', error);
        throw error;
    }
};

/**
 * Elimina un capítulo
 */
export const deleteChapter = async (partNumber: number, chapterIndex: number): Promise<void> => {
    try {
        const chapterRef = doc(
            db,
            'parts',
            partNumber.toString(),
            'chapters',
            chapterIndex.toString()
        );
        await deleteDoc(chapterRef);
        console.log('✅ Chapter deleted');
    } catch (error) {
        console.error('❌ Error deleting chapter:', error);
        throw error;
    }
};

// ==================== AUTHOR NOTES ====================

/**
 * Obtiene todas las notas del autor
 */
export const getAllAuthorNotes = async (): Promise<AuthorNote[]> => {
    try {
        const notesRef = collection(db, 'authorNotes');
        const notesSnapshot = await getDocs(notesRef);

        return notesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()
        } as AuthorNote));
    } catch (error) {
        console.error('Error getting author notes:', error);
        return [];
    }
};

/**
 * Obtiene notas de una parte/capítulo específico
 */
export const getAuthorNotesByChapter = async (
    partNumber: number,
    chapterIndex?: number
): Promise<AuthorNote[]> => {
    try {
        const notes = await getAllAuthorNotes();
        return notes.filter(note => {
            if (chapterIndex !== undefined) {
                return note.partNumber === partNumber && note.chapterIndex === chapterIndex;
            }
            return note.partNumber === partNumber;
        });
    } catch (error) {
        console.error('Error getting author notes by chapter:', error);
        return [];
    }
};

/**
 * Guarda una nota del autor
 */
export const saveAuthorNote = async (note: AuthorNote): Promise<void> => {
    try {
        const noteRef = doc(db, 'authorNotes', note.id);
        await setDoc(noteRef, {
            ...note,
            createdAt: Timestamp.now()
        });
        console.log('✅ Author note saved:', note.noteTitle);
    } catch (error) {
        console.error('❌ Error saving author note:', error);
        throw error;
    }
};

/**
 * Elimina una nota del autor
 */
export const deleteAuthorNote = async (noteId: string): Promise<void> => {
    try {
        const noteRef = doc(db, 'authorNotes', noteId);
        await deleteDoc(noteRef);
        console.log('✅ Author note deleted');
    } catch (error) {
        console.error('❌ Error deleting author note:', error);
        throw error;
    }
};

// ==================== PDFS ====================

/**
 * Obtiene información de PDFs
 */
export const getAllPDFs = async (): Promise<PartPDF[]> => {
    try {
        const pdfsRef = collection(db, 'pdfs');
        const pdfsSnapshot = await getDocs(pdfsRef);

        return pdfsSnapshot.docs.map(doc => ({
            ...doc.data(),
            uploadedAt: doc.data().uploadedAt?.toDate()
        } as PartPDF));
    } catch (error) {
        console.error('Error getting PDFs:', error);
        return [];
    }
};

/**
 * Guarda información de un PDF
 */
export const savePDFInfo = async (pdf: PartPDF): Promise<void> => {
    try {
        const pdfRef = doc(db, 'pdfs', pdf.partNumber.toString());
        await setDoc(pdfRef, {
            ...pdf,
            uploadedAt: Timestamp.now()
        });
        console.log('✅ PDF info saved');
    } catch (error) {
        console.error('❌ Error saving PDF info:', error);
        throw error;
    }
};
