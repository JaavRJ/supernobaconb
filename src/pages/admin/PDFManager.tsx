import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Download } from 'lucide-react';
import { getAllPDFs, savePDFInfo, type PartPDF } from '../../services/contentService';
import { uploadPartPDF, deleteFile } from '../../services/storageService';
import './PDFManager.css';

export default function PDFManager() {
    const [pdfs, setPdfs] = useState<PartPDF[]>([]);
    const [uploading, setUploading] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPDFs();
    }, []);

    const loadPDFs = async () => {
        try {
            const allPDFs = await getAllPDFs();
            setPdfs(allPDFs);
        } catch (error) {
            console.error('Error loading PDFs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (partNumber: number, file: File) => {
        if (!file.type.includes('pdf')) {
            alert('❌ Solo se permiten archivos PDF');
            return;
        }

        setUploading(partNumber);

        try {
            const pdfUrl = await uploadPartPDF(file, partNumber);

            await savePDFInfo({
                partNumber,
                pdfUrl,
                filename: file.name
            });

            await loadPDFs();
            alert(
                '✅ Referencia guardada!\n\n' +
                '⚠️ IMPORTANTE: Debes colocar manualmente el archivo en:\n' +
                `/public/BDUEMP${partNumber}.pdf`
            );
        } catch (error) {
            console.error('Error saving PDF reference:', error);
            alert('❌ Error al guardar la referencia del PDF');
        } finally {
            setUploading(null);
        }
    };

    const handleDelete = async (pdf: PartPDF) => {
        if (!window.confirm('¿Estás seguro de eliminar este PDF?')) return;

        try {
            await deleteFile(pdf.pdfUrl);
            await loadPDFs();
            alert('✅ PDF eliminado');
        } catch (error) {
            console.error('Error deleting PDF:', error);
            alert('❌ Error al eliminar el PDF');
        }
    };

    const parts = [1, 2, 3, 4]; // Puedes hacer esto dinámico

    if (loading) {
        return <div className="pdf-manager"><p>Cargando...</p></div>;
    }

    return (
        <div className="pdf-manager">
            <div className="manager-header">
                <h1>Gestión de PDFs</h1>
                <p className="subtitle">Sube los PDFs de cada parte del libro</p>
            </div>

            <div className="pdf-grid">
                {parts.map(partNumber => {
                    const pdf = pdfs.find(p => p.partNumber === partNumber);
                    const isUploading = uploading === partNumber;

                    return (
                        <div key={partNumber} className="pdf-card">
                            <h3>Parte {partNumber}</h3>

                            {pdf ? (
                                <div className="pdf-info">
                                    <div className="pdf-details">
                                        <p className="pdf-filename">{pdf.filename}</p>
                                        <p className="pdf-date">
                                            Subido: {pdf.uploadedAt?.toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="pdf-actions">
                                        <a
                                            href={pdf.pdfUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-icon"
                                            title="Descargar"
                                        >
                                            <Download size={18} />
                                        </a>
                                        <button
                                            className="btn-icon btn-danger"
                                            onClick={() => handleDelete(pdf)}
                                            title="Eliminar"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="pdf-upload">
                                    {isUploading ? (
                                        <p className="uploading-text">Guardando referencia...</p>
                                    ) : (
                                        <label className="upload-label">
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handleUpload(partNumber, file);
                                                    }
                                                }}
                                                style={{ display: 'none' }}
                                            />
                                            <Upload size={32} />
                                            <span>Registrar PDF</span>
                                            <small>Luego coloca el archivo en /public/</small>
                                        </label>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
