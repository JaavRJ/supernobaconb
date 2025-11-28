import React from 'react';
import { X } from 'lucide-react';
import type { AuthorNote } from '../../data/authorNotes';
import './AuthorNoteTooltip.css';

interface AuthorNoteTooltipProps {
    note: AuthorNote;
    position: { x: number; y: number };
    onClose: () => void;
}

export default function AuthorNoteTooltip({ note, position, onClose }: AuthorNoteTooltipProps) {
    return (
        <div
            className="author-note-tooltip"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="tooltip-header">
                <h4>{note.noteTitle}</h4>
                <button onClick={onClose} className="tooltip-close" aria-label="Cerrar nota">
                    <X size={16} />
                </button>
            </div>
            <div className="tooltip-content">
                {note.noteContent}
            </div>
            <div className="tooltip-footer">
                <span className="note-label">Nota del autor</span>
            </div>
        </div>
    );
}
