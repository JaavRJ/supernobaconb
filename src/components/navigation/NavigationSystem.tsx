import React, { useCallback } from 'react';
import ScrollProgress from './ScrollProgress';
import NavigationControls from './NavigationControls';
import ScrollHint from './ScrollHint';
import BackToTop from './BackToTop';
import HamburgerMenu from './HamburgerMenu';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';

interface NavigationSystemProps {
    currentEpisode?: number | null;
}

export default function NavigationSystem({ currentEpisode = null }: NavigationSystemProps) {
    // Navigation functions
    const scrollToNext = useCallback(() => {
        const currentScroll = window.scrollX;
        const viewportWidth = window.innerWidth;
        window.scrollTo({
            left: currentScroll + viewportWidth * 0.8,
            behavior: 'smooth',
        });
    }, []);

    const scrollToPrevious = useCallback(() => {
        const currentScroll = window.scrollX;
        const viewportWidth = window.innerWidth;
        window.scrollTo({
            left: Math.max(0, currentScroll - viewportWidth * 0.8),
            behavior: 'smooth',
        });
    }, []);

    const scrollToHome = useCallback(() => {
        window.scrollTo({
            left: 0,
            behavior: 'smooth',
        });
    }, []);

    const scrollToEnd = useCallback(() => {
        window.scrollTo({
            left: document.documentElement.scrollWidth,
            behavior: 'smooth',
        });
    }, []);

    // Check if can navigate
    const canGoNext = window.scrollX < document.documentElement.scrollWidth - window.innerWidth - 10;
    const canGoPrevious = window.scrollX > 10;

    // Setup keyboard navigation
    useKeyboardNavigation({
        onNext: scrollToNext,
        onPrevious: scrollToPrevious,
        onHome: scrollToHome,
        onEnd: scrollToEnd,
        enabled: true,
    });

    return (
        <>
            <ScrollProgress />
            <NavigationControls
                onNext={scrollToNext}
                onPrevious={scrollToPrevious}
                canGoNext={canGoNext}
                canGoPrevious={canGoPrevious}
            />
            <ScrollHint />
            <BackToTop />
            <HamburgerMenu currentEpisode={currentEpisode} />
        </>
    );
}
