import React, { useState } from 'react';
import { Twitter, Facebook, MessageCircle, Copy, Check } from 'lucide-react';
import { shareQuote } from '../../utils/quotesManager';
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

export default function ShareMenu({
    text,
    partNumber,
    partTitle,
    chapterTitle,
    pageNumber,
    onClose
}: ShareMenuProps) {
    const [copied, setCopied] = useState(false);

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
        console.log(`📤 Compartiendo en ${platform}:`, text);
        shareQuote(quote, platform);

        if (platform === 'copy') {
            setCopied(true);
            console.log('✅ Texto copiado al portapapeles');
            setTimeout(() => {
                setCopied(false);
                onClose();
            }, 1500);
        } else {
            console.log(`✅ Abriendo ${platform}...`);
            onClose();
        }
    };

    return (
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

            <button onClick={() => handleShare('copy')} title="Copiar al portapapeles">
                {copied ? <Check size={18} /> : <Copy size={18} />}
                <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
            </button>
        </div>
    );
}
