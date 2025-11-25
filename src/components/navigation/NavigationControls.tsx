import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './NavigationControls.css';

interface NavigationControlsProps {
    onNext: () => void;
    onPrevious: () => void;
    canGoNext: boolean;
    canGoPrevious: boolean;
}

export default function NavigationControls({
    onNext,
    onPrevious,
    canGoNext,
    canGoPrevious,
}: NavigationControlsProps) {
    return (
        <>
            {/* Previous Button */}
            <button
                className="nav-control nav-control-prev glass"
                onClick={onPrevious}
                disabled={!canGoPrevious}
                aria-label="Sección anterior"
                title="Anterior (←)"
            >
                <ChevronLeft size={24} />
            </button>

            {/* Next Button */}
            <button
                className="nav-control nav-control-next glass"
                onClick={onNext}
                disabled={!canGoNext}
                aria-label="Siguiente sección"
                title="Siguiente (→)"
            >
                <ChevronRight size={24} />
            </button>
        </>
    );
}
