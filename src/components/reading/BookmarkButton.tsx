import React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { saveBookmark, deleteBookmark, hasBookmark, getBookmarks } from '../../utils/bookmarkManager';
import './BookmarkButton.css';

interface BookmarkButtonProps {
    partNumber: number;
    chapterIndex: number;
    pageNumber: number;
}

export default function BookmarkButton({
    partNumber,
    chapterIndex,
    pageNumber
}: BookmarkButtonProps) {
    const [isBookmarked, setIsBookmarked] = React.useState(false);

    React.useEffect(() => {
        setIsBookmarked(hasBookmark(partNumber, chapterIndex, pageNumber));
    }, [partNumber, chapterIndex, pageNumber]);

    const handleToggle = () => {
        if (isBookmarked) {
            const bookmarks = getBookmarks(partNumber);
            const bookmark = bookmarks.find(
                b => b.chapterIndex === chapterIndex && b.pageNumber === pageNumber
            );
            if (bookmark) {
                deleteBookmark(bookmark.id);
                setIsBookmarked(false);
                console.log('🔖 Marcador eliminado');
            }
        } else {
            saveBookmark(partNumber, chapterIndex, pageNumber);
            setIsBookmarked(true);
            console.log('🔖 Marcador guardado:', { partNumber, chapterIndex, pageNumber });
        }
    };

    return (
        <button
            className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
            onClick={handleToggle}
            title={isBookmarked ? 'Quitar marcador' : 'Agregar marcador'}
        >
            {isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
        </button>
    );
}
