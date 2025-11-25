import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { usePDFGenerator } from '../../hooks/usePDFGenerator';
import './PDFDownloadButton.css';

interface PDFDownloadButtonProps {
    contentId: string;
    filename: string;
    partTitle: string;
}

export default function PDFDownloadButton({
    contentId,
    filename,
    partTitle
}: PDFDownloadButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const { generatePDF } = usePDFGenerator();

    const handleDownload = async () => {
        setIsGenerating(true);
        try {
            await generatePDF(contentId, filename);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error al generar el PDF. Por favor, intenta de nuevo.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            className="pdf-download-btn"
            onClick={handleDownload}
            disabled={isGenerating}
            title={`Descargar ${partTitle} como PDF`}
            aria-label={`Descargar ${partTitle} como PDF`}
        >
            <Download size={20} />
            <span>{isGenerating ? 'Generando...' : 'PDF'}</span>
        </button>
    );
}
