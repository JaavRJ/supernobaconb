import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { calculateReadingTime, formatReadingTime, getTextContent } from '../../utils/readingTime';
import './ReadingTimeIndicator.css';

interface ReadingTimeIndicatorProps {
    contentId: string;
}

export default function ReadingTimeIndicator({ contentId }: ReadingTimeIndicatorProps) {
    const [readingTime, setReadingTime] = useState<string>('');

    useEffect(() => {
        const element = document.getElementById(contentId);
        if (element) {
            const text = getTextContent(element);
            const minutes = calculateReadingTime(text);
            setReadingTime(formatReadingTime(minutes));
        }
    }, [contentId]);

    if (!readingTime) return null;

    return (
        <div className="reading-time-indicator">
            <Clock size={16} />
            <span>{readingTime} de lectura</span>
        </div>
    );
}
