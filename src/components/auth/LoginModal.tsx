import React, { useState } from 'react';
import { X, LogIn, Cloud, Sparkles } from 'lucide-react';
import { signInWithGoogle } from '../../services/authService';
import './LoginModal.css';

interface LoginModalProps {
    onClose: () => void;
    onLoginSuccess?: () => void;
}

export default function LoginModal({ onClose, onLoginSuccess }: LoginModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');

        try {
            const user = await signInWithGoogle();
            console.log('✅ Usuario autenticado:', user.email);

            if (onLoginSuccess) {
                onLoginSuccess();
            }

            // Close modal after successful login
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
            console.error('❌ Error en login:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-modal-overlay" onClick={onClose}>
            <div className="login-modal" onClick={(e) => e.stopPropagation()}>
                <button className="login-modal-close" onClick={onClose} aria-label="Cerrar">
                    <X size={24} />
                </button>

                <div className="login-modal-content">
                    <div className="login-modal-icon">
                        <Cloud size={48} />
                    </div>

                    <h2>Sincroniza tu progreso</h2>
                    <p className="login-modal-description">
                        Inicia sesión con Google para guardar tu progreso, highlights, citas y bookmarks en la nube.
                    </p>

                    <div className="login-modal-benefits">
                        <div className="benefit-item">
                            <Sparkles size={20} />
                            <span>Sincronización automática</span>
                        </div>
                        <div className="benefit-item">
                            <Cloud size={20} />
                            <span>Accede desde cualquier dispositivo</span>
                        </div>
                        <div className="benefit-item">
                            <LogIn size={20} />
                            <span>Tus datos siempre seguros</span>
                        </div>
                    </div>

                    {error && (
                        <div className="login-modal-error">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        className="login-modal-btn"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span>
                            {loading ? 'Iniciando sesión...' : 'Continuar con Google'}
                        </span>
                    </button>

                    <button className="login-modal-skip" onClick={onClose}>
                        Continuar sin iniciar sesión
                    </button>

                    <p className="login-modal-note">
                        Tus datos locales se migrarán automáticamente cuando inicies sesión
                    </p>
                </div>
            </div>
        </div>
    );
}
