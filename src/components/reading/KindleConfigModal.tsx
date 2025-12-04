import React, { useState } from 'react';
import { BookOpen, Scroll, Type, X } from 'lucide-react';
import FeatureTutorial from './FeatureTutorial';
import { saveUserPreferences, type UserPreferences } from '../../services/userDataService';
import './KindleConfigModal.css';

interface KindleConfigModalProps {
    onComplete: (preferences: UserPreferences) => void;
}

export default function KindleConfigModal({ onComplete }: KindleConfigModalProps) {
    const [step, setStep] = useState<'welcome' | 'mode' | 'fontSize' | 'tutorial'>('welcome');
    const [readingMode, setReadingMode] = useState<'horizontal' | 'vertical'>('horizontal');
    const [fontSize, setFontSize] = useState(16);
    const [showTutorial, setShowTutorial] = useState(false);

    const handleModeSelect = (mode: 'horizontal' | 'vertical') => {
        setReadingMode(mode);
        setStep('fontSize');
    };

    const handleFontSizeConfirm = () => {
        setStep('tutorial');
    };

    const handleTutorialStart = () => {
        setShowTutorial(true);
    };

    const handleTutorialComplete = async () => {
        const preferences: UserPreferences = {
            readingMode,
            fontSize,
            hasSeenTutorial: true,
            hasConfigured: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await saveUserPreferences(preferences);
        onComplete(preferences);
    };

    const handleSkipTutorial = async () => {
        const preferences: UserPreferences = {
            readingMode,
            fontSize,
            hasSeenTutorial: false,
            hasConfigured: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await saveUserPreferences(preferences);
        onComplete(preferences);
    };

    const handleSkipAll = async () => {
        const preferences: UserPreferences = {
            readingMode: 'horizontal',
            fontSize: 16,
            hasSeenTutorial: false,
            hasConfigured: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await saveUserPreferences(preferences);
        onComplete(preferences);
    };

    if (showTutorial) {
        return (
            <FeatureTutorial
                onComplete={handleTutorialComplete}
                onSkip={handleSkipTutorial}
            />
        );
    }

    return (
        <div className="config-overlay">
            <div className="config-modal">
                {/* Welcome Step */}
                {step === 'welcome' && (
                    <div className="config-step">
                        <div className="config-header">
                            <h1 className="config-title">¡Bienvenido a Supernoba!</h1>
                            <button onClick={handleSkipAll} className="config-skip-btn">
                                <X size={20} />
                                Saltar
                            </button>
                        </div>

                        <div className="config-content">
                            <div className="config-welcome-icon">
                                <BookOpen size={80} strokeWidth={1.5} />
                            </div>

                            <p className="config-description">
                                Antes de comenzar, personaliza tu experiencia de lectura.
                                Esto solo tomará un momento.
                            </p>

                            <button
                                onClick={() => setStep('mode')}
                                className="config-primary-btn"
                            >
                                Comenzar configuración
                            </button>

                            <button
                                onClick={handleSkipAll}
                                className="config-secondary-btn"
                            >
                                Usar configuración predeterminada
                            </button>
                        </div>
                    </div>
                )}

                {/* Reading Mode Step */}
                {step === 'mode' && (
                    <div className="config-step">
                        <div className="config-header">
                            <h2 className="config-title">Elige tu modo de lectura</h2>
                            <div className="config-step-indicator">Paso 1 de 3</div>
                        </div>

                        <div className="config-content">
                            <p className="config-description">
                                ¿Cómo prefieres leer?
                            </p>

                            <div className="config-mode-options">
                                <div
                                    className={`config-mode-card ${readingMode === 'horizontal' ? 'selected' : ''}`}
                                    onClick={() => setReadingMode('horizontal')}
                                >
                                    <div className="config-mode-icon">
                                        <BookOpen size={48} />
                                    </div>
                                    <h3>Horizontal</h3>
                                    <p>Como un libro tradicional, con páginas que puedes pasar</p>
                                    <div className="config-mode-preview horizontal-preview">
                                        <div className="preview-page"></div>
                                        <div className="preview-arrow">→</div>
                                    </div>
                                </div>

                                <div
                                    className={`config-mode-card ${readingMode === 'vertical' ? 'selected' : ''}`}
                                    onClick={() => setReadingMode('vertical')}
                                >
                                    <div className="config-mode-icon">
                                        <Scroll size={48} />
                                    </div>
                                    <h3>Vertical</h3>
                                    <p>Desplazamiento continuo, como leer en la web</p>
                                    <div className="config-mode-preview vertical-preview">
                                        <div className="preview-scroll"></div>
                                        <div className="preview-arrow">↓</div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleModeSelect(readingMode)}
                                className="config-primary-btn"
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                )}

                {/* Font Size Step */}
                {step === 'fontSize' && (
                    <div className="config-step">
                        <div className="config-header">
                            <h2 className="config-title">Tamaño de fuente</h2>
                            <div className="config-step-indicator">Paso 2 de 3</div>
                        </div>

                        <div className="config-content">
                            <p className="config-description">
                                Elige el tamaño de fuente que sea más cómodo para ti
                            </p>

                            <div className="config-font-preview" style={{ fontSize: `${fontSize}px` }}>
                                "En el principio creó Dios los cielos y la tierra. Y la tierra estaba desordenada y vacía..."
                            </div>

                            <div className="config-font-controls">
                                <button
                                    onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                                    disabled={fontSize <= 14}
                                    className="config-font-btn"
                                >
                                    <Type size={16} />
                                    A-
                                </button>

                                <div className="config-font-size-display">
                                    {fontSize}px
                                </div>

                                <button
                                    onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                                    disabled={fontSize >= 24}
                                    className="config-font-btn"
                                >
                                    <Type size={24} />
                                    A+
                                </button>
                            </div>

                            <div className="config-font-slider">
                                <input
                                    type="range"
                                    min="14"
                                    max="24"
                                    step="2"
                                    value={fontSize}
                                    onChange={(e) => setFontSize(Number(e.target.value))}
                                    className="config-slider"
                                />
                            </div>

                            <button
                                onClick={handleFontSizeConfirm}
                                className="config-primary-btn"
                            >
                                Continuar
                            </button>

                            <button
                                onClick={() => setStep('mode')}
                                className="config-secondary-btn"
                            >
                                Volver
                            </button>
                        </div>
                    </div>
                )}

                {/* Tutorial Step */}
                {step === 'tutorial' && (
                    <div className="config-step">
                        <div className="config-header">
                            <h2 className="config-title">Tutorial de funciones</h2>
                            <div className="config-step-indicator">Paso 3 de 3</div>
                        </div>

                        <div className="config-content">
                            <div className="config-tutorial-icon">
                                <BookOpen size={64} />
                            </div>

                            <p className="config-description">
                                ¿Quieres aprender a usar las funciones de resaltado, notas, citas y más?
                            </p>

                            <div className="config-tutorial-features">
                                <div className="config-feature-item">✨ Resaltar texto importante</div>
                                <div className="config-feature-item">⭐ Guardar citas favoritas</div>
                                <div className="config-feature-item">🔖 Marcar páginas</div>
                                <div className="config-feature-item">📱 Compartir en Instagram</div>
                            </div>

                            <button
                                onClick={handleTutorialStart}
                                className="config-primary-btn"
                            >
                                Ver tutorial interactivo
                            </button>

                            <button
                                onClick={handleSkipTutorial}
                                className="config-secondary-btn"
                            >
                                Saltar tutorial
                            </button>

                            <button
                                onClick={() => setStep('fontSize')}
                                className="config-text-btn"
                            >
                                Volver
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
