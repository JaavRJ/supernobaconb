import React from 'react';
import { QuoteTheme } from '../../utils/instagramShareUtils';
import './InstagramQuoteCard.css';

interface InstagramQuoteCardProps {
    text: string;
    partTitle: string;
    chapterTitle: string;
    pageNumber: number;
    theme: QuoteTheme;
    elementId: string;
}

export default function InstagramQuoteCard({
    text,
    partTitle,
    chapterTitle,
    pageNumber,
    theme,
    elementId
}: InstagramQuoteCardProps) {
    // Calcular tamaño de fuente basado en longitud del texto
    const getFontSize = () => {
        const length = text.length;
        if (length < 50) return 72;
        if (length < 100) return 64;
        if (length < 150) return 56;
        if (length < 200) return 48;
        if (length < 280) return 42;
        return 38;
    };

    const fontSize = getFontSize();


    return (
        <div
            id={elementId}
            className={`instagram-quote-card theme-${theme}`}
        >
            <div className="quote-card-content">
                {/* Texto principal de la cita */}
                <div className="quote-text-container">
                    <p className="quote-text" style={{ fontSize: `${fontSize}px` }}>
                        {text}
                    </p>
                </div>

                {/* Footer con branding */}
                <div className="quote-branding">
                    <div className="brand-text">Brillo de una Estrella Muerta</div>
                    <div className="brand-url">supernobaconb.web.app</div>
                    <div className="brand-instagram">@imjaviscript</div>
                </div>
            </div>
        </div>
    );
}
