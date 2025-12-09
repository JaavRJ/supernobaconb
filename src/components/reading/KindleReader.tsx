import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Menu, Settings, Star } from 'lucide-react';
import TextSelectionMenu from './TextSelectionMenu';
import BookmarkButton from './BookmarkButton';
import SavedQuotes from './SavedQuotes';
import AuthorNoteTooltip from './AuthorNoteTooltip';
import AuthorNoteModal from './AuthorNoteModal';
import ReactionBar from './ReactionBar';
import NewsletterModal from '../newsletter/NewsletterModal';
import KindleConfigModal from './KindleConfigModal';
import { getHighlights, applyHighlightsToHTML } from '../../utils/highlightManager';
import { getAuthorNotesForChapter, applyAuthorNotesToHTML, type AuthorNote } from '../../services/authorNotesLoaderService';
import { getUserPreferences, updatePreference, type UserPreferences } from '../../services/userDataService';
import { ALL_PARTS } from '../../data/sampleChapters';
import './KindleReader.css';
import './KindleReaderVerticalMode.css';
import './ChapterNavControls.css';
import './AuthorNoteTrigger.css';

interface Chapter {
    number: string;
    title: string;
    content: string;
}

interface KindleReaderProps {
    chapters: Chapter[];
    currentChapterIndex: number;
    onClose: () => void;
    partNumber: number;
    partTitle: string;
}

export default function KindleReader({
    chapters,
    currentChapterIndex: initialChapterIndex,
    onClose,
    partNumber,
    partTitle
}: KindleReaderProps) {
    const [currentChapterIndex, setCurrentChapterIndex] = useState(initialChapterIndex);
    const [currentPage, setCurrentPage] = useState(0);
    const [pages, setPages] = useState<string[]>([]);
    const [selectedText, setSelectedText] = useState('');
    const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
    const [fontSize, setFontSize] = useState(16);
    const [showSettings, setShowSettings] = useState(false);
    const [showQuotes, setShowQuotes] = useState(false);
    const [activeNote, setActiveNote] = useState<AuthorNote | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [showNewsletter, setShowNewsletter] = useState(false);
    const [highlights, setHighlights] = useState<any[]>([]);
    const [showConfig, setShowConfig] = useState(false);
    const [readingMode, setReadingMode] = useState<'horizontal' | 'vertical'>('horizontal');
    const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
    const [authorNotes, setAuthorNotes] = useState<AuthorNote[]>([]);

    const contentRef = useRef<HTMLDivElement>(null);
    const currentChapter = chapters[currentChapterIndex];

    // Load user preferences on mount
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const preferences = await getUserPreferences();
                setReadingMode(preferences.readingMode);
                setFontSize(preferences.fontSize);

                // Show config modal if user hasn't configured yet
                if (!preferences.hasConfigured) {
                    setShowConfig(true);
                }
            } catch (error) {
                console.error('Error loading preferences:', error);
            } finally {
                setIsLoadingPreferences(false);
            }
        };
        loadPreferences();
    }, []);

    // Load highlights when chapter changes
    useEffect(() => {
        const loadHighlights = async () => {
            const loadedHighlights = await getHighlights(partNumber, currentChapterIndex);
            setHighlights(loadedHighlights);
        };
        loadHighlights();
    }, [partNumber, currentChapterIndex]);

    // Load author notes when chapter changes
    useEffect(() => {
        const loadNotes = async () => {
            const notes = await getAuthorNotesForChapter(partNumber, currentChapterIndex);
            setAuthorNotes(notes);
        };
        loadNotes();
    }, [partNumber, currentChapterIndex]);

    // Re-paginar al cambiar el tamaño de la ventana
    useEffect(() => {
        const handleResize = () => {
            if (contentRef.current && currentChapter) {
                const contentWithNotes = applyAuthorNotesToHTML(currentChapter.content, authorNotes);
                const paginatedPages = paginateContent(
                    contentWithNotes,
                    contentRef.current,
                    fontSize,
                    highlights,
                    partNumber,
                    currentChapterIndex
                );
                setPages(paginatedPages);
                // Ajustar página actual si se sale del rango
                setCurrentPage(prev => Math.min(prev, paginatedPages.length - 1));
            }
        };

        // Debounce para evitar demasiados cálculos
        let timeoutId: NodeJS.Timeout;
        const debouncedResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleResize, 100);
        };

        window.addEventListener('resize', debouncedResize);
        return () => {
            window.removeEventListener('resize', debouncedResize);
            clearTimeout(timeoutId);
        };
    }, [currentChapter, fontSize, highlights, authorNotes, partNumber, currentChapterIndex]);

    // Paginar contenido cuando cambia el capítulo o el tamaño de fuente
    useEffect(() => {
        if (contentRef.current && currentChapter) {
            const contentWithNotes = applyAuthorNotesToHTML(currentChapter.content, authorNotes);
            const paginatedPages = paginateContent(
                contentWithNotes,
                contentRef.current,
                fontSize,
                highlights,
                partNumber,
                currentChapterIndex
            );
            setPages(paginatedPages);
            setCurrentPage(0);
        }
    }, [currentChapter, fontSize, highlights, authorNotes, partNumber, currentChapterIndex]);

    // Manejar selección de texto
    useEffect(() => {
        const handleSelection = (e: MouseEvent | TouchEvent) => {
            // Don't clear selection if clicking on the menu
            const target = e.target as HTMLElement;
            if (target.closest('.text-selection-menu')) {
                return;
            }

            // Small delay to allow menu clicks to register
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

        // Prevent native context menu
        const handleContextMenu = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('.kindle-page')) {
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

    // Navegación con teclado
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                e.preventDefault();
                prevPage();
            }
            if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
                e.preventDefault();
                nextPage();
            }
            if (e.key === 'Escape') {
                // Close active note first, then close reader
                if (activeNote) {
                    setActiveNote(null);
                } else {
                    onClose();
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentPage, pages.length, activeNote]);

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
                    // Get note from loaded notes
                    const note = authorNotes.find(n => n.id === noteId);

                    if (note) {
                        setActiveNote(note);

                        // Set tooltip position if it's a tooltip type
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
    }, [partNumber, currentChapterIndex, authorNotes]);

    const nextPage = useCallback(() => {
        // Check if we're on the second-to-last page of the last chapter
        const isLastChapter = currentChapterIndex === chapters.length - 1;
        const isPenultimatePage = currentPage === pages.length - 2;

        if (isLastChapter && isPenultimatePage) {
            // Show newsletter modal before advancing to last page
            setShowNewsletter(true);
            setCurrentPage(prev => prev + 1);
            setSelectedText('');
        } else if (currentPage < pages.length - 1) {
            setCurrentPage(prev => prev + 1);
            setSelectedText('');
        }
    }, [currentPage, pages.length, currentChapterIndex, chapters.length]);

    const prevPage = useCallback(() => {
        if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
            setSelectedText('');
        }
    }, [currentPage]);

    const nextChapter = () => {
        if (currentChapterIndex < chapters.length - 1) {
            setCurrentChapterIndex(currentChapterIndex + 1);
            setCurrentPage(0);
            setSelectedText('');
        }
    };

    const prevChapter = () => {
        if (currentChapterIndex > 0) {
            setCurrentChapterIndex(currentChapterIndex - 1);
            setCurrentPage(0);
            setSelectedText('');
        }
    };

    const totalPages = pages.length;
    const progress = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0;
    const remainingPages = totalPages - currentPage - 1;
    const estimatedMinutes = Math.ceil(remainingPages * 2);

    // Calculate cumulative chapter numbers
    // Get the starting chapter number for this part (sum of all previous parts' chapters)
    const getChapterOffset = (): number => {
        let offset = 0;
        for (let i = 1; i < partNumber; i++) {
            const part = ALL_PARTS.find((p: any) => p.partNumber === i);
            if (part) {
                offset += part.chapters.length;
            }
        }
        return offset;
    };

    // Get total chapters up to and including this part
    const getTotalChaptersUpToPart = (): number => {
        let total = 0;
        for (let i = 1; i <= partNumber; i++) {
            const part = ALL_PARTS.find((p: any) => p.partNumber === i);
            if (part) {
                total += part.chapters.length;
            }
        }
        return total;
    };

    const chapterOffset = getChapterOffset();
    const currentGlobalChapter = chapterOffset + currentChapterIndex + 1;
    const totalChaptersUpToPart = getTotalChaptersUpToPart();

    // Handle configuration completion
    const handleConfigComplete = (preferences: UserPreferences) => {
        setReadingMode(preferences.readingMode);
        setFontSize(preferences.fontSize);
        setShowConfig(false);
    };

    // Handle font size change
    const handleFontSizeChange = async (newSize: number) => {
        setFontSize(newSize);
        await updatePreference('fontSize', newSize);
    };

    // Handle reading mode toggle
    const handleReadingModeToggle = async () => {
        const newMode = readingMode === 'horizontal' ? 'vertical' : 'horizontal';
        setReadingMode(newMode);
        await updatePreference('readingMode', newMode);
    };

    // Show loading state while preferences load
    if (isLoadingPreferences) {
        return (
            <div className="kindle-reader">
                <div className="kindle-loading">Cargando preferencias...</div>
            </div>
        );
    }

    // Show config modal if needed
    if (showConfig) {
        return <KindleConfigModal onComplete={handleConfigComplete} />;
    }

    // Render horizontal mode (existing)
    return (
        <div className="kindle-reader">
            {/* Header */}
            <div className="kindle-header">
                {readingMode === 'horizontal' && (
                    <button
                        onClick={prevPage}
                        disabled={currentPage === 0}
                        className="nav-btn"
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}

                <div className="kindle-title">
                    {partTitle}
                </div>

                <button
                    onClick={() => setShowQuotes(true)}
                    className="icon-btn"
                    title="Ver citas guardadas"
                >
                    <Star size={20} />
                </button>

                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="icon-btn"
                    title="Configuración"
                >
                    <Settings size={20} />
                </button>

                <BookmarkButton
                    partNumber={partNumber}
                    chapterIndex={currentChapterIndex}
                    pageNumber={currentPage}
                />

                <button
                    onClick={onClose}
                    className="icon-btn"
                    title="Cerrar (Esc)"
                >
                    <X size={24} />
                </button>

                {readingMode === 'horizontal' && (
                    <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages - 1}
                        className="nav-btn"
                    >
                        <ChevronRight size={24} />
                    </button>
                )}
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="kindle-settings">
                    <div className="setting-group">
                        <label>Modo de lectura:</label>
                        <button
                            onClick={handleReadingModeToggle}
                            className="mode-toggle-btn"
                        >
                            {readingMode === 'horizontal' ? '📖 Horizontal' : '📜 Vertical'}
                        </button>
                    </div>

                    <div className="setting-group">
                        <label>Tamaño de fuente:</label>
                        <div className="font-size-controls">
                            <button onClick={() => handleFontSizeChange(Math.max(14, fontSize - 2))}>A-</button>
                            <span>{fontSize}px</span>
                            <button onClick={() => handleFontSizeChange(Math.min(24, fontSize + 2))}>A+</button>
                        </div>
                    </div>

                </div>
            )}

            {/* Content */}
            <div className={`kindle-content ${readingMode === 'vertical' ? 'kindle-content-vertical' : ''}`} ref={contentRef}>
                {readingMode === 'horizontal' ? (
                    // Horizontal mode: Paginated content
                    pages.length > 0 ? (
                        <div
                            className="kindle-page"
                            style={{ fontSize: `${fontSize}px` }}
                            translate="no"
                            dangerouslySetInnerHTML={{ __html: pages[currentPage] || '' }}
                        />
                    ) : (
                        <div className="kindle-loading">Cargando...</div>
                    )
                ) : (
                    // Vertical mode: Continuous scrolling content
                    <div className="kindle-page-vertical" style={{ fontSize: `${fontSize}px` }}>
                        {(() => {
                            const contentWithNotes = applyAuthorNotesToHTML(currentChapter.content, authorNotes);
                            const contentWithHighlights = applyHighlightsToHTML(contentWithNotes, highlights);

                            return (
                                <div dangerouslySetInnerHTML={{
                                    __html: contentWithHighlights
                                        .split('\n\n')
                                        .filter(p => p.trim())
                                        .map(p => `<p>${p.trim()}</p>`)
                                        .join('')
                                }} />
                            );
                        })()}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="kindle-footer">
                {/* Only show page navigation in horizontal mode */}
                {readingMode === 'horizontal' && (
                    <div className="footer-page-nav">
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 0}
                            className="page-nav-btn"
                        >
                            <ChevronLeft size={18} />
                            Página anterior
                        </button>

                        <button
                            onClick={nextPage}
                            disabled={currentPage === totalPages - 1}
                            className="page-nav-btn"
                        >
                            Página siguiente
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {/* Reaction Bar */}
                <ReactionBar
                    partNumber={partNumber}
                    chapterIndex={currentChapterIndex}
                />

                <div className="kindle-progress-bar">
                    <div
                        className="kindle-progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="kindle-info">
                    <div className="page-info">
                        <span>Página {currentPage + 1} de {totalPages}</span>
                        <span>{Math.round(progress)}% · {estimatedMinutes} min restantes</span>
                    </div>
                </div>
            </div>

            {/* Text Selection Menu */}
            {selectedText && (
                <TextSelectionMenu
                    text={selectedText}
                    position={selectionPosition}
                    partNumber={partNumber}
                    partTitle={partTitle}
                    chapterIndex={currentChapterIndex}
                    chapterTitle={currentChapter.title}
                    pageNumber={currentPage}
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

            {/* Newsletter Modal */}
            {showNewsletter && (
                <NewsletterModal
                    partNumber={partNumber}
                    partTitle={partTitle}
                    onClose={() => setShowNewsletter(false)}
                />
            )}
        </div>
    );
}

// Función para paginar contenido
function paginateContent(
    content: string,
    container: HTMLElement,
    fontSize: number,
    highlights: any[] = [],
    partNumber: number,
    chapterIndex: number
): string[] {
    const pages: string[] = [];
    const tempDiv = document.createElement('div');

    // Get container computed styles
    const containerStyle = window.getComputedStyle(container);

    // Calculate available dimensions using clientWidth/Height for better accuracy
    // clientWidth includes padding but excludes borders/scrollbars
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const paddingLeft = parseFloat(containerStyle.paddingLeft);
    const paddingRight = parseFloat(containerStyle.paddingRight);
    const paddingTop = parseFloat(containerStyle.paddingTop);
    const paddingBottom = parseFloat(containerStyle.paddingBottom);

    // Available space for content
    const availableWidth = containerWidth - paddingLeft - paddingRight;
    const availableHeight = containerHeight - paddingTop - paddingBottom;

    // Apply styles to match .kindle-page exactly
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.boxSizing = 'border-box';

    // Width logic: match .kindle-page constraints (max-width: 700px)
    // It takes the full available width up to 700px
    tempDiv.style.width = `${Math.min(availableWidth, 700)}px`;

    // Height logic: use available height minus safety margin
    // Increased safety margin for mobile responsive stability
    tempDiv.style.height = `${availableHeight - 40}px`;

    // Typography matching .kindle-page
    tempDiv.style.fontSize = `${fontSize}px`;
    tempDiv.style.lineHeight = '1.8';
    tempDiv.style.fontFamily = containerStyle.fontFamily;
    tempDiv.style.textAlign = 'justify';
    tempDiv.style.color = '#2a2a2a';

    // Reset padding on tempDiv
    tempDiv.style.padding = '0';

    document.body.appendChild(tempDiv);

    // Apply author notes to content before pagination
    const contentWithNotes = content;

    // IMPROVED: Detect and normalize content format
    let paragraphs: string[];

    // Check if content has HTML paragraph tags
    if (contentWithNotes.includes('<p')) {

        // Parse HTML and extract paragraphs
        const tempParser = document.createElement('div');
        tempParser.innerHTML = contentWithNotes;
        const pElements = Array.from(tempParser.querySelectorAll('p'));

        // Filter out empty paragraphs or paragraphs with only &nbsp;
        paragraphs = pElements
            .map(p => p.outerHTML)
            .filter(html => {
                // Remove HTML tags and &nbsp; to check if there's actual content
                const text = html
                    .replace(/<[^>]*>/g, '')
                    .replace(/&nbsp;/g, '')
                    .replace(/\s/g, '')
                    .trim();
                return text.length > 0;
            });
    } else {
        // Original behavior: split by double line breaks
        paragraphs = contentWithNotes.split('\n\n').filter(p => p.trim());
    }

    let currentPageContent = '';

    for (const paragraph of paragraphs) {
        // If paragraph already has <p> tags, use it as is; otherwise wrap it
        const paragraphHTML = paragraph.trim().startsWith('<p')
            ? paragraph
            : `<p>${paragraph.trim()}</p>`;

        const testContent = currentPageContent + paragraphHTML;
        tempDiv.innerHTML = testContent;

        if (tempDiv.scrollHeight > tempDiv.clientHeight && currentPageContent) {
            // Current page is full
            const highlightedContent = applyHighlightsToHTML(currentPageContent, highlights);
            pages.push(highlightedContent);
            currentPageContent = paragraphHTML;
        } else {
            currentPageContent = testContent;
        }
    }

    // Add last page
    if (currentPageContent) {
        const highlightedContent = applyHighlightsToHTML(currentPageContent, highlights);
        pages.push(highlightedContent);
    }

    document.body.removeChild(tempDiv);


    return pages.length > 0 ? pages : ['<p>Sin contenido</p>'];
}
