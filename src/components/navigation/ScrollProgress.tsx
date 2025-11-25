import React from 'react';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import './ScrollProgress.css';

export default function ScrollProgress() {
    const { progress } = useScrollProgress();

    return (
        <div className="scroll-progress-container">
            <div
                className="scroll-progress-bar"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progreso de lectura"
            />
        </div>
    );
}
