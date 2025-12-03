import * as userDataService from '../services/userDataService';

export interface Quote {
    id: string;
    text: string;
    partNumber: number;
    partTitle: string;
    chapterTitle: string;
    pageNumber: number;
    createdAt: string;
    tags?: string[];
}

export const saveQuote = async (
    text: string,
    partNumber: number,
    partTitle: string,
    chapterTitle: string,
    pageNumber: number
): Promise<void> => {
    const newQuote: Quote = {
        id: Date.now().toString(),
        text,
        partNumber,
        partTitle,
        chapterTitle,
        pageNumber,
        createdAt: new Date().toISOString(),
    };

    await userDataService.saveQuote(newQuote);
};

export const getQuotes = async (partNumber?: number): Promise<Quote[]> => {
    return await userDataService.getQuotes(partNumber);
};

export const deleteQuote = async (id: string): Promise<void> => {
    await userDataService.deleteQuote(id);
};

export const shareQuote = (quote: Quote, platform: 'twitter' | 'facebook' | 'whatsapp' | 'copy'): void => {
    const text = `"${quote.text}"\n\n— ${quote.partTitle}, ${quote.chapterTitle}`;

    switch (platform) {
        case 'twitter':
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
            break;
        case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`, '_blank');
            break;
        case 'whatsapp':
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            break;
        case 'copy':
            navigator.clipboard.writeText(text);
            break;
    }
};
