/**
 * Storage Service - Simplified version without Firebase Storage
 * 
 * Este servicio maneja referencias a archivos locales en la carpeta public
 * Los PDFs deben colocarse manualmente en /public/
 */

export type FileType = 'pdf' | 'image' | 'video';

/**
 * Genera una URL para un PDF en la carpeta public
 * Los archivos deben estar en /public/BDUEMP{partNumber}.pdf
 */
export const uploadPartPDF = async (
    file: File,
    partNumber: number
): Promise<string> => {
    // En lugar de subir a Firebase Storage, retornamos la ruta esperada en public
    const filename = `BDUEMP${partNumber}.pdf`;
    const publicUrl = `/${filename}`;

    return publicUrl;
};

/**
 * Genera una URL para una imagen
 */
export const uploadImage = async (
    file: File,
    folder: string = 'general'
): Promise<string> => {
    const filename = `${folder}_${Date.now()}_${file.name}`;
    const publicUrl = `/images/${filename}`;

    return publicUrl;
};

/**
 * Genera una URL para un video
 */
export const uploadVideo = async (
    file: File,
    folder: string = 'general'
): Promise<string> => {
    const filename = `${folder}_${Date.now()}_${file.name}`;
    const publicUrl = `/videos/${filename}`;

    return publicUrl;
};

/**
 * Elimina una referencia de archivo (no elimina el archivo físico)
 */
export const deleteFile = async (fileUrl: string): Promise<void> => {
};

/**
 * Obtiene la URL de un archivo (ya es una URL pública)
 */
export const getFileURL = async (path: string): Promise<string> => {
    return path;
};
