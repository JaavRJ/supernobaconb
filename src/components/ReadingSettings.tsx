import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Settings, X, Type, Palette, Maximize2 } from 'lucide-react';
import './ReadingSettings.css';

export default function ReadingSettings() {
    const [isOpen, setIsOpen] = useState(false);
    const { settings, updateColorMode, updateFontSize, updateLineWidth } = useTheme();

    const togglePanel = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Floating Settings Button */}
            <button
                className="settings-trigger glass"
                onClick={togglePanel}
                aria-label="Configuración de lectura"
            >
                <Settings size={20} />
            </button>

            {/* Settings Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div className="settings-backdrop" onClick={togglePanel} />

                    {/* Panel */}
                    <div className="settings-panel glass">
                        <div className="settings-header">
                            <h3 className="font-ui">Configuración de Lectura</h3>
                            <button
                                className="settings-close"
                                onClick={togglePanel}
                                aria-label="Cerrar"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="settings-content">

                            {/* Color Mode */}
                            <div className="settings-section">
                                <div className="settings-label">
                                    <Palette size={18} />
                                    <span className="font-ui">Modo de Color</span>
                                </div>
                                <div className="settings-options">
                                    <button
                                        className={`option-btn ${settings.colorMode === 'dark' ? 'active' : ''}`}
                                        onClick={() => updateColorMode('dark')}
                                    >
                                        Oscuro
                                    </button>
                                    <button
                                        className={`option-btn ${settings.colorMode === 'light' ? 'active' : ''}`}
                                        onClick={() => updateColorMode('light')}
                                    >
                                        Claro
                                    </button>
                                    <button
                                        className={`option-btn ${settings.colorMode === 'sepia' ? 'active' : ''}`}
                                        onClick={() => updateColorMode('sepia')}
                                    >
                                        Sepia
                                    </button>
                                </div>
                            </div>

                            {/* Font Size */}
                            <div className="settings-section">
                                <div className="settings-label">
                                    <Type size={18} />
                                    <span className="font-ui">Tamaño de Fuente</span>
                                </div>
                                <div className="settings-options">
                                    <button
                                        className={`option-btn ${settings.fontSize === 'small' ? 'active' : ''}`}
                                        onClick={() => updateFontSize('small')}
                                    >
                                        S
                                    </button>
                                    <button
                                        className={`option-btn ${settings.fontSize === 'medium' ? 'active' : ''}`}
                                        onClick={() => updateFontSize('medium')}
                                    >
                                        M
                                    </button>
                                    <button
                                        className={`option-btn ${settings.fontSize === 'large' ? 'active' : ''}`}
                                        onClick={() => updateFontSize('large')}
                                    >
                                        L
                                    </button>
                                    <button
                                        className={`option-btn ${settings.fontSize === 'xlarge' ? 'active' : ''}`}
                                        onClick={() => updateFontSize('xlarge')}
                                    >
                                        XL
                                    </button>
                                </div>
                            </div>

                            {/* Line Width */}
                            <div className="settings-section">
                                <div className="settings-label">
                                    <Maximize2 size={18} />
                                    <span className="font-ui">Ancho de Línea</span>
                                </div>
                                <div className="settings-options">
                                    <button
                                        className={`option-btn ${settings.lineWidth === 'narrow' ? 'active' : ''}`}
                                        onClick={() => updateLineWidth('narrow')}
                                    >
                                        Estrecho
                                    </button>
                                    <button
                                        className={`option-btn ${settings.lineWidth === 'normal' ? 'active' : ''}`}
                                        onClick={() => updateLineWidth('normal')}
                                    >
                                        Normal
                                    </button>
                                    <button
                                        className={`option-btn ${settings.lineWidth === 'wide' ? 'active' : ''}`}
                                        onClick={() => updateLineWidth('wide')}
                                    >
                                        Ancho
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </>
            )}
        </>
    );
}
