import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ColorMode = 'dark' | 'light' | 'sepia';
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';
export type LineWidth = 'narrow' | 'normal' | 'wide';

export interface ThemeSettings {
    colorMode: ColorMode;
    fontSize: FontSize;
    lineWidth: LineWidth;
    glassEffect: boolean;
}

interface ThemeContextType {
    settings: ThemeSettings;
    updateColorMode: (mode: ColorMode) => void;
    updateFontSize: (size: FontSize) => void;
    updateLineWidth: (width: LineWidth) => void;
    toggleGlassEffect: () => void;
    resetSettings: () => void;
}

const defaultSettings: ThemeSettings = {
    colorMode: 'dark',
    fontSize: 'medium',
    lineWidth: 'normal',
    glassEffect: true,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [settings, setSettings] = useState<ThemeSettings>(() => {
        // Load from localStorage
        const saved = localStorage.getItem('supernova_theme');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return defaultSettings;
            }
        }
        return defaultSettings;
    });

    // Save to localStorage whenever settings change
    useEffect(() => {
        localStorage.setItem('supernova_theme', JSON.stringify(settings));
    }, [settings]);

    // Apply CSS custom properties
    useEffect(() => {
        const root = document.documentElement;

        // Color mode
        root.setAttribute('data-color-mode', settings.colorMode);

        // Font size
        const fontSizeMap = {
            small: '14px',
            medium: '16px',
            large: '18px',
            xlarge: '20px',
        };
        root.style.setProperty('--base-font-size', fontSizeMap[settings.fontSize]);

        // Line width
        const lineWidthMap = {
            narrow: '55ch',
            normal: '65ch',
            wide: '75ch',
        };
        root.style.setProperty('--line-width', lineWidthMap[settings.lineWidth]);

        // Glass effect
        root.style.setProperty('--glass-enabled', settings.glassEffect ? '1' : '0');
    }, [settings]);

    const updateColorMode = (mode: ColorMode) => {
        setSettings((prev) => ({ ...prev, colorMode: mode }));
    };

    const updateFontSize = (size: FontSize) => {
        setSettings((prev) => ({ ...prev, fontSize: size }));
    };

    const updateLineWidth = (width: LineWidth) => {
        setSettings((prev) => ({ ...prev, lineWidth: width }));
    };

    const toggleGlassEffect = () => {
        setSettings((prev) => ({ ...prev, glassEffect: !prev.glassEffect }));
    };

    const resetSettings = () => {
        setSettings(defaultSettings);
    };

    const value: ThemeContextType = {
        settings,
        updateColorMode,
        updateFontSize,
        updateLineWidth,
        toggleGlassEffect,
        resetSettings,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
