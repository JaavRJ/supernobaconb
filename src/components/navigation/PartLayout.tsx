import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Footer from '../UI/Footer';
import ReadingSettings from '../ReadingSettings';
import NavigationSystem from './NavigationSystem';
import PDFDownloadButton from '../reading/PDFDownloadButton';
import ReadingTimeIndicator from '../reading/ReadingTimeIndicator';
import ImmersiveModeButton from '../reading/ImmersiveModeButton';
import LoginModal from '../auth/LoginModal';
import LoginButton from '../auth/LoginButton';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { getCurrentUser } from '../../services/authService';
import '../../assets/styles/animations.css';

interface PartLayoutProps {
    children: React.ReactNode;
    partNumber: number;
    partTitle: string;
    contentId: string;
}

export default function PartLayout({
    children,
    partNumber,
    partTitle,
    contentId
}: PartLayoutProps) {
    const [showParticles, setShowParticles] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const location = useLocation();
    const { saveProgress } = useReadingProgress(partNumber);

    useEffect(() => {
        setShowParticles(true);
        const timer = setTimeout(() => setShowParticles(false), 1000);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    // Show login modal on first visit if not authenticated
    useEffect(() => {
        const hasSeenLoginModal = localStorage.getItem('supernova_login_modal_seen');
        const user = getCurrentUser();

        // Show modal if user hasn't seen it and is not authenticated
        if (!hasSeenLoginModal && !user) {
            // Small delay to let the page load first
            const timer = setTimeout(() => {
                setShowLoginModal(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleCloseLoginModal = () => {
        setShowLoginModal(false);
        // Mark as seen so it doesn't show again
        localStorage.setItem('supernova_login_modal_seen', 'true');
    };

    const handleLoginSuccess = () => {
        console.log('✅ Login exitoso, datos migrados automáticamente');
        // Mark as seen
        localStorage.setItem('supernova_login_modal_seen', 'true');
    };

    // Track scroll progress
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollX;
            saveProgress(scrollPosition);
        };

        // Save progress every 2 seconds while scrolling
        let scrollTimeout: NodeJS.Timeout;
        const debouncedScroll = () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(handleScroll, 2000);
        };

        window.addEventListener('scroll', debouncedScroll);
        return () => {
            window.removeEventListener('scroll', debouncedScroll);
            clearTimeout(scrollTimeout);
        };
    }, [saveProgress]);

    return (
        <div style={{ position: 'relative' }}>
            <Footer />
            <NavigationSystem currentEpisode={partNumber} />
            <PDFDownloadButton
                partNumber={partNumber}
                partTitle={partTitle}
            />
            <ReadingTimeIndicator contentId={contentId} />
            <ImmersiveModeButton
                partNumber={partNumber}
                partTitle={partTitle}
            />

            {/* Login Button - appears when not authenticated */}
            <LoginButton />

            {/* Login Modal */}
            {showLoginModal && (
                <LoginModal
                    onClose={handleCloseLoginModal}
                    onLoginSuccess={handleLoginSuccess}
                />
            )}

            <div id={contentId}>
                {children}
            </div>
        </div>
    );
}
