import React, { useState, useEffect } from 'react';
import { Star, Trash2, X, Camera, Check } from 'lucide-react';
import { getQuotes, deleteQuote, shareQuote, type Quote } from '../../utils/quotesManager';
import { generateQuoteImage, shareToInstagram, QuoteTheme } from '../../utils/instagramShareUtils';
import InstagramQuoteCard from './InstagramQuoteCard';
import './SavedQuotes.css';

interface SavedQuotesProps {
    partNumber?: number;
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

export default function SavedQuotes({ partNumber, onClose }: SavedQuotesProps) {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
    const [selectedColor, setSelectedColor] = useState<QuoteTheme>('beige');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        loadQuotes();
    }, [partNumber]);

    const loadQuotes = () => {
        const allQuotes = getQuotes(partNumber);
        setQuotes(allQuotes);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('¿Eliminar esta cita?')) {
            deleteQuote(id);
            loadQuotes();
        }
    };

    const handleShare = (quote: Quote, platform: 'twitter' | 'facebook' | 'whatsapp' | 'copy') => {
        shareQuote(quote, platform);
        if (platform === 'copy') {
            alert('✅ Cita copiada al portapapeles');
        }
    };

    const handleInstagramClick = (quote: Quote) => {
        setSelectedQuote(quote);
        setShowColorPicker(true);
    };

    const handleColorSelect = async () => {
        if (!selectedQuote) return;

        setIsGenerating(true);

        try {
            // Esperar un momento para que el componente se renderice
            await new Promise(resolve => setTimeout(resolve, 200));

            // Generar imagen con el color seleccionado
            const blob = await generateQuoteImage(`instagram-quote-saved-${selectedQuote.id}`);

            // Compartir en Instagram
            await shareToInstagram(blob, selectedQuote.text);

            console.log('✅ Imagen generada y compartida exitosamente');
            setShowColorPicker(false);
            setSelectedQuote(null);
        } catch (error) {
            console.error('❌ Error al generar/compartir imagen:', error);
            alert('Error al generar la imagen. Por favor, intenta de nuevo.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            <div className="saved-quotes-overlay">
                <div className="saved-quotes-panel">
                    <div className="saved-quotes-header">
                        <h2>
                            <Star size={24} />
                            Citas Guardadas ({quotes.length})
                        </h2>
                        <button onClick={onClose} className="close-btn">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="quotes-list">
                        {quotes.length === 0 ? (
                            <div className="empty-state">
                                <Star size={48} />
                                <p>No hay citas guardadas aún</p>
                                <small>Selecciona texto y presiona ⭐ para guardar citas</small>
                            </div>
                        ) : (
                            quotes.map((quote) => (
                                <div key={quote.id} className="quote-card">
                                    <div className="quote-text">"{quote.text}"</div>
                                    <div className="quote-meta">
                                        <span>{quote.partTitle} — {quote.chapterTitle}</span>
                                        <span>Página {quote.pageNumber}</span>
                                    </div>
                                    <div className="quote-actions">
                                        <button onClick={() => handleShare(quote, 'copy')} title="Copiar">
                                            📋
                                        </button>
                                        <button onClick={() => handleShare(quote, 'twitter')} title="Twitter">
                                            🐦
                                        </button>
                                        <button onClick={() => handleShare(quote, 'facebook')} title="Facebook">
                                            📘
                                        </button>
                                        <button onClick={() => handleShare(quote, 'whatsapp')} title="WhatsApp">
                                            💬
                                        </button>
                                        <button
                                            onClick={() => handleInstagramClick(quote)}
                                            title="Compartir en Instagram"
                                            className="instagram-action-btn"
                                        >
                                            <Camera size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(quote.id)}
                                            className="delete-btn"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de selección de color con preview */}
            {showColorPicker && selectedQuote && (
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
                                    text={selectedQuote.text}
                                    partTitle={selectedQuote.partTitle}
                                    chapterTitle={selectedQuote.chapterTitle}
                                    pageNumber={selectedQuote.pageNumber}
                                    theme={selectedColor}
                                    elementId={`instagram-quote-saved-display-${selectedQuote.id}`}
                                />
                            </div>
                        </div>

                        {/* Tarjeta oculta a tamaño completo para captura */}
                        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                            <InstagramQuoteCard
                                text={selectedQuote.text}
                                partTitle={selectedQuote.partTitle}
                                chapterTitle={selectedQuote.chapterTitle}
                                pageNumber={selectedQuote.pageNumber}
                                theme={selectedColor}
                                elementId={`instagram-quote-saved-${selectedQuote.id}`}
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
                            onClick={handleColorSelect}
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
