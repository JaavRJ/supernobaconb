import React, { useState, useEffect } from 'react';
import { Star, Trash2, X } from 'lucide-react';
import { getQuotes, deleteQuote, shareQuote, type Quote } from '../../utils/quotesManager';
import './SavedQuotes.css';

interface SavedQuotesProps {
    partNumber?: number;
    onClose: () => void;
}

export default function SavedQuotes({ partNumber, onClose }: SavedQuotesProps) {
    const [quotes, setQuotes] = useState<Quote[]>([]);

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

    return (
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
    );
}
