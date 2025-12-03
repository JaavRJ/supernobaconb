import React, { useState, useEffect } from 'react';
import { LogIn } from 'lucide-react';
import { signInWithGoogle, getCurrentUser, onAuthStateChanged } from '../../services/authService';
import './LoginButton.css';

export default function LoginButton() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check initial auth state
        const user = getCurrentUser();
        setIsAuthenticated(!!user);

        // Listen for auth changes
        const unsubscribe = onAuthStateChanged((user) => {
            setIsAuthenticated(!!user);
        });

        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
            console.log('✅ Login exitoso');
        } catch (error) {
            console.error('❌ Error en login:', error);
            alert('Error al iniciar sesión. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Don't show button if user is authenticated
    if (isAuthenticated) {
        return null;
    }

    return (
        <button
            className="floating-login-btn"
            onClick={handleLogin}
            disabled={loading}
            title="Iniciar sesión con Google"
        >
            <LogIn size={20} />
            <span>{loading ? 'Iniciando...' : 'Iniciar sesión'}</span>
        </button>
    );
}
