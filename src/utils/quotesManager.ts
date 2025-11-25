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

export const saveQuote = (
    text: string,
    partNumber: number,
    partTitle: string,
    chapterTitle: string,
    pageNumber: number
): void => {
    const quotes = getQuotes();
    const newQuote: Quote = {
        id: Date.now().toString(),
        text,
        partNumber,
        partTitle,
        chapterTitle,
        pageNumber,
        createdAt: new Date().toISOString(),
    };

    quotes.push(newQuote);
    localStorage.setItem('quotes', JSON.stringify(quotes));
};

export const getQuotes = (partNumber?: number): Quote[] => {
    const stored = localStorage.getItem('quotes');
    const quotes: Quote[] = stored ? JSON.parse(stored) : [];

    if (partNumber !== undefined) {
        return quotes.filter(q => q.partNumber === partNumber);
    }

    return quotes;
};

export const deleteQuote = (id: string): void => {
    const quotes = getQuotes();
    const filtered = quotes.filter(q => q.id !== id);
    localStorage.setItem('quotes', JSON.stringify(filtered));
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
