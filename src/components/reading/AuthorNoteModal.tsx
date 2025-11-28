import React from 'react';
import { X, BookOpen } from 'lucide-react';
import type { AuthorNote } from '../../data/authorNotes';
import './AuthorNoteModal.css';

interface AuthorNoteModalProps {
    note: AuthorNote;
    onClose: () => void;
}

export default function AuthorNoteModal({ note, onClose }: AuthorNoteModalProps) {
    return (
        <div className="author-note-overlay" onClick={onClose}>
            <div className="author-note-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-icon">
                        <BookOpen size={24} />
                    </div>
                    <h2>{note.noteTitle}</h2>
                    <button onClick={onClose} className="modal-close" aria-label="Cerrar nota">
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-content">
                    <p>{note.noteContent}</p>
                </div>

                <div className="modal-footer">
                    <span className="author-signature">Nota del autor</span>
                </div>
            </div>
        </div>
    );
}
