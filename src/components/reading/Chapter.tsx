import React from 'react';
import ChapterImage from './ChapterImage';
import './Chapter.css';

interface ChapterProps {
    number: string; // "i", "ii", "iii", "iv"
    title: string;
    content: React.ReactNode;
    imageSrc?: string;
    imageAlt?: string;
}

export default function Chapter({
    number,
    title,
    content,
    imageSrc,
    imageAlt
}: ChapterProps) {
    return (
        <div className="chapter">
            <div className="chapter-header">
                <h2 className="chapter-number">{number}.</h2>
                <h3 className="chapter-title">{title}</h3>
            </div>

            {imageSrc && (
                <ChapterImage src={imageSrc} alt={imageAlt || title} />
            )}

            <div className="chapter-content">
                {content}
            </div>
        </div>
    );
}
