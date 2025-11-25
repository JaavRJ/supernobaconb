import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import './BackToTop.css';

export default function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show button after scrolling 300px horizontally
            setIsVisible(window.scrollX > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            left: 0,
            behavior: 'smooth',
        });
    };

    if (!isVisible) return null;

    return (
        <button
            className="back-to-top glass"
            onClick={scrollToTop}
            aria-label="Volver al inicio"
            title="Volver al inicio (Home)"
        >
            <ArrowLeft size={20} />
        </button>
    );
}
