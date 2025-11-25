import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Footer from '../UI/Footer';
import ReadingSettings from '../ReadingSettings';
import NavigationSystem from './NavigationSystem';
import PDFDownloadButton from '../reading/PDFDownloadButton';
import ReadingTimeIndicator from '../reading/ReadingTimeIndicator';
import ImmersiveModeButton from '../reading/ImmersiveModeButton';
import { useReadingProgress } from '../../hooks/useReadingProgress';
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
    const location = useLocation();
    const { saveProgress } = useReadingProgress(partNumber);

    useEffect(() => {
        setShowParticles(true);
        const timer = setTimeout(() => setShowParticles(false), 1000);
        return () => clearTimeout(timer);
    }, [location.pathname]);

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
            <ReadingSettings />
            <NavigationSystem currentEpisode={partNumber} />
            <PDFDownloadButton
                contentId={contentId}
                filename={`supernova-parte-${partNumber}`}
                partTitle={partTitle}
            />
            <ReadingTimeIndicator contentId={contentId} />
            <ImmersiveModeButton
                partNumber={partNumber}
                partTitle={partTitle}
            />

            <div id={contentId}>
                {children}
            </div>
        </div>
    );
}
