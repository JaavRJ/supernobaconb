import React, { useState } from 'react';
import { Menu, X, Home, Book, Lock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './HamburgerMenu.css';

const partes = [
    { id: 1, title: 'Parte 1: Nebulosa', path: '/parte1' },
    { id: 2, title: 'Parte 2', path: '/parte2' },
    { id: 3, title: 'Parte 3', path: '/parte3' },
    { id: 4, title: 'Parte 4', path: '/parte4' },
];

interface HamburgerMenuProps {
    currentEpisode?: number | null;
}

export default function HamburgerMenu({ currentEpisode = null }: HamburgerMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleNavigation = (path: string, parteId: number) => {
        // Only allow navigation if episode is released
        if (currentEpisode !== null && parteId <= currentEpisode) {
            navigate(path);
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* Hamburger Button */}
            <button
                className="hamburger-trigger"
                onClick={toggleMenu}
                aria-label="Menú de navegación"
                aria-expanded={isOpen}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Menu Overlay */}
            {isOpen && (
                <>
                    <div className="hamburger-backdrop" onClick={toggleMenu} />
                    <nav className="hamburger-menu">
                        <div className="hamburger-header">
                            <h2 className="font-ui">Supernova</h2>
                        </div>

                        <div className="hamburger-content">
                            {/* Home Link */}
                            <button
                                className={`menu-item ${location.pathname === '/' ? 'active' : ''}`}
                                onClick={() => handleNavigation('/', 0)}
                            >
                                <Home size={20} />
                                <span>Inicio</span>
                            </button>

                            {/* Parts List */}
                            <div className="menu-section">
                                <h3 className="menu-section-title font-ui">Partes</h3>
                                {partes.map((parte) => {
                                    // Only show as released if currentEpisode is explicitly set and >= parte.id
                                    const isReleased = currentEpisode !== null && currentEpisode >= parte.id;
                                    const isActive = location.pathname === parte.path && parte.id === 1;

                                    return (
                                        <button
                                            key={parte.id}
                                            className={`menu-item ${isActive ? 'active' : ''}`}
                                            onClick={() => handleNavigation(parte.path, parte.id)}
                                            disabled={!isReleased}
                                            title={!isReleased ? 'Aún no disponible' : ''}
                                        >
                                            {isReleased ? <Book size={18} /> : <Lock size={18} />}
                                            <span>{parte.title}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </nav>
                </>
            )}
        </>
    );
}
