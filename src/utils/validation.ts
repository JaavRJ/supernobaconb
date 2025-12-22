// Validación de datos para prevenir inyección de datos maliciosos
import type { Highlight } from './highlightManager';
import type { Quote } from './quotesManager';
import type { Bookmark } from './bookmarkManager';

/**
 * Valida que un highlight tenga la estructura correcta
 */
export const validateHighlight = (highlight: any): highlight is Highlight => {
    if (!highlight || typeof highlight !== 'object') return false;

    // Validar campos requeridos
    if (!highlight.id || typeof highlight.id !== 'string') return false;
    if (!highlight.text || typeof highlight.text !== 'string') return false;
    if (typeof highlight.partNumber !== 'number') return false;
    if (typeof highlight.chapterIndex !== 'number') return false;

    // Validar límites de tamaño
    if (highlight.text.length > 5000) return false;
    if (highlight.id.length > 100) return false;

    // Validar rangos numéricos
    if (highlight.partNumber < 1 || highlight.partNumber > 10) return false;
    if (highlight.chapterIndex < 0 || highlight.chapterIndex > 100) return false;

    return true;
};

/**
 * Valida que un quote tenga la estructura correcta
 */
export const validateQuote = (quote: any): quote is Quote => {
    if (!quote || typeof quote !== 'object') return false;

    // Validar campos requeridos
    if (!quote.id || typeof quote.id !== 'string') return false;
    if (!quote.text || typeof quote.text !== 'string') return false;
    if (typeof quote.partNumber !== 'number') return false;

    // Validar límites de tamaño
    if (quote.text.length > 5000) return false;
    if (quote.id.length > 100) return false;

    // Validar rangos numéricos
    if (quote.partNumber < 1 || quote.partNumber > 10) return false;

    return true;
};

/**
 * Valida que un bookmark tenga la estructura correcta
 */
export const validateBookmark = (bookmark: any): bookmark is Bookmark => {
    if (!bookmark || typeof bookmark !== 'object') return false;

    // Validar campos requeridos
    if (!bookmark.id || typeof bookmark.id !== 'string') return false;
    if (typeof bookmark.partNumber !== 'number') return false;
    if (typeof bookmark.chapterIndex !== 'number') return false;
    if (typeof bookmark.pageNumber !== 'number') return false;

    // Validar límites
    if (bookmark.id.length > 100) return false;
    if (bookmark.partNumber < 1 || bookmark.partNumber > 10) return false;
    if (bookmark.chapterIndex < 0 || bookmark.chapterIndex > 100) return false;
    if (bookmark.pageNumber < 0 || bookmark.pageNumber > 10000) return false;

    return true;
};

/**
 * Valida email
 */
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
};

/**
 * Valida que un string no contenga caracteres peligrosos
 */
export const validateSafeString = (str: string, maxLength: number = 1000): boolean => {
    if (typeof str !== 'string') return false;
    if (str.length > maxLength) return false;

    // Detectar patrones sospechosos
    const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i, // onclick, onerror, etc.
        /<iframe/i,
        /<object/i,
        /<embed/i
    ];

    return !dangerousPatterns.some(pattern => pattern.test(str));
};
