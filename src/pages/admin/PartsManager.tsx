import React, { useState, useEffect } from 'react';
import { Plus, Edit, Save, X } from 'lucide-react';
import { getAllParts, savePart, type Part } from '../../services/contentService';
import SimpleEditor from '../../components/admin/SimpleEditor';
import './PartsManager.css';

export default function PartsManager() {
    const [parts, setParts] = useState<Part[]>([]);
    const [editingPart, setEditingPart] = useState<{
        partNumber: number;
        partTitle: string;
        description: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadParts();
    }, []);

    const loadParts = async () => {
        try {
            const allParts = await getAllParts();
            setParts(allParts);
        } catch (error) {
            console.error('Error loading parts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (part: Part) => {
        setEditingPart({
            partNumber: part.partNumber,
            partTitle: part.partTitle,
            description: part.description || ''
        });
    };

    const handleSave = async () => {
        if (!editingPart) return;

        try {
            await savePart(editingPart);
            await loadParts();
            setEditingPart(null);
            alert('✅ Parte guardada exitosamente');
        } catch (error) {
            console.error('Error saving part:', error);
            alert('❌ Error al guardar la parte');
        }
    };

    const handleNewPart = () => {
        const newPartNumber = parts.length > 0
            ? Math.max(...parts.map(p => p.partNumber)) + 1
            : 1;

        setEditingPart({
            partNumber: newPartNumber,
            partTitle: '',
            description: ''
        });
    };

    if (loading) {
        return <div className="parts-manager"><p>Cargando...</p></div>;
    }

    return (
        <div className="parts-manager">
            <div className="manager-header">
                <h1>Gestión de Partes</h1>
                <button className="btn-primary" onClick={handleNewPart}>
                    <Plus size={20} />
                    Nueva Parte
                </button>
            </div>

            {/* Editor Modal */}
            {editingPart && (
                <div className="editor-modal">
                    <div className="editor-container">
                        <div className="editor-header">
                            <h2>
                                {parts.find(p => p.partNumber === editingPart.partNumber)
                                    ? 'Editar' : 'Nueva'} Parte
                            </h2>
                            <div className="editor-actions">
                                <button className="btn-primary" onClick={handleSave}>
                                    <Save size={18} />
                                    Guardar
                                </button>
                                <button
                                    className="btn-danger"
                                    onClick={() => setEditingPart(null)}
                                >
                                    <X size={18} />
                                    Cancelar
                                </button>
                            </div>
                        </div>

                        <div className="editor-form">
                            <div className="form-group">
                                <label>Número de Parte</label>
                                <input
                                    type="number"
                                    value={editingPart.partNumber}
                                    onChange={(e) => setEditingPart({
                                        ...editingPart,
                                        partNumber: Number(e.target.value)
                                    })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Título de la Parte</label>
                                <input
                                    type="text"
                                    value={editingPart.partTitle}
                                    onChange={(e) => setEditingPart({
                                        ...editingPart,
                                        partTitle: e.target.value
                                    })}
                                    placeholder="Ej: Nebulosa"
                                />
                            </div>

                            <div className="form-group">
                                <label>Descripción (Opcional - Soporta HTML)</label>
                                <SimpleEditor
                                    value={editingPart.description}
                                    onChange={(content) => setEditingPart({
                                        ...editingPart,
                                        description: content
                                    })}
                                    placeholder="Descripción de la parte con formato HTML..."
                                    minHeight={200}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Parts List */}
            <div className="parts-list">
                {parts.length === 0 ? (
                    <p className="empty-state">No hay partes creadas</p>
                ) : (
                    parts.map((part) => (
                        <div key={part.partNumber} className="part-card">
                            <div className="part-info">
                                <h3>Parte {part.partNumber}: {part.partTitle}</h3>
                                {part.description && (
                                    <div
                                        className="part-description"
                                        dangerouslySetInnerHTML={{ __html: part.description }}
                                    />
                                )}
                                <p className="part-meta">
                                    {part.chapters.length} capítulo{part.chapters.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="part-actions">
                                <button
                                    className="btn-icon"
                                    onClick={() => handleEdit(part)}
                                    title="Editar"
                                >
                                    <Edit size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
