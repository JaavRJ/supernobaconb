import React, { useState } from 'react';
import { Download, ArrowRight } from 'lucide-react';
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
        <div className="pdf-download-wrapper">
            <span className="pdf-tooltip">Descarga la parte en pdf</span>
            <ArrowRight className="pdf-arrow-icon" size={24} />
            <button
                className="pdf-download-btn"
                onClick={handleDownload}
                disabled={isGenerating}
                aria-label={`Descargar ${partTitle} como PDF`}
            >
                <Download size={20} />
                <span>{isGenerating ? 'Generando...' : 'PDF'}</span>
            </button>
        </div>
    );
}
