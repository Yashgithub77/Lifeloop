"use client";

import { useEffect, useState } from "react";

interface MoodEmojiProps {
    completionPercent: number;
    size?: "sm" | "md" | "lg" | "xl";
}

export default function MoodEmoji({ completionPercent, size = "lg" }: MoodEmojiProps) {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 500);
        return () => clearTimeout(timer);
    }, [completionPercent]);

    // Determine mood based on completion
    const getMoodData = () => {
        if (completionPercent >= 100) {
            return {
                emoji: "🤩",
                label: "Amazing!",
                message: "You've completed everything!",
                bgColor: "from-amber-400 to-yellow-300",
                glow: "shadow-yellow-400/50",
            };
        }
        if (completionPercent >= 80) {
            return {
                emoji: "😄",
                label: "Fantastic!",
                message: "Almost there, keep going!",
                bgColor: "from-emerald-400 to-green-300",
                glow: "shadow-emerald-400/50",
            };
        }
        if (completionPercent >= 60) {
            return {
                emoji: "😊",
                label: "Great!",
                message: "You're doing wonderfully!",
                bgColor: "from-cyan-400 to-blue-300",
                glow: "shadow-cyan-400/50",
            };
        }
        if (completionPercent >= 40) {
            return {
                emoji: "🙂",
                label: "Good",
                message: "Making progress!",
                bgColor: "from-violet-400 to-purple-300",
                glow: "shadow-violet-400/50",
            };
        }
        if (completionPercent >= 20) {
            return {
                emoji: "😐",
                label: "Getting started",
                message: "You can do this!",
                bgColor: "from-orange-400 to-amber-300",
                glow: "shadow-orange-400/50",
            };
        }
        return {
            emoji: "😴",
            label: "Just beginning",
            message: "Let's get moving!",
            bgColor: "from-slate-400 to-gray-300",
            glow: "shadow-slate-400/50",
        };
    };

    const mood = getMoodData();

    const sizeClasses = {
        sm: "w-12 h-12 text-2xl",
        md: "w-16 h-16 text-3xl",
        lg: "w-24 h-24 text-5xl",
        xl: "w-32 h-32 text-6xl",
    };

    const containerSizes = {
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
        xl: "p-8",
    };

    return (
        <div className={`flex flex-col items-center gap-3 ${containerSizes[size]}`}>
            {/* Emoji Circle */}
            <div className="relative">
                {/* Glow effect */}
                <div
                    className={`absolute inset-0 rounded-full bg-gradient-to-r ${mood.bgColor} blur-xl opacity-50 ${mood.glow}`}
                />

                {/* Main emoji container */}
                <div
                    className={`relative ${sizeClasses[size]} rounded-full bg-gradient-to-br ${mood.bgColor} flex items-center justify-center shadow-lg ${isAnimating ? "animate-bounce" : ""
                        } transition-all duration-300`}
                >
                    <span
                        className={`${isAnimating ? "scale-125" : "scale-100"} transition-transform duration-300`}
                    >
                        {mood.emoji}
                    </span>
                </div>

                {/* Sparkles for high completion */}
                {completionPercent >= 80 && (
                    <>
                        <span className="absolute -top-1 -right-1 text-lg animate-pulse">✨</span>
                        <span className="absolute -bottom-1 -left-1 text-lg animate-pulse delay-150">✨</span>
                    </>
                )}
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-[120px]">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-gradient-to-r ${mood.bgColor} transition-all duration-500 ease-out`}
                        style={{ width: `${Math.min(100, completionPercent)}%` }}
                    />
                </div>
                <div className="flex justify-between mt-1 text-xs">
                    <span className="text-gray-500">{Math.round(completionPercent)}%</span>
                    <span className="font-medium" style={{ color: "var(--primary)" }}>{mood.label}</span>
                </div>
            </div>

            {/* Message */}
            <p className="text-sm text-center" style={{ color: "var(--foregroundMuted)" }}>
                {mood.message}
            </p>
        </div>
    );
}
