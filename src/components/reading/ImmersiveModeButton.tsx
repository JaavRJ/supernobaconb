import React, { useState } from 'react';
import { Maximize2, ArrowRight } from 'lucide-react';
import KindleReader from './KindleReader';
import { getPartChapters } from '../../services/chapterLoaderService';
import './ImmersiveModeButton.css';

interface ImmersiveModeButtonProps {
    partNumber: number;
    partTitle: string;
}

export default function ImmersiveModeButton({ partNumber, partTitle }: ImmersiveModeButtonProps) {
    const [showKindleReader, setShowKindleReader] = useState(false);
    const [chapters, setChapters] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleOpenReader = async () => {
        setLoading(true);
        try {
            const loadedChapters = await getPartChapters(partNumber);
            if (loadedChapters.length === 0) {
                alert(`No hay capítulos disponibles para ${partTitle}`);
                return;
            }
            setChapters(loadedChapters);
            setShowKindleReader(true);
        } catch (error) {
            console.error('Error loading chapters:', error);
            alert('Error al cargar los capítulos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="immersive-mode-wrapper">
                <span className="immersive-tooltip">Empieza a leer desde la app</span>
                <ArrowRight className="immersive-arrow-icon" size={24} />
                <button
                    className="immersive-mode-btn"
                    onClick={handleOpenReader}
                    disabled={loading}
                    aria-label="Activar modo lectura Kindle"
                >
                    <Maximize2 size={20} />
                    <span>{loading ? 'Cargando...' : 'Lectura'}</span>
                </button>
            </div>

            {showKindleReader && chapters.length > 0 && (
                <KindleReader
                    chapters={chapters}
                    currentChapterIndex={0}
                    onClose={() => setShowKindleReader(false)}
                    partNumber={partNumber}
                    partTitle={partTitle}
                />
            )}
        </>
    );
}
