import React, { useState, useEffect } from 'react';
import { Calendar, Mail, Sparkles, X, Check } from 'lucide-react';
import { signInWithGoogle, getCurrentUser } from '../../services/authService';
import { subscribeUser, markCalendarAdded, isUserSubscribed } from '../../services/newsletterService';
import { requestCalendarPermission } from '../../services/calendarService';
import './NewsletterModal.css';

interface NewsletterModalProps {
    partNumber: number;
    partTitle: string;
    onClose: () => void;
}

export default function NewsletterModal({ partNumber, partTitle, onClose }: NewsletterModalProps) {
    const [loading, setLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [calendarAdded, setCalendarAdded] = useState(false);
    const [error, setError] = useState('');
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        checkSubscription();
    }, []);

    const checkSubscription = async () => {
        const user = getCurrentUser();
        if (user) {
            setUserEmail(user.email || '');
            const isSubscribed = await isUserSubscribed(user.uid);
            setSubscribed(isSubscribed);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');

        try {
            const user = await signInWithGoogle();
            setUserEmail(user.email || '');

            // Subscribe user automatically
            await subscribeUser(
                user.uid,
                user.email || '',
                user.displayName || 'Usuario',
                partNumber
            );

            setSubscribed(true);
            console.log('✅ Suscrito exitosamente');
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
            console.error('❌ Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCalendar = async () => {
        setLoading(true);
        setError('');

        try {
            const user = getCurrentUser();

            if (!user) {
                // If not signed in, sign in first
                await handleGoogleSignIn();
            }

            // Open calendar
            await requestCalendarPermission(partNumber + 1);

            // Mark as added
            if (user) {
                await markCalendarAdded(user.uid);
            }

            setCalendarAdded(true);
            console.log('✅ Agregado al calendario');
        } catch (err: any) {
            setError(err.message || 'Error al agregar al calendario');
            console.error('❌ Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribeWithGoogle = async () => {
        setLoading(true);
        setError('');

        try {
            const user = await signInWithGoogle();

            // Subscribe to newsletter
            await subscribeUser(
                user.uid,
                user.email || '',
                user.displayName || 'Usuario',
                partNumber
            );

            // Add to calendar
            await requestCalendarPermission(partNumber + 1);
            await markCalendarAdded(user.uid);

            setSubscribed(true);
            setCalendarAdded(true);
            setUserEmail(user.email || '');

            console.log('Suscrito y agregado al calendario');
        } catch (err: any) {
            setError(err.message || 'Error en la suscripción');
            console.error('❌ Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="newsletter-overlay" onClick={onClose}>
            <div className="newsletter-modal" onClick={(e) => e.stopPropagation()}>
                <button className="newsletter-close" onClick={onClose} aria-label="Cerrar">
                    <X size={24} />
                </button>

                <div className="newsletter-header">
                    <div className="celebration-icon"></div>
                    <h2>¡Completaste {partTitle}!</h2>
                    <p>¿Quieres saber cuándo salga la siguiente parte?</p>
                </div>

                {error && (
                    <div className="newsletter-error">
                        ⚠️ {error}
                    </div>
                )}

                {subscribed && (
                    <div className="newsletter-success">
                        <Check size={20} />
                        <span>¡Ya estás suscrito! Te avisaremos cuando salga la Parte {partNumber + 1}</span>
                        {userEmail && <small>{userEmail}</small>}
                    </div>
                )}

                <div className="newsletter-options">
                    {!subscribed && (
                        <button
                            className="newsletter-btn primary"
                            onClick={handleSubscribeWithGoogle}
                            disabled={loading}
                        >
                            <Sparkles size={20} />
                            <span>
                                {loading ? 'Procesando...' : 'Suscribirme con Google'}
                            </span>
                        </button>
                    )}

                    <div className="newsletter-divider">
                        <span>o elige una opción</span>
                    </div>

                    <button
                        className="newsletter-btn secondary"
                        onClick={subscribed ? () => { } : handleGoogleSignIn}
                        disabled={loading || subscribed}
                    >
                        <Mail size={20} />
                        <span>
                            {subscribed ? '✓ Suscrito por email' : 'Solo notificarme por email'}
                        </span>
                    </button>

                    <button
                        className="newsletter-btn secondary"
                        onClick={handleAddToCalendar}
                        disabled={loading || calendarAdded}
                    >
                        <Calendar size={20} />
                        <span>
                            {calendarAdded ? '✓ Agregado al calendario' : 'Agregar a mi calendario'}
                        </span>
                    </button>
                </div>

                <div className="newsletter-footer">
                    <p>La Parte {partNumber + 1} estará disponible próximamente</p>
                    <button className="newsletter-skip" onClick={onClose}>
                        Ahora no, gracias
                    </button>
                </div>
            </div>
        </div>
    );
}
