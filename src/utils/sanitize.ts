// Utilidad para sanitizar HTML y prevenir ataques XSS
import DOMPurify from 'dompurify';

/**
 * Sanitiza HTML para prevenir ataques XSS
 * Permite solo tags seguros necesarios para el contenido del libro
 */
export const sanitizeHTML = (html: string): string => {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 'span', 'div', 'mark', 'sup', 'sub',
            'i', 'b', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a'
        ],
        ALLOWED_ATTR: [
            'class', 'data-note-id', 'data-note-type', 'data-highlight-id',
            'style', 'href', 'target', 'rel'
        ],
        ALLOW_DATA_ATTR: true,
        KEEP_CONTENT: true,
        // Prevenir que se ejecute JavaScript
        FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
    });
};

/**
 * Sanitiza texto plano (para quotes, highlights, etc.)
 */
export const sanitizeText = (text: string): string => {
    return DOMPurify.sanitize(text, {
        ALLOWED_TAGS: [],
        KEEP_CONTENT: true
    });
};

/**
 * Sanitiza URL para prevenir javascript: y data: URLs
 */
export const sanitizeURL = (url: string): string => {
    try {
        const parsedURL = new URL(url);
        // Solo permitir http y https
        if (!['http:', 'https:'].includes(parsedURL.protocol)) {
            return '';
        }
        return url;
    } catch {
        return '';
    }
};
