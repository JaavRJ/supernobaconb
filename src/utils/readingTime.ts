export const calculateReadingTime = (text: string): number => {
    // Average reading speed: 200-250 words per minute
    // We'll use 225 as a middle ground
    const wordsPerMinute = 225;

    // Count words (split by whitespace and filter empty strings)
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;

    // Calculate minutes
    const minutes = Math.ceil(wordCount / wordsPerMinute);

    return minutes;
};

export const formatReadingTime = (minutes: number): string => {
    if (minutes < 1) {
        return 'Menos de 1 min';
    } else if (minutes === 1) {
        return '1 min';
    } else if (minutes < 60) {
        return `${minutes} min`;
    } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (remainingMinutes === 0) {
            return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
        }
        return `${hours}h ${remainingMinutes}min`;
    }
};

export const getTextContent = (element: HTMLElement | null): string => {
    if (!element) return '';

    // Get all text content, excluding script and style tags
    const clone = element.cloneNode(true) as HTMLElement;
    const scripts = clone.querySelectorAll('script, style');
    scripts.forEach(script => script.remove());

    return clone.textContent || '';
};
