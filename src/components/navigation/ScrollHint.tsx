import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import './ScrollHint.css';

export default function ScrollHint() {
    const [isVisible, setIsVisible] = useState(true);
    const [hasScrolled, setHasScrolled] = useState(false);

    useEffect(() => {
        // Check if user has seen the hint before
        const hasSeenHint = localStorage.getItem('supernova_scroll_hint_seen');
        if (hasSeenHint) {
            setIsVisible(false);
            return;
        }

        const handleScroll = () => {
            if (window.scrollX > 50 && !hasScrolled) {
                setHasScrolled(true);
                setIsVisible(false);
                localStorage.setItem('supernova_scroll_hint_seen', 'true');
            }
        };

        // Auto-hide after 5 seconds
        const timer = setTimeout(() => {
            setIsVisible(false);
            localStorage.setItem('supernova_scroll_hint_seen', 'true');
        }, 5000);

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timer);
        };
    }, [hasScrolled]);

    if (!isVisible) return null;

    return (
        <div className="scroll-hint">
            <div className="scroll-hint-content">
                <span className="scroll-hint-text font-ui">Desliza</span>
                <ChevronRight className="scroll-hint-arrow" size={24} />
            </div>
        </div>
    );
}
