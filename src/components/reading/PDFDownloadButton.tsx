import React, { useState } from 'react';
import { Download, ArrowRight } from 'lucide-react';
import { getPDFUrl, getPDFFilename } from '../../data/pdfLinks';
import './PDFDownloadButton.css';

interface PDFDownloadButtonProps {
    partNumber: number;
    partTitle: string;
}

export default function PDFDownloadButton({
    partNumber,
    partTitle
}: PDFDownloadButtonProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        const pdfUrl = getPDFUrl(partNumber);

        if (!pdfUrl || pdfUrl.startsWith('TU_URL_AQUI')) {
            alert('⚠️ La URL del PDF no está configurada. Por favor, actualiza el archivo pdfLinks.ts con la URL correcta.');
            return;
        }

        setIsDownloading(true);
        try {
            // Crear un enlace temporal para descargar el PDF
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = getPDFFilename(partNumber);
            link.target = '_blank'; // Abrir en nueva pestaña como fallback
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            alert('Error al descargar el PDF. Por favor, intenta de nuevo.');
        } finally {
            // Pequeño delay para mostrar el estado de descarga
            setTimeout(() => setIsDownloading(false), 1000);
        }
    };

    return (
        <div className="pdf-download-wrapper">
            <span className="pdf-tooltip">Descarga la parte en pdf</span>
            <ArrowRight className="pdf-arrow-icon" size={24} />
            <button
                className="pdf-download-btn"
                onClick={handleDownload}
                disabled={isDownloading}
                aria-label={`Descargar ${partTitle} como PDF`}
            >
                <Download size={20} />
                <span>{isDownloading ? 'Descargando...' : 'PDF'}</span>
            </button>
        </div>
    );
}
