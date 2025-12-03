import * as userDataService from '../services/userDataService';

export interface Bookmark {
    id: string;
    partNumber: number;
    chapterIndex: number;
    pageNumber: number;
    createdAt: string;
    note?: string;
}

export const saveBookmark = async (
    partNumber: number,
    chapterIndex: number,
    pageNumber: number,
    note?: string
): Promise<void> => {
    const bookmarks = await getBookmarks();

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
        await userDataService.saveBookmark(existing);
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
        await userDataService.saveBookmark(newBookmark);
    }
};

export const getBookmarks = async (partNumber?: number): Promise<Bookmark[]> => {
    return await userDataService.getBookmarks(partNumber);
};

export const deleteBookmark = async (id: string): Promise<void> => {
    await userDataService.deleteBookmark(id);
};

export const hasBookmark = async (
    partNumber: number,
    chapterIndex: number,
    pageNumber: number
): Promise<boolean> => {
    const bookmarks = await getBookmarks(partNumber);
    return bookmarks.some(
        b => b.chapterIndex === chapterIndex && b.pageNumber === pageNumber
    );
};
