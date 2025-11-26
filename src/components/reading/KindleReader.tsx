import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Menu, Settings, Star } from 'lucide-react';
import TextSelectionMenu from './TextSelectionMenu';
import BookmarkButton from './BookmarkButton';
import SavedQuotes from './SavedQuotes';
import { getHighlights, applyHighlightsToHTML } from '../../utils/highlightManager';
import { ALL_PARTS } from '../../data/sampleChapters';
import './KindleReader.css';
import './ChapterNavControls.css';

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
    const [fontSize, setFontSize] = useState(14);
    const [showSettings, setShowSettings] = useState(false);
    const [showQuotes, setShowQuotes] = useState(false);

    const contentRef = useRef<HTMLDivElement>(null);
    const currentChapter = chapters[currentChapterIndex];

    // Re-paginar al cambiar el tamaño de la ventana
    useEffect(() => {
        const handleResize = () => {
            if (contentRef.current && currentChapter) {
                const highlights = getHighlights(partNumber, currentChapterIndex);
                const paginatedPages = paginateContent(
                    currentChapter.content,
                    contentRef.current,
                    fontSize,
                    highlights
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
    }, [currentChapter, fontSize, partNumber, currentChapterIndex]);

    // Paginar contenido cuando cambia el capítulo o el tamaño de fuente
    useEffect(() => {
        if (contentRef.current && currentChapter) {
            // Get highlights for current chapter
            const highlights = getHighlights(partNumber, currentChapterIndex);

            const paginatedPages = paginateContent(
                currentChapter.content,
                contentRef.current,
                fontSize,
                highlights
            );
            setPages(paginatedPages);
            setCurrentPage(0);
        }
    }, [currentChapter, fontSize, partNumber, currentChapterIndex]);

    // Manejar selección de texto
    useEffect(() => {
        const handleSelection = (e: MouseEvent | TouchEvent) => {
            // Don't clear selection if clicking on the menu
            const target = e.target as HTMLElement;
            if (target.closest('.text-selection-menu')) {
                console.log('🛑 Click en menú, no limpiar selección');
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
                        y: rect.top
                    });
                    console.log('✅ Texto seleccionado:', text);
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
                console.log('🚫 Menú contextual nativo deshabilitado');
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
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentPage, pages.length]);

    const nextPage = useCallback(() => {
        if (currentPage < pages.length - 1) {
            setCurrentPage(prev => prev + 1);
            setSelectedText('');
        }
    }, [currentPage, pages.length]);

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

    return (
        <div className="kindle-reader">
            {/* Header */}
            <div className="kindle-header">
                <button
                    onClick={prevPage}
                    disabled={currentPage === 0}
                    className="nav-btn"
                >
                    <ChevronLeft size={24} />
                </button>

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

                <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages - 1}
                    className="nav-btn"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="kindle-settings">
                    <div className="setting-group">
                        <label>Tamaño de fuente:</label>
                        <div className="font-size-controls">
                            <button onClick={() => setFontSize(Math.max(14, fontSize - 2))}>A-</button>
                            <span>{fontSize}px</span>
                            <button onClick={() => setFontSize(Math.min(24, fontSize + 2))}>A+</button>
                        </div>
                    </div>

                </div>
            )}

            {/* Content */}
            <div className="kindle-content" ref={contentRef}>
                {pages.length > 0 ? (
                    <div
                        className="kindle-page"
                        style={{ fontSize: `${fontSize}px` }}
                        dangerouslySetInnerHTML={{ __html: pages[currentPage] || '' }}
                    />
                ) : (
                    <div className="kindle-loading">Cargando...</div>
                )}
            </div>

            {/* Footer */}
            <div className="kindle-footer">
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
        </div>
    );
}

// Función para paginar contenido
function paginateContent(
    content: string,
    container: HTMLElement,
    fontSize: number,
    highlights: any[] = []
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

    const paragraphs = content.split('\n\n').filter(p => p.trim());
    let currentPageContent = '';

    for (const paragraph of paragraphs) {
        const testContent = currentPageContent + `<p>${paragraph.trim()}</p>`;
        tempDiv.innerHTML = testContent;

        if (tempDiv.scrollHeight > tempDiv.clientHeight && currentPageContent) {
            // Current page is full
            const highlightedContent = applyHighlightsToHTML(currentPageContent, highlights);
            pages.push(highlightedContent);
            currentPageContent = `<p>${paragraph.trim()}</p>`;
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
