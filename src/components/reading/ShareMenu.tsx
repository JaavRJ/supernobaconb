import React, { useState } from 'react';
import { Twitter, Facebook, MessageCircle, Copy, Check, Camera, X } from 'lucide-react';
import { shareQuote } from '../../utils/quotesManager';
import { generateQuoteImage, shareToInstagram, QuoteTheme } from '../../utils/instagramShareUtils';
import InstagramQuoteCard from './InstagramQuoteCard';
import type { Quote } from '../../utils/quotesManager';
import './ShareMenu.css';

interface ShareMenuProps {
    text: string;
    partNumber: number;
    partTitle: string;
    chapterTitle: string;
    pageNumber: number;
    onClose: () => void;
}

const COLOR_OPTIONS: { theme: QuoteTheme; name: string; color: string }[] = [
    { theme: 'white', name: 'Blanco', color: '#FFFFFF' },
    { theme: 'black', name: 'Negro', color: '#1a1a1a' },
    { theme: 'beige', name: 'Beige', color: '#F5F1E8' },
    { theme: 'blue', name: 'Azul', color: '#E8F4F8' },
    { theme: 'pink', name: 'Rosa', color: '#FFE5EC' },
    { theme: 'mint', name: 'Menta', color: '#E8F8F5' },
    { theme: 'lavender', name: 'Lavanda', color: '#F0E8F8' },
    { theme: 'peach', name: 'Melocotón', color: '#FFE8D8' },
    { theme: 'gray', name: 'Gris', color: '#F5F5F5' },
    { theme: 'cream', name: 'Crema', color: '#FFF8E7' },
];

export default function ShareMenu({
    text,
    partNumber,
    partTitle,
    chapterTitle,
    pageNumber,
    onClose
}: ShareMenuProps) {
    const [copied, setCopied] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [selectedColor, setSelectedColor] = useState<QuoteTheme>('beige');
    const [isGenerating, setIsGenerating] = useState(false);

    const quote: Quote = {
        id: Date.now().toString(),
        text,
        partNumber,
        partTitle,
        chapterTitle,
        pageNumber,
        createdAt: new Date().toISOString(),
    };

    const handleShare = (platform: 'twitter' | 'facebook' | 'whatsapp' | 'copy') => {
        shareQuote(quote, platform);

        if (platform === 'copy') {
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
                onClose();
            }, 1500);
        } else {
            onClose();
        }
    };

    const handleInstagramClick = () => {
        setShowColorPicker(true);
    };

    const handleColorSelect = async (theme: QuoteTheme) => {
        setIsGenerating(true);

        try {
            // Esperar un momento para que el componente se renderice
            await new Promise(resolve => setTimeout(resolve, 200));

            // Generar imagen con el color seleccionado
            const blob = await generateQuoteImage('instagram-quote-preview');

            // Compartir en Instagram
            await shareToInstagram(blob, text);

            console.log('✅ Imagen generada y compartida exitosamente');
            setShowColorPicker(false);
            onClose();
        } catch (error) {
            console.error('❌ Error al generar/compartir imagen:', error);
            alert('Error al generar la imagen. Por favor, intenta de nuevo.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            <div className="share-menu">
                <button onClick={() => handleShare('twitter')} title="Compartir en Twitter">
                    <Twitter size={18} />
                    <span>Twitter</span>
                </button>

                <button onClick={() => handleShare('facebook')} title="Compartir en Facebook">
                    <Facebook size={18} />
                    <span>Facebook</span>
                </button>

                <button onClick={() => handleShare('whatsapp')} title="Compartir en WhatsApp">
                    <MessageCircle size={18} />
                    <span>WhatsApp</span>
                </button>

                <button
                    onClick={handleInstagramClick}
                    title="Compartir en Instagram"
                    className="instagram-btn"
                    disabled={isGenerating}
                >
                    <Camera size={18} />
                    <span>{isGenerating ? 'Generando...' : 'Instagram'}</span>
                </button>

                <button onClick={() => handleShare('copy')} title="Copiar al portapapeles">
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                </button>
            </div>

            {/* Modal de selección de color con preview */}
            {showColorPicker && (
                <div className="color-picker-overlay" onClick={() => !isGenerating && setShowColorPicker(false)}>
                    <div className="color-picker-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="color-picker-header">
                            <h3>Elige el color de fondo</h3>
                            <button
                                onClick={() => setShowColorPicker(false)}
                                className="close-picker-btn"
                                disabled={isGenerating}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Preview de la imagen */}
                        <div className="quote-preview-container">
                            <div className="quote-preview-wrapper">
                                <InstagramQuoteCard
                                    text={text}
                                    partTitle={partTitle}
                                    chapterTitle={chapterTitle}
                                    pageNumber={pageNumber}
                                    theme={selectedColor}
                                    elementId="instagram-quote-preview-display"
                                />
                            </div>
                        </div>

                        {/* Tarjeta oculta a tamaño completo para captura */}
                        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                            <InstagramQuoteCard
                                text={text}
                                partTitle={partTitle}
                                chapterTitle={chapterTitle}
                                pageNumber={pageNumber}
                                theme={selectedColor}
                                elementId="instagram-quote-preview"
                            />
                        </div>

                        {/* Selector de colores */}
                        <div className="color-options-grid">
                            {COLOR_OPTIONS.map((option) => (
                                <button
                                    key={option.theme}
                                    className={`color-option ${selectedColor === option.theme ? 'selected' : ''}`}
                                    onClick={() => setSelectedColor(option.theme)}
                                    disabled={isGenerating}
                                    style={{
                                        backgroundColor: option.color,
                                        border: option.theme === 'white' ? '2px solid #e0e0e0' : '2px solid transparent'
                                    }}
                                    title={option.name}
                                >
                                    {selectedColor === option.theme && (
                                        <Check size={20} color={option.theme === 'white' || option.theme === 'beige' || option.theme === 'cream' ? '#000' : '#fff'} />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Botón de compartir */}
                        <button
                            className="share-instagram-btn"
                            onClick={() => handleColorSelect(selectedColor)}
                            disabled={isGenerating}
                        >
                            {isGenerating ? 'Generando imagen...' : 'Compartir en Instagram'}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
