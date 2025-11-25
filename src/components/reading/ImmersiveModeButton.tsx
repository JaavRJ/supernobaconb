import React, { useState } from 'react';
import { Maximize2 } from 'lucide-react';
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
            <button
                className="immersive-mode-btn"
                onClick={handleOpenReader}
                title="Modo lectura Kindle (I)"
                aria-label="Activar modo lectura Kindle"
            >
                <Maximize2 size={20} />
                <span>Lectura</span>
            </button>

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
