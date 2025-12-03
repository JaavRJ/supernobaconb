import { useState, useEffect, useCallback, useRef } from 'react';
import * as userDataService from '../services/userDataService';
import type { ReadingProgress } from '../services/userDataService';

export const useReadingProgress = (partNumber: number) => {
    const [progress, setProgress] = useState<ReadingProgress | null>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load progress from Firebase (or localStorage fallback)
    useEffect(() => {
        const loadProgress = async () => {
            try {
                const savedProgress = await userDataService.getReadingProgress(partNumber);
                if (savedProgress && !Array.isArray(savedProgress)) {
                    setProgress(savedProgress);
                }
            } catch (error) {
                console.error('Error loading reading progress:', error);
            }
        };

        loadProgress();
    }, [partNumber]);

    // Save progress with debouncing (5 seconds)
    const saveProgress = useCallback((scrollPosition: number, completed: boolean = false) => {
        const newProgress: ReadingProgress = {
            partNumber,
            scrollPosition,
            lastRead: new Date().toISOString(),
            completed,
        };

        // Update local state immediately for better UX
        setProgress(newProgress);

        // Clear previous timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Debounce the save operation (5 seconds)
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await userDataService.saveReadingProgress(partNumber, newProgress);
                console.log('✅ Progreso guardado (debounced):', partNumber);
            } catch (error) {
                console.error('Error saving reading progress:', error);
            }
        }, 5000);
    }, [partNumber]);

    // Get all reading progress
    const getAllProgress = useCallback(async (): Promise<ReadingProgress[]> => {
        try {
            const allProgress = await userDataService.getReadingProgress();
            return Array.isArray(allProgress) ? allProgress : [];
        } catch (error) {
            console.error('Error getting all progress:', error);
            return [];
        }
    }, []);

    // Clear progress for this part
    const clearProgress = useCallback(async () => {
        try {
            await userDataService.clearReadingProgress(partNumber);
            setProgress(null);
        } catch (error) {
            console.error('Error clearing progress:', error);
        }
    }, [partNumber]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    return {
        progress,
        saveProgress,
        getAllProgress,
        clearProgress,
    };
};
