import { useEffect, useCallback } from 'react';

interface KeyboardNavigationOptions {
    onNext?: () => void;
    onPrevious?: () => void;
    onHome?: () => void;
    onEnd?: () => void;
    onEscape?: () => void;
    enabled?: boolean;
}

export const useKeyboardNavigation = ({
    onNext,
    onPrevious,
    onHome,
    onEnd,
    onEscape,
    enabled = true,
}: KeyboardNavigationOptions) => {
    const handleKeyPress = useCallback(
        (event: KeyboardEvent) => {
            if (!enabled) return;

            // Ignore if user is typing in an input/textarea
            const target = event.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                return;
            }

            switch (event.key) {
                case 'ArrowRight':
                    event.preventDefault();
                    onNext?.();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    onPrevious?.();
                    break;
                case 'Home':
                    event.preventDefault();
                    onHome?.();
                    break;
                case 'End':
                    event.preventDefault();
                    onEnd?.();
                    break;
                case 'Escape':
                    event.preventDefault();
                    onEscape?.();
                    break;
            }
        },
        [enabled, onNext, onPrevious, onHome, onEnd, onEscape]
    );

    useEffect(() => {
        if (!enabled) return;

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [enabled, handleKeyPress]);
};
