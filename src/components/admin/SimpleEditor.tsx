import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, List, Link as LinkIcon } from 'lucide-react';
import './SimpleEditor.css';

interface SimpleEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: number;
}

export default function SimpleEditor({ value, onChange, placeholder, minHeight = 200 }: SimpleEditorProps) {
    const [showPreview, setShowPreview] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);
    const isUserTyping = useRef(false);

    useEffect(() => {
        if (editorRef.current && !showPreview && !isUserTyping.current) {
            // Solo actualizar si el contenido es realmente diferente
            const currentContent = editorRef.current.innerHTML;
            const newContent = value || '';

            if (currentContent !== newContent) {
                editorRef.current.innerHTML = newContent;
            }
        }
    }, [value, showPreview]);

    const normalizeContent = (html: string): string => {
        // Crear un elemento temporal para procesar el HTML
        const temp = document.createElement('div');
        temp.innerHTML = html;

        // Convertir divs y spans de nivel superior a párrafos
        const children = Array.from(temp.childNodes);
        let normalized = '';

        children.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent?.trim();
                if (text) {
                    normalized += `<p>${text}</p>`;
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                const tagName = element.tagName.toLowerCase();

                // Si es un div o span, convertir a párrafo
                if (tagName === 'div' || tagName === 'span') {
                    const text = element.textContent?.trim();
                    if (text) {
                        normalized += `<p>${text}</p>`;
                    }
                } else if (tagName === 'br') {
                    // Ignorar br sueltos
                    return;
                } else {
                    // Mantener otros tags como están (ul, li, a, etc.)
                    normalized += element.outerHTML;
                }
            }
        });

        return normalized;
    };

    const handleInput = () => {
        if (editorRef.current) {
            isUserTyping.current = true;
            const rawHTML = editorRef.current.innerHTML;
            const normalizedHTML = normalizeContent(rawHTML);
            onChange(normalizedHTML);
            setTimeout(() => {
                isUserTyping.current = false;
            }, 100);
        }
    };

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleInput();
    };

    const insertTag = (tag: string) => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const selectedText = range.toString();

        if (tag === 'ul') {
            execCommand('insertUnorderedList');
        } else if (tag === 'a') {
            const url = prompt('URL del enlace:');
            if (url) {
                execCommand('createLink', url);
            }
        }
    };

    return (
        <div className="simple-editor">
            <div className="editor-toolbar">
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => execCommand('bold')}
                    title="Negrita (Ctrl+B)"
                    className="toolbar-btn"
                >
                    <Bold size={16} />
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => execCommand('italic')}
                    title="Cursiva (Ctrl+I)"
                    className="toolbar-btn"
                >
                    <Italic size={16} />
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertTag('ul')}
                    title="Lista"
                    className="toolbar-btn"
                >
                    <List size={16} />
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertTag('a')}
                    title="Link"
                    className="toolbar-btn"
                >
                    <LinkIcon size={16} />
                </button>
                <div className="toolbar-divider" />
                <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className={`toolbar-btn ${showPreview ? 'active' : ''}`}
                >
                    {showPreview ? 'Editar' : 'Vista Previa'}
                </button>
            </div>

            {showPreview ? (
                <div
                    className="editor-preview"
                    style={{ minHeight: `${minHeight}px` }}
                    dangerouslySetInnerHTML={{ __html: value }}
                />
            ) : (
                <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleInput}
                    className="editor-contenteditable"
                    style={{ minHeight: `${minHeight}px` }}
                    data-placeholder={placeholder}
                />
            )}
        </div>
    );
}
