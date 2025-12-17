"use client";

import { useState, useEffect } from "react";

type BackgroundType = "lofi" | "nature" | "space" | "focus" | "none";

export default function PomodoroTimer() {
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [background, setBackground] = useState<BackgroundType>("none");
    const [sessionsCompleted, setSessionsCompleted] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive && (minutes > 0 || seconds > 0)) {
            interval = setInterval(() => {
                if (seconds === 0) {
                    if (minutes === 0) {
                        handleTimerComplete();
                    } else {
                        setMinutes(minutes - 1);
                        setSeconds(59);
                    }
                } else {
                    setSeconds(seconds - 1);
                }
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, minutes, seconds]);

    const handleTimerComplete = () => {
        setIsActive(false);

        if (!isBreak) {
            setSessionsCompleted(prev => prev + 1);
            setIsBreak(true);
            setMinutes(5);
            setSeconds(0);
            showNotification("Focus session complete! Time for a break.");
        } else {
            setIsBreak(false);
            setMinutes(25);
            setSeconds(0);
            showNotification("Break over! Ready for another session?");
        }
    };

    const showNotification = (message: string) => {
        if (" Notification" in window && Notification.permission === "granted") {
            new Notification("LifeLoop Pomodoro", { body: message });
        }
    };

    const toggleTimer = () => {
        if (!isActive && "Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission();
        }
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setIsBreak(false);
        setMinutes(25);
        setSeconds(0);
    };

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            // Enter fullscreen
            try {
                await document.documentElement.requestFullscreen();
                setIsExpanded(true);
            } catch (err) {
                console.error("Error attempting to enable fullscreen:", err);
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                await document.exitFullscreen();
                setIsExpanded(false);
            }
        }
    };

    // Listen for fullscreen changes (e.g., ESC key)
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsExpanded(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);

    const progress = isBreak
        ? ((5 * 60 - (minutes * 60 + seconds)) / (5 * 60)) * 100
        : ((25 * 60 - (minutes * 60 + seconds)) / (25 * 60)) * 100;

    const backgroundStyles = {
        lofi: {
            backgroundColor: "#667eea",
            backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%), url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80')",
            backgroundSize: "cover",
            backgroundBlendMode: "overlay" as const,
        },
        nature: {
            backgroundColor: "#0F2027",
            backgroundImage: "linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%), url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80')",
            backgroundSize: "cover",
            backgroundBlendMode: "overlay" as const,
        },
        space: {
            backgroundColor: "#000428",
            backgroundImage: "linear-gradient(135deg, #000428 0%, #004e92 100%), url('https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80')",
            backgroundSize: "cover",
            backgroundBlendMode: "overlay" as const,
        },
        focus: {
            backgroundImage: "linear-gradient(135deg, #141E30 0%, #243B55 100%)",
        },
        none: {
            backgroundColor: "var(--cardBg)",
        },
    };

    const getContainerStyle = () => {
        const baseStyle = {
            border: isExpanded ? "none" : "1px solid var(--cardBorder)",
        };

        return {
            ...baseStyle,
            ...backgroundStyles[background],
        };
    };

    return (
        <div
            className={`relative overflow-hidden transition-all ${isExpanded
                ? "fixed inset-0 z-[9999] w-screen h-screen"
                : "rounded-2xl"
                }`}
            style={getContainerStyle()}
        >
            {/* Particle animation overlay */}
            {background !== "none" && (
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="particles-container">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="particle"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 5}s`,
                                    animationDuration: `${5 + Math.random() * 10}s`,
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Content */}
            <div className={`relative z-10 flex flex-col items-center justify-center ${isExpanded ? "w-full h-full min-h-screen p-8" : "p-6"
                }`}>
                {/* Header */}
                {!isExpanded && (
                    <div className="w-full flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: background !== "none" ? "white" : "var(--foreground)" }}>
                            <span>⏱️</span> Pomodoro Timer
                        </h3>
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 rounded-lg transition-all hover:scale-110"
                            style={{ background: background !== "none" ? "rgba(255,255,255,0.2)" : "var(--backgroundSecondary)" }}
                        >
                            <span className="text-xl" style={{ color: background !== "none" ? "white" : "var(--foreground)" }}>⛶</span>
                        </button>
                    </div>
                )}

                {/* Timer Circle */}
                <div className={`relative ${isExpanded ? "w-80 h-80" : "w-64 h-64"} mb-8`}>
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            fill="none"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="8"
                        />
                        <circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            fill="none"
                            stroke={isBreak ? "#10b981" : "#6366f1"}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 45} ${2 * Math.PI * 45}`}
                            strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
                            style={{ transition: "stroke-dashoffset 1s linear" }}
                        />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div
                            className={`${isExpanded ? "text-7xl" : "text-5xl"} font-bold tabular-nums`}
                            style={{ color: background !== "none" ? "white" : (isBreak ? "#10b981" : "#6366f1") }}
                        >
                            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                        </div>
                        <div className="mt-2 text-sm font-medium" style={{ color: background !== "none" ? "rgba(255,255,255,0.8)" : "var(--foregroundMuted)" }}>
                            {isBreak ? "Break Time" : "Focus Time"}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={toggleTimer}
                        className={`${isExpanded ? "px-12 py-4 text-lg" : "px-8 py-3"} rounded-full font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg`}
                        style={{ background: isActive ? "#ef4444" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
                    >
                        {isActive ? "⏸ Pause" : "▶ Start"}
                    </button>
                    <button
                        onClick={resetTimer}
                        className={`${isExpanded ? "px-12 py-4 text-lg" : "px-8 py-3"} rounded-full font-medium transition-all hover:opacity-80`}
                        style={{
                            background: background !== "none" ? "rgba(255,255,255,0.2)" : "var(--backgroundSecondary)",
                            color: background !== "none" ? "white" : "var(--foreground)"
                        }}
                    >
                        🔄 Reset
                    </button>
                </div>

                {/* Sessions */}
                <div className="mb-6 text-center">
                    <div className="text-2xl font-bold" style={{ color: background !== "none" ? "white" : "var(--foreground)" }}>
                        {sessionsCompleted}
                    </div>
                    <div className="text-sm" style={{ color: background !== "none" ? "rgba(255,255,255,0.8)" : "var(--foregroundMuted)" }}>
                        Sessions Today
                    </div>
                </div>

                {/* Background Selection */}
                <div className="w-full max-w-md">
                    <p className="text-sm font-medium mb-3 text-center" style={{ color: background !== "none" ? "white" : "var(--foreground)" }}>
                        Choose Your Vibe
                    </p>
                    <div className="flex gap-2 justify-center flex-wrap">
                        {([
                            { id: "none" as BackgroundType, label: "None", emoji: "🚫" },
                            { id: "lofi" as BackgroundType, label: "Lo-Fi Cafe", emoji: "☕" },
                            { id: "nature" as BackgroundType, label: "Nature", emoji: "🌲" },
                            { id: "space" as BackgroundType, label: "Deep Space", emoji: "🌌" },
                            { id: "focus" as BackgroundType, label: "Deep Focus", emoji: "🎯" },
                        ]).map((bg) => (
                            <button
                                key={bg.id}
                                onClick={() => setBackground(bg.id)}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 whitespace-nowrap"
                                style={{
                                    background: background === bg.id ? "#6366f1" : background !== "none" ? "rgba(255,255,255,0.15)" : "var(--backgroundSecondary)",
                                    color: (background === bg.id || background !== "none") ? "white" : "var(--foreground)",
                                    border: background === bg.id ? "2px solid white" : "2px solid transparent",
                                }}
                            >
                                {bg.emoji} {bg.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Exit Expanded */}
                {isExpanded && (
                    <button
                        onClick={toggleFullscreen}
                        className="mt-8 px-6 py-3 rounded-full backdrop-blur-sm hover:scale-105 transition-all"
                        style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
                    >
                        ✕ Exit Focus Mode (or press ESC)
                    </button>
                )}
            </div>

            {/* Styles */}
            <style jsx>{`
                .particles-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                }
                .particle {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: white;
                    border-radius: 50%;
                    animation: float linear infinite;
                    opacity: 0.6;
                }
                @keyframes float {
                    0% {
                        transform: translateY(100vh) translateX(0);
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.6;
                    }
                    90% {
                        opacity: 0.6;
                    }
                    100% {
                        transform: translateY(-10vh) translateX(50px);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
}
