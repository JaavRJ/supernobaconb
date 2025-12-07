/**
 * Service para cargar contenido de capítulos
 * Lee de Firebase primero, usa datos locales como fallback
 */

import { getAllParts, getPartChapters as getLocalPartChapters } from '../services/contentService';
import { ALL_PARTS } from '../data/sampleChapters';

export interface Chapter {
    number: string;
    title: string;
    content: string;
}

export interface Part {
    partNumber: number;
    partTitle: string;
    description?: string;
    chapters: Chapter[];
}

/**
 * Obtiene todos los capítulos de una parte
 * Intenta leer de Firebase primero, si falla usa datos locales
 */
export async function getPartChapters(partNumber: number): Promise<Chapter[]> {
    try {
        // Intentar cargar de Firebase
        const parts = await getAllParts();
        const part = parts.find(p => p.partNumber === partNumber);

        if (part && part.chapters && part.chapters.length > 0) {
            console.log(`✅ Capítulos cargados desde Firebase para Parte ${partNumber}`);
            return part.chapters;
        }

        // Si no hay datos en Firebase, usar datos locales
        console.log(`⚠️ No hay datos en Firebase, usando datos locales para Parte ${partNumber}`);
        return getLocalChapters(partNumber);
    } catch (error) {
        console.error(`❌ Error cargando de Firebase, usando datos locales para Parte ${partNumber}:`, error);
        return getLocalChapters(partNumber);
    }
}

/**
 * Obtiene capítulos de los datos locales (fallback)
 */
function getLocalChapters(partNumber: number): Chapter[] {
    const part = ALL_PARTS.find(p => p.partNumber === partNumber);
    return part?.chapters || [];
}

/**
 * Obtiene información de una parte
 */
export async function getPartInfo(partNumber: number): Promise<Part | null> {
    try {
        // Intentar cargar de Firebase
        const parts = await getAllParts();
        const part = parts.find(p => p.partNumber === partNumber);

        if (part) {
            console.log(`✅ Información de parte cargada desde Firebase para Parte ${partNumber}`);
            return part;
        }

        // Si no hay datos en Firebase, usar datos locales
        console.log(`⚠️ No hay datos en Firebase, usando datos locales para Parte ${partNumber}`);
        return getLocalPart(partNumber);
    } catch (error) {
        console.error(`❌ Error cargando de Firebase, usando datos locales para Parte ${partNumber}:`, error);
        return getLocalPart(partNumber);
    }
}

/**
 * Obtiene información de parte de los datos locales (fallback)
 */
function getLocalPart(partNumber: number): Part | null {
    const part = ALL_PARTS.find(p => p.partNumber === partNumber);
    if (!part) return null;

    return {
        partNumber: part.partNumber,
        partTitle: part.partTitle,
        description: `Parte ${part.partNumber} del libro`,
        chapters: part.chapters
    };
}

/**
 * Verifica si hay datos en Firebase
 */
export async function hasFirebaseData(): Promise<boolean> {
    try {
        const parts = await getAllParts();
        return parts.length > 0;
    } catch (error) {
        return false;
    }
}
