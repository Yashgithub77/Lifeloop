"use client";

import { useTheme, themes, ThemeName } from "@/context/ThemeContext";
import { useState } from "react";

interface ThemeSelectorProps {
    compact?: boolean;
}

export default function ThemeSelector({ compact = false }: ThemeSelectorProps) {
    const { themeName, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const themeList = Object.values(themes);
    const currentTheme = themes[themeName];

    if (compact) {
        return (
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:scale-105"
                    style={{
                        background: "var(--cardBg)",
                        border: "1px solid var(--cardBorder)",
                    }}
                >
                    <span className="text-lg">{currentTheme.emoji}</span>
                    <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        {currentTheme.label}
                    </span>
                    <svg
                        className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        style={{ color: "var(--foregroundMuted)" }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <div
                            className="absolute right-0 top-full mt-2 z-50 p-2 rounded-xl shadow-xl min-w-[200px]"
                            style={{
                                background: "var(--cardBg)",
                                border: "1px solid var(--cardBorder)",
                            }}
                        >
                            {themeList.map((theme) => (
                                <button
                                    key={theme.name}
                                    onClick={() => {
                                        setTheme(theme.name);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${themeName === theme.name ? "ring-2 ring-offset-2" : "hover:bg-gray-100"
                                        }`}
                                    style={{
                                        background: themeName === theme.name ? "var(--backgroundSecondary)" : undefined,
                                        ringColor: "var(--primary)",
                                    }}
                                >
                                    <span className="text-xl">{theme.emoji}</span>
                                    <div className="flex-1 text-left">
                                        <span className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>
                                            {theme.label}
                                        </span>
                                    </div>
                                    {themeName === theme.name && (
                                        <span style={{ color: "var(--primary)" }}>✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    }

    return (
        <div
            className="p-4 rounded-2xl"
            style={{
                background: "var(--cardBg)",
                border: "1px solid var(--cardBorder)",
            }}
        >
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                <span>🎨</span> Choose Theme
            </h3>
            <div className="grid grid-cols-3 gap-2">
                {themeList.map((theme) => (
                    <button
                        key={theme.name}
                        onClick={() => setTheme(theme.name)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all hover:scale-105 ${themeName === theme.name ? "ring-2 ring-offset-2" : ""
                            }`}
                        style={{
                            background: themeName === theme.name ? "var(--backgroundSecondary)" : "var(--inputBg)",
                            border: `1px solid ${themeName === theme.name ? "var(--primary)" : "var(--cardBorder)"}`,
                            ringColor: "var(--primary)",
                        }}
                    >
                        <span className="text-2xl">{theme.emoji}</span>
                        <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
                            {theme.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
