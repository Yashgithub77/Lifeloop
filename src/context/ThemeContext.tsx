"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeName = "light" | "ocean" | "sunset" | "forest" | "lavender" | "coral";

interface ThemeColors {
    background: string;
    backgroundSecondary: string;
    foreground: string;
    foregroundMuted: string;
    primary: string;
    primaryGradient: string;
    secondary: string;
    secondaryGradient: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    cardBg: string;
    cardBorder: string;
    inputBg: string;
    inputBorder: string;
}

interface Theme {
    name: ThemeName;
    label: string;
    emoji: string;
    colors: ThemeColors;
}

export const themes: Record<ThemeName, Theme> = {
    light: {
        name: "light",
        label: "Optimist",
        emoji: "☀️",
        colors: {
            background: "#ffffff",
            backgroundSecondary: "#f8fafc",
            foreground: "#1e293b",
            foregroundMuted: "#64748b",
            primary: "#6366f1",
            primaryGradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
            secondary: "#06b6d4",
            secondaryGradient: "linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)",
            accent: "#f59e0b",
            success: "#10b981",
            warning: "#f59e0b",
            error: "#ef4444",
            cardBg: "#ffffff",
            cardBorder: "#e2e8f0",
            inputBg: "#f1f5f9",
            inputBorder: "#cbd5e1",
        },
    },
    ocean: {
        name: "ocean",
        label: "Ocean Breeze",
        emoji: "🌊",
        colors: {
            background: "#f0f9ff",
            backgroundSecondary: "#e0f2fe",
            foreground: "#0c4a6e",
            foregroundMuted: "#0369a1",
            primary: "#0284c7",
            primaryGradient: "linear-gradient(135deg, #0284c7 0%, #06b6d4 50%, #22d3ee 100%)",
            secondary: "#14b8a6",
            secondaryGradient: "linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)",
            accent: "#f97316",
            success: "#10b981",
            warning: "#f59e0b",
            error: "#ef4444",
            cardBg: "#ffffff",
            cardBorder: "#bae6fd",
            inputBg: "#f0f9ff",
            inputBorder: "#7dd3fc",
        },
    },
    sunset: {
        name: "sunset",
        label: "Sunset Glow",
        emoji: "🌅",
        colors: {
            background: "#fffbeb",
            backgroundSecondary: "#fef3c7",
            foreground: "#78350f",
            foregroundMuted: "#92400e",
            primary: "#f59e0b",
            primaryGradient: "linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)",
            secondary: "#ec4899",
            secondaryGradient: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
            accent: "#8b5cf6",
            success: "#10b981",
            warning: "#f59e0b",
            error: "#ef4444",
            cardBg: "#ffffff",
            cardBorder: "#fcd34d",
            inputBg: "#fffbeb",
            inputBorder: "#fbbf24",
        },
    },
    forest: {
        name: "forest",
        label: "Forest Calm",
        emoji: "🌲",
        colors: {
            background: "#f0fdf4",
            backgroundSecondary: "#dcfce7",
            foreground: "#14532d",
            foregroundMuted: "#166534",
            primary: "#16a34a",
            primaryGradient: "linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%)",
            secondary: "#0d9488",
            secondaryGradient: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)",
            accent: "#eab308",
            success: "#10b981",
            warning: "#f59e0b",
            error: "#ef4444",
            cardBg: "#ffffff",
            cardBorder: "#86efac",
            inputBg: "#f0fdf4",
            inputBorder: "#4ade80",
        },
    },
    lavender: {
        name: "lavender",
        label: "Lavender Dream",
        emoji: "💜",
        colors: {
            background: "#faf5ff",
            backgroundSecondary: "#f3e8ff",
            foreground: "#581c87",
            foregroundMuted: "#7c3aed",
            primary: "#8b5cf6",
            primaryGradient: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%)",
            secondary: "#ec4899",
            secondaryGradient: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
            accent: "#06b6d4",
            success: "#10b981",
            warning: "#f59e0b",
            error: "#ef4444",
            cardBg: "#ffffff",
            cardBorder: "#d8b4fe",
            inputBg: "#faf5ff",
            inputBorder: "#c084fc",
        },
    },
    coral: {
        name: "coral",
        label: "Coral Reef",
        emoji: "🪸",
        colors: {
            background: "#fff1f2",
            backgroundSecondary: "#ffe4e6",
            foreground: "#881337",
            foregroundMuted: "#be123c",
            primary: "#f43f5e",
            primaryGradient: "linear-gradient(135deg, #f43f5e 0%, #fb7185 50%, #fda4af 100%)",
            secondary: "#f97316",
            secondaryGradient: "linear-gradient(135deg, #f97316 0%, #fb923c 100%)",
            accent: "#0ea5e9",
            success: "#10b981",
            warning: "#f59e0b",
            error: "#ef4444",
            cardBg: "#ffffff",
            cardBorder: "#fecdd3",
            inputBg: "#fff1f2",
            inputBorder: "#fda4af",
        },
    },
};

interface ThemeContextType {
    theme: Theme;
    themeName: ThemeName;
    setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [themeName, setThemeName] = useState<ThemeName>("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("lifeloop-theme") as ThemeName | null;
        if (saved && themes[saved]) {
            setThemeName(saved);
        }
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem("lifeloop-theme", themeName);

            // Apply CSS variables
            const theme = themes[themeName];
            const root = document.documentElement;
            Object.entries(theme.colors).forEach(([key, value]) => {
                root.style.setProperty(`--${key}`, value);
            });
        }
    }, [themeName, mounted]);

    const setTheme = (name: ThemeName) => {
        setThemeName(name);
    };

    return (
        <ThemeContext.Provider value={{ theme: themes[themeName], themeName, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
