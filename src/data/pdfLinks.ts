/**
 * URLs de los PDFs para cada parte del libro
 * Actualiza estas URLs con los enlaces a tus archivos PDF
 */

export interface PartPDF {
    partNumber: number;
    pdfUrl: string;
    filename: string; // Nombre con el que se descargará el archivo
}

export const PDF_LINKS: PartPDF[] = [
    {
        partNumber: 1,
        pdfUrl: '/BDUEMP1.pdf', // Archivo en la carpeta public
        filename: 'BDUEMP1-SupernobaBorrador.pdf'
    },
    {
        partNumber: 2,
        pdfUrl: '/BDUEMP2.pdf', // Archivo en la carpeta public
        filename: 'BDUEMP2-SupernobaBorrador.pdf'
    },
    {
        partNumber: 3,
        pdfUrl: '/BDUEMP3.pdf', // Archivo en la carpeta public
        filename: 'BDUEMP3-SupernobaBorrador.pdf'
    },
    {
        partNumber: 4,
        pdfUrl: '/BDUEMP4.pdf', // Archivo en la carpeta public
        filename: 'BDUEMP4-SupernobaBorrador.pdf'
    },
    // Agrega más partes según necesites
];

/**
 * Obtiene la URL del PDF para una parte específica
 */
export const getPDFUrl = (partNumber: number): string | null => {
    const partPDF = PDF_LINKS.find(p => p.partNumber === partNumber);
    return partPDF?.pdfUrl || null;
};

/**
 * Obtiene el nombre del archivo para una parte específica
 */
export const getPDFFilename = (partNumber: number): string => {
    const partPDF = PDF_LINKS.find(p => p.partNumber === partNumber);
    return partPDF?.filename || `Parte_${partNumber}.pdf`;
};
