import React, { useEffect, useState } from 'react';
import { BookOpen, FileText, Upload, TrendingUp } from 'lucide-react';
import { getAllParts, getAllAuthorNotes, getAllPDFs } from '../../services/contentService';
import './AdminDashboard.css';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalParts: 0,
        totalChapters: 0,
        totalNotes: 0,
        totalPDFs: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [parts, notes, pdfs] = await Promise.all([
                getAllParts(),
                getAllAuthorNotes(),
                getAllPDFs()
            ]);

            const totalChapters = parts.reduce((sum, part) => sum + part.chapters.length, 0);

            setStats({
                totalParts: parts.length,
                totalChapters,
                totalNotes: notes.length,
                totalPDFs: pdfs.length
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Partes del Libro',
            value: stats.totalParts,
            icon: BookOpen,
            color: '#667eea',
            bgColor: 'rgba(102, 126, 234, 0.1)'
        },
        {
            title: 'Capítulos Totales',
            value: stats.totalChapters,
            icon: FileText,
            color: '#f59e0b',
            bgColor: 'rgba(245, 158, 11, 0.1)'
        },
        {
            title: 'Notas del Autor',
            value: stats.totalNotes,
            icon: TrendingUp,
            color: '#10b981',
            bgColor: 'rgba(16, 185, 129, 0.1)'
        },
        {
            title: 'PDFs Disponibles',
            value: stats.totalPDFs,
            icon: Upload,
            color: '#ef4444',
            bgColor: 'rgba(239, 68, 68, 0.1)'
        }
    ];

    if (loading) {
        return (
            <div className="admin-dashboard">
                <h1>Dashboard</h1>
                <p>Cargando estadísticas...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>Panel de Administración</h1>
                <p>Bienvenido al panel de control de Supernoba</p>
            </div>

            <div className="stats-grid">
                {statCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div key={index} className="stat-card">
                            <div
                                className="stat-icon"
                                style={{ backgroundColor: card.bgColor }}
                            >
                                <Icon size={28} style={{ color: card.color }} />
                            </div>
                            <div className="stat-content">
                                <h3>{card.title}</h3>
                                <p className="stat-value">{card.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="dashboard-actions">
                <h2>Acciones Rápidas</h2>
                <div className="action-buttons">
                    <button className="action-btn primary">
                        <BookOpen size={20} />
                        Crear Nueva Parte
                    </button>
                    <button className="action-btn secondary">
                        <FileText size={20} />
                        Agregar Capítulo
                    </button>
                    <button className="action-btn secondary">
                        <TrendingUp size={20} />
                        Nueva Nota
                    </button>
                    <button className="action-btn secondary">
                        <Upload size={20} />
                        Subir PDF
                    </button>
                </div>
            </div>

            <div className="dashboard-info">
                <div className="info-card">
                    <h3>📚 Gestión de Contenido</h3>
                    <p>
                        Desde este panel puedes administrar todo el contenido del libro:
                        partes, capítulos, notas del autor, PDFs y multimedia.
                    </p>
                </div>
                <div className="info-card">
                    <h3>✏️ Editor WYSIWYG</h3>
                    <p>
                        Utiliza el editor visual para crear y editar capítulos con formato
                        HTML sin necesidad de escribir código.
                    </p>
                </div>
                <div className="info-card">
                    <h3>☁️ Almacenamiento en la Nube</h3>
                    <p>
                        Todos los cambios se guardan automáticamente en Firebase y se
                        sincronizan en tiempo real con la aplicación.
                    </p>
                </div>
            </div>
        </div>
    );
}
