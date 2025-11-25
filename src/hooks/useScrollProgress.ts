import { useEffect, useState } from 'react';

interface UseScrollProgressReturn {
    progress: number; // 0-100
    scrollLeft: number;
    scrollWidth: number;
    clientWidth: number;
}

export const useScrollProgress = (): UseScrollProgressReturn => {
    const [progress, setProgress] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [scrollWidth, setScrollWidth] = useState(0);
    const [clientWidth, setClientWidth] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollableWidth = document.documentElement.scrollWidth - window.innerWidth;
            const currentScroll = window.scrollX;
            const scrollPercentage = scrollableWidth > 0 ? (currentScroll / scrollableWidth) * 100 : 0;

            setProgress(Math.min(100, Math.max(0, scrollPercentage)));
            setScrollLeft(currentScroll);
            setScrollWidth(document.documentElement.scrollWidth);
            setClientWidth(window.innerWidth);
        };

        // Initial calculation
        handleScroll();

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    return { progress, scrollLeft, scrollWidth, clientWidth };
};
