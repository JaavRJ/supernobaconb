import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Filter } from 'lucide-react';
import {
    getAllAuthorNotes,
    saveAuthorNote,
    deleteAuthorNote,
    getAllParts,
    type AuthorNote
} from '../../services/contentService';
import './NotesManager.css';

export default function NotesManager() {
    const [notes, setNotes] = useState<AuthorNote[]>([]);
    const [parts, setParts] = useState<any[]>([]);
    const [filterPart, setFilterPart] = useState<number | 'all'>('all');
    const [editingNote, setEditingNote] = useState<AuthorNote | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [allNotes, allParts] = await Promise.all([
                getAllAuthorNotes(),
                getAllParts()
            ]);
            setNotes(allNotes);
            setParts(allParts);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (note: AuthorNote) => {
        setEditingNote({ ...note });
    };

    const handleSave = async () => {
        if (!editingNote) return;

        try {
            await saveAuthorNote(editingNote);
            await loadData();
            setEditingNote(null);
            alert('✅ Nota guardada exitosamente');
        } catch (error) {
            console.error('Error saving note:', error);
            alert('❌ Error al guardar la nota');
        }
    };

    const handleDelete = async (noteId: string) => {
        if (!window.confirm('¿Estás seguro de eliminar esta nota?')) return;

        try {
            await deleteAuthorNote(noteId);
            await loadData();
            alert('✅ Nota eliminada');
        } catch (error) {
            console.error('Error deleting note:', error);
            alert('❌ Error al eliminar la nota');
        }
    };

    const handleNewNote = () => {
        setEditingNote({
            id: `note_${Date.now()}`,
            partNumber: 1,
            chapterIndex: 0,
            triggerText: '',
            noteTitle: '',
            noteContent: '',
            type: 'tooltip'
        });
    };

    const filteredNotes = filterPart === 'all'
        ? notes
        : notes.filter(note => note.partNumber === filterPart);

    if (loading) {
        return <div className="notes-manager"><p>Cargando...</p></div>;
    }

    return (
        <div className="notes-manager">
            <div className="manager-header">
                <h1>Gestión de Notas del Autor</h1>
                <button className="btn-primary" onClick={handleNewNote}>
                    <Plus size={20} />
                    Nueva Nota
                </button>
            </div>

            {/* Filter */}
            <div className="filter-bar">
                <Filter size={18} />
                <select
                    value={filterPart}
                    onChange={(e) => setFilterPart(
                        e.target.value === 'all' ? 'all' : Number(e.target.value)
                    )}
                >
                    <option value="all">Todas las partes</option>
                    {parts.map(part => (
                        <option key={part.partNumber} value={part.partNumber}>
                            Parte {part.partNumber}: {part.partTitle}
                        </option>
                    ))}
                </select>
            </div>

            {/* Editor Modal */}
            {editingNote && (
                <div className="editor-modal">
                    <div className="editor-container">
                        <div className="editor-header">
                            <h2>
                                {notes.find(n => n.id === editingNote.id) ? 'Editar' : 'Nueva'} Nota
                            </h2>
                            <div className="editor-actions">
                                <button className="btn-primary" onClick={handleSave}>
                                    <Save size={18} />
                                    Guardar
                                </button>
                                <button
                                    className="btn-danger"
                                    onClick={() => setEditingNote(null)}
                                >
                                    <X size={18} />
                                    Cancelar
                                </button>
                            </div>
                        </div>

                        <div className="editor-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Parte</label>
                                    <select
                                        value={editingNote.partNumber}
                                        onChange={(e) => setEditingNote({
                                            ...editingNote,
                                            partNumber: Number(e.target.value)
                                        })}
                                    >
                                        {parts.map(part => (
                                            <option key={part.partNumber} value={part.partNumber}>
                                                Parte {part.partNumber}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Capítulo (índice)</label>
                                    <input
                                        type="number"
                                        value={editingNote.chapterIndex}
                                        onChange={(e) => setEditingNote({
                                            ...editingNote,
                                            chapterIndex: Number(e.target.value)
                                        })}
                                        min="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Tipo</label>
                                    <select
                                        value={editingNote.type}
                                        onChange={(e) => setEditingNote({
                                            ...editingNote,
                                            type: e.target.value as 'tooltip' | 'modal'
                                        })}
                                    >
                                        <option value="tooltip">Tooltip (breve)</option>
                                        <option value="modal">Modal (extenso)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>ID de la Nota (único)</label>
                                <input
                                    type="text"
                                    value={editingNote.id}
                                    onChange={(e) => setEditingNote({
                                        ...editingNote,
                                        id: e.target.value
                                    })}
                                    placeholder="Ej: nota_cielo_estrellado"
                                />
                                <small style={{ color: '#6b7280', fontSize: '13px' }}>
                                    Usa un ID único y descriptivo (sin espacios)
                                </small>
                            </div>

                            <div className="form-group">
                                <label>Texto Trigger (texto que activa la nota)</label>
                                <input
                                    type="text"
                                    value={editingNote.triggerText}
                                    onChange={(e) => setEditingNote({
                                        ...editingNote,
                                        triggerText: e.target.value
                                    })}
                                    placeholder="Ej: Cielo Estrellado"
                                />
                            </div>

                            <div className="form-group">
                                <label>Título de la Nota</label>
                                <input
                                    type="text"
                                    value={editingNote.noteTitle}
                                    onChange={(e) => setEditingNote({
                                        ...editingNote,
                                        noteTitle: e.target.value
                                    })}
                                    placeholder="Título que aparecerá en la nota"
                                />
                            </div>

                            <div className="form-group">
                                <label>Contenido de la Nota</label>
                                <textarea
                                    value={editingNote.noteContent}
                                    onChange={(e) => setEditingNote({
                                        ...editingNote,
                                        noteContent: e.target.value
                                    })}
                                    placeholder="Contenido de la nota..."
                                    rows={6}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notes List */}
            <div className="notes-list">
                {filteredNotes.length === 0 ? (
                    <p className="empty-state">No hay notas para mostrar</p>
                ) : (
                    filteredNotes.map((note) => (
                        <div key={note.id} className="note-card">
                            <div className="note-info">
                                <div className="note-header">
                                    <h3>{note.noteTitle}</h3>
                                    <span className={`note-type ${note.type}`}>
                                        {note.type === 'tooltip' ? '💬 Tooltip' : '📄 Modal'}
                                    </span>
                                </div>
                                <p className="note-trigger">
                                    Trigger: "<strong>{note.triggerText}</strong>"
                                </p>
                                <p className="note-content">{note.noteContent}</p>
                                <p className="note-meta">
                                    Parte {note.partNumber} - Capítulo {note.chapterIndex}
                                </p>
                            </div>
                            <div className="note-actions">
                                <button
                                    className="btn-icon"
                                    onClick={() => handleEdit(note)}
                                    title="Editar"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    className="btn-icon btn-danger"
                                    onClick={() => handleDelete(note.id)}
                                    title="Eliminar"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
