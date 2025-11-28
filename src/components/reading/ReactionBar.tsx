import React, { useState, useEffect } from 'react';
import {
    getReactions,
    getUserReaction,
    addReaction,
    subscribeToReactions,
    getUserId,
    type ReactionType,
    type Reactions
} from '../../services/reactionsService';
import './ReactionBar.css';

interface ReactionBarProps {
    partNumber: number;
    chapterIndex: number;
}

const REACTION_EMOJIS = {
    heart: '❤️',
    sad: '😢',
    mind_blown: '🤯',
    star: '⭐'
};

const REACTION_LABELS = {
    heart: 'Me encanta',
    sad: 'Triste',
    mind_blown: 'Wow',
    star: 'Favorito'
};

export default function ReactionBar({ partNumber, chapterIndex }: ReactionBarProps) {
    const [reactions, setReactions] = useState<Reactions>({
        heart: 0,
        sad: 0,
        mind_blown: 0,
        star: 0
    });
    const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
    const [loading, setLoading] = useState(true);
    const userId = getUserId();

    // Cargar reacciones iniciales
    useEffect(() => {
        const loadReactions = async () => {
            setLoading(true);
            try {
                const [reactionsData, userReactionData] = await Promise.all([
                    getReactions(partNumber, chapterIndex),
                    getUserReaction(userId, partNumber, chapterIndex)
                ]);
                setReactions(reactionsData);
                setUserReaction(userReactionData);
            } catch (error) {
                console.error('Error loading reactions:', error);
            } finally {
                setLoading(false);
            }
        };

        loadReactions();

        // Suscribirse a cambios en tiempo real
        const unsubscribe = subscribeToReactions(partNumber, chapterIndex, (newReactions) => {
            setReactions(newReactions);
        });

        return () => unsubscribe();
    }, [partNumber, chapterIndex, userId]);

    const handleReaction = async (reaction: ReactionType) => {
        try {
            await addReaction(userId, partNumber, chapterIndex, reaction);
            setUserReaction(reaction);
        } catch (error) {
            console.error('Error adding reaction:', error);
            alert('❌ Error al guardar la reacción. Verifica tu conexión a Firebase.');
        }
    };

    if (loading) {
        return (
            <div className="reaction-bar">
                <span className="reaction-loading">Cargando reacciones...</span>
            </div>
        );
    }

    return (
        <div className="reaction-bar">
            <span className="reaction-label">¿Qué te pareció?</span>
            <div className="reactions-container">
                {(Object.keys(REACTION_EMOJIS) as ReactionType[]).map((reactionType) => (
                    <button
                        key={reactionType}
                        className={`reaction-btn ${userReaction === reactionType ? 'active' : ''}`}
                        onClick={() => handleReaction(reactionType)}
                        title={REACTION_LABELS[reactionType]}
                    >
                        <span className="reaction-emoji">{REACTION_EMOJIS[reactionType]}</span>
                        <span className="reaction-count">{reactions[reactionType]}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
