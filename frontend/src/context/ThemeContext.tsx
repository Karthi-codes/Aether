import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeConfig {
    name: string;
    colors: {
        primary: string;
        secondary: string;
        background: string;
        text: string;
    };
    backgroundGradient: string;
}

interface ThemeContextType {
    currentTheme: ThemeConfig;
    season: 'Winter' | 'Summer' | 'Monsoon' | 'Festival' | 'Default';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themes: Record<string, ThemeConfig> = {
    Winter: {
        name: 'Winter',
        colors: {
            primary: '#00bcd4', // Cyan/Ice blue
            secondary: '#ffffff',
            background: '#f0f8ff', // AliceBlue
            text: '#2c3e50',
        },
        backgroundGradient: 'linear-gradient(to bottom, #e6f7ff, #ffffff)',
    },
    Summer: {
        name: 'Summer',
        colors: {
            primary: '#ff9800', // Orange
            secondary: '#ffd700',
            background: '#fff9e6',
            text: '#5d4037',
        },
        backgroundGradient: 'linear-gradient(to bottom, #fffde7, #ffffff)',
    },
    Festival: {
        name: 'Festival',
        colors: {
            primary: '#d4af37', // Gold
            secondary: '#c0392b', // Red
            background: '#fff0f5', // LavenderBlush
            text: '#4a235a',
        },
        backgroundGradient: 'linear-gradient(to bottom, #fff0f5, #ffffff)',
    },
    Default: {
        name: 'Default',
        colors: {
            primary: '#D4AF37', // Gold
            secondary: '#2C2C2C', // Dark Grey
            background: '#ffffff',
            text: '#000000',
        },
        backgroundGradient: 'linear-gradient(to bottom, #ffffff, #f5f5f5)',
    }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [season, setSeason] = useState<ThemeContextType['season']>('Default');
    const [theme, setTheme] = useState<ThemeConfig>(themes.Default);

    useEffect(() => {
        const updateTheme = () => {
            const date = new Date();
            const month = date.getMonth();
            const day = date.getDate();

            // Check for Festivals
            if ((month === 0 && day === 1) || (month === 11 && day === 25)) {
                setSeason('Festival');
                setTheme(themes.Festival);
                return;
            }

            // Check Seasons
            if (month === 11 || month === 0 || month === 1) {
                setSeason('Winter');
                setTheme(themes.Winter);
            } else if (month >= 2 && month <= 4) {
                setSeason('Summer');
                setTheme(themes.Summer);
            } else {
                setSeason('Default');
                setTheme(themes.Default);
            }
        };

        updateTheme();
    }, []);

    return (
        <ThemeContext.Provider value={{ currentTheme: theme, season }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
