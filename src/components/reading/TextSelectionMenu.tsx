import React, { useState } from 'react';
import { Highlighter, Star, Share2, X } from 'lucide-react';
import { saveHighlight } from '../../utils/highlightManager';
import { saveQuote } from '../../utils/quotesManager';
import ShareMenu from './ShareMenu';
import './TextSelectionMenu.css';

interface TextSelectionMenuProps {
    text: string;
    position: { x: number; y: number };
    partNumber: number;
    partTitle: string;
    chapterIndex: number;
    chapterTitle: string;
    pageNumber: number;
    onClose: () => void;
}

export default function TextSelectionMenu({
    text,
    position,
    partNumber,
    partTitle,
    chapterIndex,
    chapterTitle,
    pageNumber,
    onClose
}: TextSelectionMenuProps) {
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);

    const handleHighlight = (color: 'yellow' | 'green' | 'blue') => {
        console.log('🎨 handleHighlight llamado con color:', color);
        try {
            saveHighlight(text, color, partNumber, chapterIndex, pageNumber);
            console.log('✅ Resaltado guardado:', { text, color });
            alert(`✅ Texto resaltado en ${color === 'yellow' ? 'amarillo' : color === 'green' ? 'verde' : 'azul'}!`);
            setShowColorPicker(false);
            onClose();
        } catch (error) {
            console.error('❌ Error al guardar resaltado:', error);
            alert('❌ Error al guardar el resaltado');
        }
    };

    const handleSaveQuote = () => {
        console.log('⭐ handleSaveQuote llamado');
        try {
            saveQuote(text, partNumber, partTitle, chapterTitle, pageNumber);
            console.log('✅ Cita guardada:', { text, partTitle, chapterTitle });
            alert('⭐ ¡Cita guardada exitosamente!');
            onClose();
        } catch (error) {
            console.error('❌ Error al guardar cita:', error);
            alert('❌ Error al guardar la cita');
        }
    };

    const handleHighlightClick = () => {
        console.log('🖱️ Click en botón Resaltar');
        setShowColorPicker(!showColorPicker);
    };

    const handleShareClick = () => {
        console.log('🖱️ Click en botón Compartir');
        setShowShareMenu(!showShareMenu);
    };

    console.log('📋 TextSelectionMenu renderizado:', { text, position, showColorPicker, showShareMenu });

    return (
        <div
            className="text-selection-menu"
            style={{
                left: `${position.x}px`,
                top: `${position.y - 60}px`
            }}
            onClick={(e) => {
                console.log('🖱️ Click en menu container');
                e.stopPropagation();
            }}
        >
            <div className="menu-options">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleHighlightClick();
                    }}
                    title="Resaltar"
                    className={showColorPicker ? 'active' : ''}
                >
                    <Highlighter size={18} />
                </button>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSaveQuote();
                    }}
                    title="Guardar cita"
                >
                    <Star size={18} />
                </button>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleShareClick();
                    }}
                    title="Compartir"
                    className={showShareMenu ? 'active' : ''}
                >
                    <Share2 size={18} />
                </button>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log('🖱️ Click en botón Cerrar');
                        onClose();
                    }}
                    title="Cerrar"
                >
                    <X size={16} />
                </button>
            </div>

            {showColorPicker && (
                <div className="color-picker">
                    <button
                        className="color-btn color-yellow"
                        onClick={() => handleHighlight('yellow')}
                        title="Amarillo"
                    />
                    <button
                        className="color-btn color-green"
                        onClick={() => handleHighlight('green')}
                        title="Verde"
                    />
                    <button
                        className="color-btn color-blue"
                        onClick={() => handleHighlight('blue')}
                        title="Azul"
                    />
                </div>
            )}

            {showShareMenu && (
                <ShareMenu
                    text={text}
                    partNumber={partNumber}
                    partTitle={partTitle}
                    chapterTitle={chapterTitle}
                    pageNumber={pageNumber}
                    onClose={() => setShowShareMenu(false)}
                />
            )}
        </div>
    );
}
