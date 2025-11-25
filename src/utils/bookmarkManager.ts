export interface Bookmark {
    id: string;
    partNumber: number;
    chapterIndex: number;
    pageNumber: number;
    createdAt: string;
    note?: string;
}

export const saveBookmark = (
    partNumber: number,
    chapterIndex: number,
    pageNumber: number,
    note?: string
): void => {
    const bookmarks = getBookmarks();

    // Check if bookmark already exists for this page
    const existing = bookmarks.find(
        b => b.partNumber === partNumber &&
            b.chapterIndex === chapterIndex &&
            b.pageNumber === pageNumber
    );

    if (existing) {
        // Update existing bookmark
        existing.note = note;
        existing.createdAt = new Date().toISOString();
    } else {
        // Create new bookmark
        const newBookmark: Bookmark = {
            id: Date.now().toString(),
            partNumber,
            chapterIndex,
            pageNumber,
            createdAt: new Date().toISOString(),
            note,
        };
        bookmarks.push(newBookmark);
    }

    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
};

export const getBookmarks = (partNumber?: number): Bookmark[] => {
    const stored = localStorage.getItem('bookmarks');
    const bookmarks: Bookmark[] = stored ? JSON.parse(stored) : [];

    if (partNumber !== undefined) {
        return bookmarks.filter(b => b.partNumber === partNumber);
    }

    return bookmarks;
};

export const deleteBookmark = (id: string): void => {
    const bookmarks = getBookmarks();
    const filtered = bookmarks.filter(b => b.id !== id);
    localStorage.setItem('bookmarks', JSON.stringify(filtered));
};

export const hasBookmark = (
    partNumber: number,
    chapterIndex: number,
    pageNumber: number
): boolean => {
    const bookmarks = getBookmarks(partNumber);
    return bookmarks.some(
        b => b.chapterIndex === chapterIndex && b.pageNumber === pageNumber
    );
};
