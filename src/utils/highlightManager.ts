import * as userDataService from '../services/userDataService';

export interface Highlight {
    id: string;
    text: string;
    color: 'yellow' | 'green' | 'blue';
    partNumber: number;
    chapterIndex: number;
    pageNumber: number;
    createdAt: string;
}

export const saveHighlight = async (
    text: string,
    color: 'yellow' | 'green' | 'blue',
    partNumber: number,
    chapterIndex: number,
    pageNumber: number
): Promise<void> => {
    const newHighlight: Highlight = {
        id: Date.now().toString(),
        text: text.trim(),
        color,
        partNumber,
        chapterIndex,
        pageNumber,
        createdAt: new Date().toISOString(),
    };

    await userDataService.saveHighlight(newHighlight);
    console.log('💾 Highlight guardado:', newHighlight);
};

export const getHighlights = async (partNumber?: number, chapterIndex?: number): Promise<Highlight[]> => {
    return await userDataService.getHighlights(partNumber, chapterIndex);
};

export const deleteHighlight = async (id: string): Promise<void> => {
    await userDataService.deleteHighlight(id);
};

export const exportHighlights = async (): Promise<string> => {
    const highlights = await getHighlights();
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
        // Normalize the highlight text (replace multiple spaces/newlines with single space)
        const normalizedHighlightText = highlight.text
            .replace(/\s+/g, ' ')
            .trim();

        // Escape special regex characters
        const escapedText = normalizedHighlightText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Create regex that matches the text with flexible whitespace
        // \s+ matches one or more whitespace characters (spaces, newlines, tabs)
        const flexiblePattern = escapedText.replace(/\s+/g, '\\s+');
        const regex = new RegExp(`(${flexiblePattern})`, 'gi');

        // Apply highlight
        result = result.replace(regex, `<mark class="highlight-${highlight.color}" data-highlight-id="${highlight.id}">$1</mark>`);
    });

    return result;
};
