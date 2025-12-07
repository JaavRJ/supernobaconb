import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Highlighter, MessageSquare, Star, Bookmark, Share2, Play } from 'lucide-react';
import './FeatureTutorial.css';

interface TutorialStep {
    title: string;
    description: string;
    icon: React.ReactNode;
    videoUrl?: string;
    imagePath?: string;
}

interface FeatureTutorialProps {
    onComplete: () => void;
    onSkip: () => void;
}

const tutorialSteps: TutorialStep[] = [
    {
        title: '¡Bienvenido a tu Kindle!',
        description: 'Aprende a usar todas las funciones para mejorar tu experiencia de lectura. Este tutorial te mostrará cómo resaltar texto, guardar citas, compartir citas y más.',
        icon: <Star size={48} className="tutorial-icon" />,
    },
    {
        title: 'Seleccionar y Resaltar Texto',
        description: 'Selecciona cualquier texto en el libro para resaltarlo. Mantén presionado o arrastra el cursor sobre el texto que deseas destacar. Selecciona la opcion del marcador y recarga la pagina.',
        icon: <Highlighter size={48} className="tutorial-icon" />,
        videoUrl: 'https://res.cloudinary.com/dgrhyyuef/video/upload/q_auto/f_auto/v1764817182/supernoba/supernoba-highline_eonyc2.mp4', // Usuario puede agregar URL de video aquí
    },
    {
        title: 'Guardar Citas Favoritas',
        description: 'Guarda tus pasajes favoritos como citas. Selecciona el texto y elige el icono de estrella. Accede a todas tus citas guardadas tocando el ícono de estrella ⭐ en la parte superior.',
        icon: <Star size={48} className="tutorial-icon" />,
        videoUrl: 'https://res.cloudinary.com/dgrhyyuef/video/upload/q_auto/f_auto/v1764817181/supernoba/supernoba-quote_fpuc4g.mp4', // Usuario puede agregar URL de video aquí
    },
    {
        title: 'Compartir',
        description: 'Comparte citas en Instagram Stories o demas plataformas. Selecciona texto, elige el botón de compartir y personaliza el diseño. Tambien puedes compartir tus citas favoritas.',
        icon: <Share2 size={48} className="tutorial-icon" />,
        videoUrl: 'https://res.cloudinary.com/dgrhyyuef/video/upload/q_auto/f_auto/v1764817182/supernoba/supernoba-share_pv9fu4.mp4', // Usuario puede agregar URL de video aquí
    },
];

export default function FeatureTutorial({ onComplete, onSkip }: FeatureTutorialProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [showVideo, setShowVideo] = useState(false);

    const handleNext = () => {
        if (currentStep < tutorialSteps.length - 1) {
            setCurrentStep(currentStep + 1);
            setShowVideo(false);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            setShowVideo(false);
        }
    };

    const handleSkip = () => {
        onSkip();
    };

    const step = tutorialSteps[currentStep];
    const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

    return (
        <div className="tutorial-overlay">
            <div className="tutorial-modal">
                {/* Header */}
                <div className="tutorial-header">
                    <h2>Tutorial Interactivo</h2>
                    <button onClick={handleSkip} className="tutorial-close-btn" title="Cerrar">
                        <X size={24} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="tutorial-progress-container">
                    <div className="tutorial-progress-bar">
                        <div
                            className="tutorial-progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="tutorial-progress-text">
                        Paso {currentStep + 1} de {tutorialSteps.length}
                    </span>
                </div>

                {/* Content */}
                <div className="tutorial-content">
                    <div className="tutorial-icon-container">
                        {step.icon}
                    </div>

                    <h3 className="tutorial-step-title">{step.title}</h3>
                    <p className="tutorial-step-description">{step.description}</p>

                    {/* Video Section */}
                    {step.videoUrl && (
                        <div className="tutorial-video-section">
                            {!showVideo ? (
                                <button
                                    className="tutorial-video-placeholder"
                                    onClick={() => setShowVideo(true)}
                                >
                                    <Play size={48} />
                                    <span>Ver video tutorial</span>
                                </button>
                            ) : (
                                <div className="tutorial-video-container">
                                    <video
                                        controls
                                        autoPlay
                                        className="tutorial-video"
                                        src={step.videoUrl}
                                    >
                                        Tu navegador no soporta videos.
                                    </video>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step Indicators */}
                    <div className="tutorial-step-indicators">
                        {tutorialSteps.map((_, index) => (
                            <div
                                key={index}
                                className={`tutorial-step-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                                onClick={() => setCurrentStep(index)}
                            />
                        ))}
                    </div>
                </div>

                {/* Footer Navigation */}
                <div className="tutorial-footer">
                    <button
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                        className="tutorial-nav-btn tutorial-prev-btn"
                    >
                        <ChevronLeft size={20} />
                        Anterior
                    </button>

                    <button
                        onClick={handleSkip}
                        className="tutorial-skip-btn"
                    >
                        Saltar tutorial
                    </button>

                    <button
                        onClick={handleNext}
                        className="tutorial-nav-btn tutorial-next-btn"
                    >
                        {currentStep === tutorialSteps.length - 1 ? 'Finalizar' : 'Siguiente'}
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
