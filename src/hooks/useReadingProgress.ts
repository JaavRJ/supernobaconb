import { useState, useEffect } from 'react';

interface ReadingProgress {
    partNumber: number;
    scrollPosition: number;
    lastRead: string; // ISO date string
    completed: boolean;
}

export const useReadingProgress = (partNumber: number) => {
    const [progress, setProgress] = useState<ReadingProgress | null>(null);

    // Load progress from localStorage
    useEffect(() => {
        const savedProgress = localStorage.getItem(`reading-progress-part-${partNumber}`);
        if (savedProgress) {
            setProgress(JSON.parse(savedProgress));
        }
    }, [partNumber]);

    // Save progress
    const saveProgress = (scrollPosition: number, completed: boolean = false) => {
        const newProgress: ReadingProgress = {
            partNumber,
            scrollPosition,
            lastRead: new Date().toISOString(),
            completed,
        };
        setProgress(newProgress);
        localStorage.setItem(`reading-progress-part-${partNumber}`, JSON.stringify(newProgress));
    };

    // Get all reading progress
    const getAllProgress = (): ReadingProgress[] => {
        const allProgress: ReadingProgress[] = [];
        for (let i = 1; i <= 4; i++) {
            const saved = localStorage.getItem(`reading-progress-part-${i}`);
            if (saved) {
                allProgress.push(JSON.parse(saved));
            }
        }
        return allProgress;
    };

    // Clear progress for this part
    const clearProgress = () => {
        localStorage.removeItem(`reading-progress-part-${partNumber}`);
        setProgress(null);
    };

    return {
        progress,
        saveProgress,
        getAllProgress,
        clearProgress,
    };
};
