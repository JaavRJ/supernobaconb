import React, { useState } from 'react';
import { Maximize2, ArrowRight } from 'lucide-react';
import KindleReader from './KindleReader';
import { getPartChapters } from '../../data/sampleChapters';
import './ImmersiveModeButton.css';

interface ImmersiveModeButtonProps {
    partNumber: number;
    partTitle: string;
}

export default function ImmersiveModeButton({ partNumber, partTitle }: ImmersiveModeButtonProps) {
    const [showKindleReader, setShowKindleReader] = useState(false);

    const handleOpenReader = () => {
        const chapters = getPartChapters(partNumber);
        if (chapters.length === 0) {
            alert(`No hay capítulos disponibles para ${partTitle}`);
            return;
        }
        setShowKindleReader(true);
    };

    return (
        <>
            <div className="immersive-mode-wrapper">
                <span className="immersive-tooltip">Empieza a leer desde la app</span>
                <ArrowRight className="immersive-arrow-icon" size={24} />
                <button
                    className="immersive-mode-btn"
                    onClick={handleOpenReader}
                    aria-label="Activar modo lectura Kindle"
                >
                    <Maximize2 size={20} />
                    <span>Lectura</span>
                </button>
            </div>

            {showKindleReader && (
                <KindleReader
                    chapters={getPartChapters(partNumber)}
                    currentChapterIndex={0}
                    onClose={() => setShowKindleReader(false)}
                    partNumber={partNumber}
                    partTitle={partTitle}
                />
            )}
        </>
    );
}
