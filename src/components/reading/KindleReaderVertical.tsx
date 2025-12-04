import React, { useState, useEffect, useRef } from 'react';
import { X, Settings, Star, ChevronUp } from 'lucide-react';
import TextSelectionMenu from './TextSelectionMenu';
import BookmarkButton from './BookmarkButton';
import SavedQuotes from './SavedQuotes';
import AuthorNoteTooltip from './AuthorNoteTooltip';
import AuthorNoteModal from './AuthorNoteModal';
import ReactionBar from './ReactionBar';
import { getHighlights, applyHighlightsToHTML } from '../../utils/highlightManager';
import { getAuthorNotes, applyAuthorNotesToHTML, type AuthorNote } from '../../data/authorNotes';
import './KindleReaderVertical.css';

interface Chapter {
    number: string;
    title: string;
    content: string;
}

interface KindleReaderVerticalProps {
    chapters: Chapter[];
    currentChapterIndex: number;
    onClose: () => void;
    partNumber: number;
    partTitle: string;
    fontSize: number;
    onFontSizeChange: (size: number) => void;
}

export default function KindleReaderVertical({
    chapters,
    currentChapterIndex: initialChapterIndex,
    onClose,
    partNumber,
    partTitle,
    fontSize,
    onFontSizeChange
}: KindleReaderVerticalProps) {
    const [currentChapterIndex, setCurrentChapterIndex] = useState(initialChapterIndex);
    const [selectedText, setSelectedText] = useState('');
    const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
    const [showSettings, setShowSettings] = useState(false);
    const [showQuotes, setShowQuotes] = useState(false);
    const [activeNote, setActiveNote] = useState<AuthorNote | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [highlights, setHighlights] = useState<any[]>([]);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const contentRef = useRef<HTMLDivElement>(null);
    const currentChapter = chapters[currentChapterIndex];

    // Load highlights when chapter changes
    useEffect(() => {
        const loadHighlights = async () => {
            const loadedHighlights = await getHighlights(partNumber, currentChapterIndex);
            setHighlights(loadedHighlights);
        };
        loadHighlights();
    }, [partNumber, currentChapterIndex]);

    // Handle scroll progress
    useEffect(() => {
        const handleScroll = () => {
            if (contentRef.current) {
                const scrollTop = contentRef.current.scrollTop;
                const scrollHeight = contentRef.current.scrollHeight - contentRef.current.clientHeight;
                const progress = (scrollTop / scrollHeight) * 100;
                setScrollProgress(Math.min(100, Math.max(0, progress)));
                setShowScrollTop(scrollTop > 300);
            }
        };

        const container = contentRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, []);

    // Handle text selection
    useEffect(() => {
        const handleSelection = (e: MouseEvent | TouchEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('.text-selection-menu')) {
                return;
            }

            setTimeout(() => {
                const selection = window.getSelection();
                if (selection && selection.toString().trim().length > 0) {
                    const text = selection.toString().trim();
                    setSelectedText(text);
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    setSelectionPosition({
                        x: rect.left + rect.width / 2 - 100,
                        y: rect.bottom
                    });
                } else {
                    setSelectedText('');
                }
            }, 100);
        };

        const handleContextMenu = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('.vertical-content')) {
                e.preventDefault();
            }
        };

        document.addEventListener('mouseup', handleSelection as EventListener);
        document.addEventListener('touchend', handleSelection as EventListener);
        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            document.removeEventListener('mouseup', handleSelection as EventListener);
            document.removeEventListener('touchend', handleSelection as EventListener);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (activeNote) {
                    setActiveNote(null);
                } else {
                    onClose();
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [activeNote, onClose]);

    // Handle author note clicks
    useEffect(() => {
        const handleAuthorNoteClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const trigger = target.closest('.author-note-trigger');

            if (trigger) {
                e.preventDefault();
                e.stopPropagation();

                const noteId = trigger.getAttribute('data-note-id');
                const noteType = trigger.getAttribute('data-note-type') as 'tooltip' | 'modal';

                if (noteId) {
                    const notes = getAuthorNotes(partNumber, currentChapterIndex);
                    const note = notes.find(n => n.id === noteId);

                    if (note) {
                        setActiveNote(note);

                        if (noteType === 'tooltip') {
                            const rect = trigger.getBoundingClientRect();
                            setTooltipPosition({
                                x: rect.left + rect.width / 2,
                                y: rect.bottom + 10
                            });
                        }
                    }
                }
            }
        };

        document.addEventListener('click', handleAuthorNoteClick);
        return () => document.removeEventListener('click', handleAuthorNoteClick);
    }, [partNumber, currentChapterIndex]);

    const scrollToTop = () => {
        if (contentRef.current) {
            contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getFormattedContent = () => {
        const notes = getAuthorNotes(partNumber, currentChapterIndex);
        const contentWithNotes = applyAuthorNotesToHTML(currentChapter.content, notes);
        const contentWithHighlights = applyHighlightsToHTML(contentWithNotes, highlights);

        return contentWithHighlights
            .split('\n\n')
            .filter(p => p.trim())
            .map(p => `<p>${p.trim()}</p>`)
            .join('');
    };

    const estimatedReadingTime = Math.ceil(currentChapter.content.split(' ').length / 200);

    return (
        <div className="kindle-reader-vertical">
            {/* Header */}
            <div className="vertical-header">
                <div className="vertical-title">{partTitle}</div>

                <div className="vertical-controls">
                    <button
                        onClick={() => setShowQuotes(true)}
                        className="vertical-icon-btn"
                        title="Ver citas guardadas"
                    >
                        <Star size={20} />
                    </button>

                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="vertical-icon-btn"
                        title="Configuración"
                    >
                        <Settings size={20} />
                    </button>

                    <BookmarkButton
                        partNumber={partNumber}
                        chapterIndex={currentChapterIndex}
                        pageNumber={0}
                    />

                    <button
                        onClick={onClose}
                        className="vertical-icon-btn"
                        title="Cerrar (Esc)"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="vertical-settings">
                    <div className="setting-group">
                        <label>Tamaño de fuente:</label>
                        <div className="font-size-controls">
                            <button onClick={() => onFontSizeChange(Math.max(14, fontSize - 2))}>A-</button>
                            <span>{fontSize}px</span>
                            <button onClick={() => onFontSizeChange(Math.min(24, fontSize + 2))}>A+</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Scroll Progress Bar */}
            <div className="vertical-progress-bar">
                <div
                    className="vertical-progress-fill"
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>

            {/* Content */}
            <div className="vertical-content-wrapper" ref={contentRef}>
                <div className="vertical-content" style={{ fontSize: `${fontSize}px` }} translate="no">
                    <div className="vertical-chapter-header">
                        <h1 className="vertical-chapter-title">{currentChapter.title}</h1>
                        <div className="vertical-chapter-meta">
                            Capítulo {currentChapter.number} · {estimatedReadingTime} min de lectura
                        </div>
                    </div>

                    <div
                        className="vertical-chapter-content"
                        dangerouslySetInnerHTML={{ __html: getFormattedContent() }}
                    />

                    {/* Chapter Navigation */}
                    <div className="vertical-chapter-nav">
                        {currentChapterIndex > 0 && (
                            <button
                                onClick={() => {
                                    setCurrentChapterIndex(currentChapterIndex - 1);
                                    scrollToTop();
                                }}
                                className="vertical-chapter-nav-btn"
                            >
                                ← Capítulo anterior
                            </button>
                        )}

                        {currentChapterIndex < chapters.length - 1 && (
                            <button
                                onClick={() => {
                                    setCurrentChapterIndex(currentChapterIndex + 1);
                                    scrollToTop();
                                }}
                                className="vertical-chapter-nav-btn"
                            >
                                Capítulo siguiente →
                            </button>
                        )}
                    </div>

                    {/* Reaction Bar */}
                    <div className="vertical-reaction-container">
                        <ReactionBar
                            partNumber={partNumber}
                            chapterIndex={currentChapterIndex}
                        />
                    </div>
                </div>
            </div>

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="vertical-scroll-top"
                    title="Volver arriba"
                >
                    <ChevronUp size={24} />
                </button>
            )}

            {/* Text Selection Menu */}
            {selectedText && (
                <TextSelectionMenu
                    text={selectedText}
                    position={selectionPosition}
                    partNumber={partNumber}
                    partTitle={partTitle}
                    chapterIndex={currentChapterIndex}
                    chapterTitle={currentChapter.title}
                    pageNumber={0}
                    onClose={() => setSelectedText('')}
                />
            )}

            {/* Saved Quotes Panel */}
            {showQuotes && (
                <SavedQuotes
                    partNumber={partNumber}
                    onClose={() => setShowQuotes(false)}
                />
            )}

            {/* Author Note Tooltip */}
            {activeNote && activeNote.type === 'tooltip' && (
                <AuthorNoteTooltip
                    note={activeNote}
                    position={tooltipPosition}
                    onClose={() => setActiveNote(null)}
                />
            )}

            {/* Author Note Modal */}
            {activeNote && activeNote.type === 'modal' && (
                <AuthorNoteModal
                    note={activeNote}
                    onClose={() => setActiveNote(null)}
                />
            )}
        </div>
    );
}
