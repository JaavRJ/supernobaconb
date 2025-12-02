import html2canvas from 'html2canvas';

export type QuoteTheme = 'white' | 'black' | 'beige' | 'blue' | 'pink' | 'mint' | 'lavender' | 'peach' | 'gray' | 'cream';


export interface QuoteImageOptions {
    text: string;
    partTitle: string;
    chapterTitle: string;
    pageNumber: number;
    theme: QuoteTheme;
}

/**
 * Genera una imagen de la cita usando html2canvas
 * @param elementId - ID del elemento HTML a capturar
 * @returns Promise con el blob de la imagen
 */
export const generateQuoteImage = async (elementId: string): Promise<Blob> => {
    const element = document.getElementById(elementId);

    if (!element) {
        throw new Error('Elemento no encontrado');
    }

    try {
        // Configuración optimizada para Instagram Stories (1080x1920)
        const canvas = await html2canvas(element, {
            backgroundColor: null,
            scale: 1, // Escala 1:1 porque el elemento ya tiene el tamaño correcto
            logging: false,
            useCORS: true,
            allowTaint: true,
            windowWidth: 1080,
            windowHeight: 1920,
        });

        // Convertir canvas a blob
        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Error al generar imagen'));
                    }
                },
                'image/png',
                1.0 // Máxima calidad
            );
        });
    } catch (error) {
        console.error('Error al generar imagen:', error);
        throw error;
    }
};

/**
 * Comparte la imagen en Instagram Stories usando Web Share API
 * @param blob - Blob de la imagen
 * @param text - Texto de la cita (para fallback)
 */
export const shareToInstagram = async (blob: Blob, text: string): Promise<void> => {
    try {
        // Crear archivo desde blob
        const file = new File([blob], 'quote.png', { type: 'image/png' });

        // Verificar si el navegador soporta Web Share API con archivos
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Cita del libro',
                text: text,
            });
            console.log('✅ Compartido exitosamente en Instagram');
        } else {
            // Fallback: descargar la imagen
            console.log('⚠️ Web Share API no disponible, descargando imagen...');
            downloadImage(blob, 'cita-instagram.png');
        }
    } catch (error) {
        if ((error as Error).name === 'AbortError') {
            console.log('ℹ️ Usuario canceló el compartir');
        } else {
            console.error('❌ Error al compartir:', error);
            // Fallback en caso de error
            downloadImage(blob, 'cita-instagram.png');
        }
    }
};

/**
 * Descarga la imagen como archivo
 * @param blob - Blob de la imagen
 * @param filename - Nombre del archivo
 */
export const downloadImage = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('✅ Imagen descargada:', filename);
};

/**
 * Verifica si el dispositivo puede compartir en Instagram
 */
export const canShareToInstagram = (): boolean => {
    if (!navigator.share || !navigator.canShare) {
        return false;
    }

    // Verificar si el navegador soporta compartir archivos
    try {
        const testFile = new File([''], 'test.png', { type: 'image/png' });
        return navigator.canShare({ files: [testFile] });
    } catch {
        return false;
    }
};


/**
 * Detecta si el usuario está en un dispositivo móvil
 */
export const isMobileDevice = (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
};

/**
 * Obtiene el mensaje apropiado para el usuario según su dispositivo
 */
export const getShareMessage = (): string => {
    if (canShareToInstagram()) {
        return 'Compartir en Instagram Stories';
    } else if (isMobileDevice()) {
        return 'Descargar para Instagram';
    } else {
        return 'Descargar imagen';
    }
};
