import { useState, useEffect, useCallback } from 'react';

export const useImmersiveMode = () => {
    const [isImmersive, setIsImmersive] = useState(false);

    // Toggle immersive mode
    const toggleImmersive = useCallback(() => {
        setIsImmersive(prev => !prev);
    }, []);

    // Enable immersive mode
    const enableImmersive = useCallback(() => {
        setIsImmersive(true);
    }, []);

    // Disable immersive mode
    const disableImmersive = useCallback(() => {
        setIsImmersive(false);
    }, []);

    // Keyboard shortcut (F11 or I key)
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // 'I' key to toggle immersive mode
            if (e.key === 'i' || e.key === 'I') {
                if (!e.ctrlKey && !e.metaKey && !e.altKey) {
                    // Only if not typing in an input
                    const target = e.target as HTMLElement;
                    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                        toggleImmersive();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [toggleImmersive]);

    // Apply/remove immersive class to body
    useEffect(() => {
        if (isImmersive) {
            document.body.classList.add('immersive-mode');
        } else {
            document.body.classList.remove('immersive-mode');
        }

        return () => {
            document.body.classList.remove('immersive-mode');
        };
    }, [isImmersive]);

    return {
        isImmersive,
        toggleImmersive,
        enableImmersive,
        disableImmersive,
    };
};
