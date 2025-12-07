import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Save, X } from 'lucide-react';
import { getAllParts, saveChapter, deleteChapter, type Chapter } from '../../services/contentService';
import SimpleEditor from '../../components/admin/SimpleEditor';
import './ChaptersManager.css';

export default function ChaptersManager() {
    const [parts, setParts] = useState<any[]>([]);
    const [selectedPart, setSelectedPart] = useState<number>(1);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [editingChapter, setEditingChapter] = useState<{
        index: number;
        chapter: Chapter;
    } | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadParts();
    }, []);

    useEffect(() => {
        if (selectedPart) {
            loadChapters();
        }
    }, [selectedPart]);

    const loadParts = async () => {
        try {
            const allParts = await getAllParts();
            setParts(allParts);
            if (allParts.length > 0) {
                setSelectedPart(allParts[0].partNumber);
            }
        } catch (error) {
            console.error('Error loading parts:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadChapters = async () => {
        try {
            const part = parts.find(p => p.partNumber === selectedPart);
            if (part) {
                setChapters(part.chapters || []);
            }
        } catch (error) {
            console.error('Error loading chapters:', error);
        }
    };

    const handleEdit = (index: number) => {
        setEditingChapter({
            index,
            chapter: { ...chapters[index] }
        });
        setShowPreview(false);
    };

    const handleSave = async () => {
        if (!editingChapter) return;

        try {
            await saveChapter(selectedPart, editingChapter.index, editingChapter.chapter);
            await loadParts();
            setEditingChapter(null);
            alert('✅ Capítulo guardado exitosamente');
        } catch (error) {
            console.error('Error saving chapter:', error);
            alert('❌ Error al guardar el capítulo');
        }
    };

    const handleDelete = async (index: number) => {
        if (!window.confirm('¿Estás seguro de eliminar este capítulo?')) return;

        try {
            await deleteChapter(selectedPart, index);
            await loadParts();
            alert('✅ Capítulo eliminado');
        } catch (error) {
            console.error('Error deleting chapter:', error);
            alert('❌ Error al eliminar el capítulo');
        }
    };

    const handleNewChapter = () => {
        const newIndex = chapters.length;
        setEditingChapter({
            index: newIndex,
            chapter: {
                number: (newIndex + 1).toString(),
                title: '',
                content: ''
            }
        });
    };

    if (loading) {
        return <div className="chapters-manager"><p>Cargando...</p></div>;
    }

    return (
        <div className="chapters-manager">
            <div className="manager-header">
                <h1>Gestión de Capítulos</h1>
                <button className="btn-primary" onClick={handleNewChapter}>
                    <Plus size={20} />
                    Nuevo Capítulo
                </button>
            </div>

            {/* Part Selector */}
            <div className="part-selector">
                <label>Seleccionar Parte:</label>
                <select
                    value={selectedPart}
                    onChange={(e) => setSelectedPart(Number(e.target.value))}
                >
                    {parts.map(part => (
                        <option key={part.partNumber} value={part.partNumber}>
                            Parte {part.partNumber}: {part.partTitle}
                        </option>
                    ))}
                </select>
            </div>

            {/* Editor Modal */}
            {editingChapter && (
                <div className="editor-modal">
                    <div className="editor-container">
                        <div className="editor-header">
                            <h2>
                                {editingChapter.index < chapters.length ? 'Editar' : 'Nuevo'} Capítulo
                            </h2>
                            <div className="editor-actions">
                                <button
                                    className="btn-secondary"
                                    onClick={() => setShowPreview(!showPreview)}
                                >
                                    <Eye size={18} />
                                    {showPreview ? 'Editor' : 'Vista Previa'}
                                </button>
                                <button className="btn-primary" onClick={handleSave}>
                                    <Save size={18} />
                                    Guardar
                                </button>
                                <button
                                    className="btn-danger"
                                    onClick={() => setEditingChapter(null)}
                                >
                                    <X size={18} />
                                    Cancelar
                                </button>
                            </div>
                        </div>

                        <div className="editor-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Número de Capítulo</label>
                                    <input
                                        type="text"
                                        value={editingChapter.chapter.number}
                                        onChange={(e) => setEditingChapter({
                                            ...editingChapter,
                                            chapter: {
                                                ...editingChapter.chapter,
                                                number: e.target.value
                                            }
                                        })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Título del Capítulo</label>
                                    <input
                                        type="text"
                                        value={editingChapter.chapter.title}
                                        onChange={(e) => setEditingChapter({
                                            ...editingChapter,
                                            chapter: {
                                                ...editingChapter.chapter,
                                                title: e.target.value
                                            }
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Contenido</label>
                                {showPreview ? (
                                    <div
                                        className="content-preview"
                                        dangerouslySetInnerHTML={{
                                            __html: editingChapter.chapter.content
                                        }}
                                    />
                                ) : (
                                    <SimpleEditor
                                        value={editingChapter.chapter.content}
                                        onChange={(content) => setEditingChapter({
                                            ...editingChapter,
                                            chapter: {
                                                ...editingChapter.chapter,
                                                content
                                            }
                                        })}
                                        placeholder="Contenido del capítulo en HTML..."
                                        minHeight={400}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Chapters List */}
            <div className="chapters-list">
                {chapters.length === 0 ? (
                    <p className="empty-state">No hay capítulos en esta parte</p>
                ) : (
                    chapters.map((chapter, index) => (
                        <div
                            key={index}
                            className="chapter-card"
                            onClick={() => handleEdit(index)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="chapter-info">
                                <h3>Capítulo {chapter.number}: {chapter.title}</h3>
                                <div
                                    className="chapter-preview"
                                    dangerouslySetInnerHTML={{
                                        __html: chapter.content.substring(0, 200) + '...'
                                    }}
                                />
                            </div>
                            <div className="chapter-actions" onClick={(e) => e.stopPropagation()}>
                                <button
                                    className="btn-icon"
                                    onClick={() => handleEdit(index)}
                                    title="Editar"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    className="btn-icon btn-danger"
                                    onClick={() => handleDelete(index)}
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
