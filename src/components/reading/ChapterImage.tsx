import React from 'react';
import { motion } from 'framer-motion';
import './ChapterImage.css';

interface ChapterImageProps {
    src: string;
    alt: string;
}

export default function ChapterImage({ src, alt }: ChapterImageProps) {
    return (
        <motion.div
            className="chapter-image-container"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
        >
            <img
                src={src}
                alt={alt}
                loading="lazy"
                className="chapter-image"
            />
        </motion.div>
    );
}
