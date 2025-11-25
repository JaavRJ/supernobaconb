export interface Highlight {
    id: string;
    text: string;
    color: 'yellow' | 'green' | 'blue';
    partNumber: number;
    chapterIndex: number;
    pageNumber: number;
    createdAt: string;
}

export const saveHighlight = (
    text: string,
    color: 'yellow' | 'green' | 'blue',
    partNumber: number,
    chapterIndex: number,
    pageNumber: number
): void => {
    const highlights = getHighlights();
    const newHighlight: Highlight = {
        id: Date.now().toString(),
        text: text.trim(),
        color,
        partNumber,
        chapterIndex,
        pageNumber,
        createdAt: new Date().toISOString(),
    };

    highlights.push(newHighlight);
    localStorage.setItem('highlights', JSON.stringify(highlights));
    console.log('💾 Highlight guardado:', newHighlight);
};

export const getHighlights = (partNumber?: number, chapterIndex?: number): Highlight[] => {
    const stored = localStorage.getItem('highlights');
    const highlights: Highlight[] = stored ? JSON.parse(stored) : [];

    if (partNumber !== undefined && chapterIndex !== undefined) {
        return highlights.filter(
            h => h.partNumber === partNumber && h.chapterIndex === chapterIndex
        );
    }

    return highlights;
};

export const deleteHighlight = (id: string): void => {
    const highlights = getHighlights();
    const filtered = highlights.filter(h => h.id !== id);
    localStorage.setItem('highlights', JSON.stringify(filtered));
};

export const exportHighlights = (): string => {
    const highlights = getHighlights();
    return JSON.stringify(highlights, null, 2);
};

// Apply highlights to HTML content
export const applyHighlightsToHTML = (
    htmlContent: string,
    highlights: Highlight[]
): string => {
    let result = htmlContent;

    // Sort highlights by text length (longest first) to avoid nested highlights
    const sortedHighlights = [...highlights].sort((a, b) => b.text.length - a.text.length);

    sortedHighlights.forEach(highlight => {
        const escapedText = highlight.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedText})`, 'gi');
        result = result.replace(regex, `<mark class="highlight-${highlight.color}" data-highlight-id="${highlight.id}">$1</mark>`);
    });

    return result;
};
