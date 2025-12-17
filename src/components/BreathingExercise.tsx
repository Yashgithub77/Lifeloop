"use client";

import { useState, useEffect } from "react";

export default function BreathingExercise() {
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
    const [count, setCount] = useState(4);
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [totalMinutes, setTotalMinutes] = useState(0);
    const [plantGrowth, setPlantGrowth] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            setCount((prev) => {
                if (prev > 1) return prev - 1;

                // Move to next phase
                if (phase === "inhale") {
                    setPhase("hold");
                    return 4;
                } else if (phase === "hold") {
                    setPhase("exhale");
                    return 4;
                } else {
                    setPhase("inhale");
                    setSessionsCompleted((prev) => prev + 1);
                    setPlantGrowth((prev) => Math.min(prev + 2, 100));
                    return 4;
                }
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, phase]);

    useEffect(() => {
        // Track total time
        if (isActive) {
            const timer = setInterval(() => {
                setTotalMinutes((prev) => prev + 1 / 60);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isActive]);

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            try {
                await document.documentElement.requestFullscreen();
                setIsExpanded(true);
            } catch (err) {
                console.error("Error attempting to enable fullscreen:", err);
            }
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
                setIsExpanded(false);
            }
        }
    };

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsExpanded(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);

    const circleScale = phase === "inhale" ? 1.5 : phase === "hold" ? 1.5 : 0.7;

    return (
        <div
            className={`relative overflow-hidden ${isExpanded ? "fixed inset-0 z-[9999] w-screen h-screen" : "rounded-2xl"}`}
            style={{
                background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                minHeight: isExpanded ? "100vh" : "500px",
            }}
        >
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-20">
                <div
                    className="absolute top-0 left-0 w-full h-full"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23fff' fill-opacity='0.1'/%3E%3C/svg%3E")`,
                        animation: "float 20s linear infinite",
                    }}
                />
            </div>

            {/* Content */}
            <div className={`relative z-10 ${isExpanded ? "h-screen" : "p-8"} flex flex-col items-center justify-center min-h-[500px]`}>
                <div className="flex items-center justify-between w-full max-w-2xl mb-6">
                    <div>
                        <h3 className={`${isExpanded ? "text-4xl" : "text-2xl"} font-bold text-white mb-2`}>Mindful Breathing</h3>
                        <p className="text-white/80 text-sm">Find your calm, nurture your mind</p>
                    </div>
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 rounded-lg hover:scale-110 transition-all"
                        style={{ background: "rgba(255,255,255,0.2)" }}
                    >
                        <span className="text-xl text-white">{isExpanded ? "✕" : "⛶"}</span>
                    </button>
                </div>

                {/* Breathing Circle */}
                <div className="relative w-64 h-64 mb-8">
                    <div
                        className="absolute inset-0 rounded-full transition-all duration-1000 ease-in-out"
                        style={{
                            background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)",
                            transform: `scale(${circleScale})`,
                            boxShadow: "0 0 60px rgba(255,255,255,0.4)",
                        }}
                    />

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-6xl font-bold text-white mb-2">{count}</div>
                        <div className="text-xl font-medium text-white/90 capitalize">{phase}</div>
                    </div>
                </div>

                {/* Controls */}
                <button
                    onClick={() => setIsActive(!isActive)}
                    className="px-12 py-4 rounded-full text-lg font-bold text-purple-600 bg-white hover:bg-opacity-90 transition-all mb-8"
                >
                    {isActive ? "⏸ Pause" : "▶ Start"}
                </button>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-6 w-full max-w-md mb-8">
                    <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur">
                        <div className="text-3xl font-bold text-white">{sessionsCompleted}</div>
                        <div className="text-sm text-white/80">Breath Cycles</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur">
                        <div className="text-3xl font-bold text-white">{Math.floor(totalMinutes)}</div>
                        <div className="text-sm text-white/80">Minutes</div>
                    </div>
                </div>

                {/* Growing Plant Visualization */}
                <div className="w-full max-w-md">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-medium">Your Mindfulness Garden</p>
                        <p className="text-white/80 text-sm">{Math.round(plantGrowth)}%</p>
                    </div>

                    {/* Plant Container */}
                    <div className="h-32 rounded-xl bg-white/10 backdrop-blur p-4 relative overflow-hidden">
                        {/* Soil */}
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-brown-600/50 to-transparent" />

                        {/* Plant that grows */}
                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-1000">
                            {/* Stem */}
                            <div
                                className="w-2 bg-green-600 rounded-t-full mx-auto transition-all duration-1000"
                                style={{ height: `${plantGrowth * 0.8}px` }}
                            />

                            {/* Leaves */}
                            {plantGrowth > 20 && (
                                <div className="relative">
                                    <div className="absolute -left-6 top-4 text-2xl animate-bounce">🌿</div>
                                    <div className="absolute -right-6 top-4 text-2xl animate-bounce" style={{ animationDelay: "0.2s" }}>🌿</div>
                                </div>
                            )}

                            {/* Flower */}
                            {plantGrowth > 60 && (
                                <div className="text-4xl absolute -top-6 left-1/2 transform -translate-x-1/2 animate-pulse">
                                    🌸
                                </div>
                            )}
                        </div>
                    </div>

                    <p className="text-white/60 text-xs text-center mt-2">
                        {plantGrowth < 30 && "Keep breathing to help your plant grow..."}
                        {plantGrowth >= 30 && plantGrowth < 70 && "Your plant is growing nicely!"}
                        {plantGrowth >= 70 && "Beautiful! Your mindfulness garden is blooming!"}
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
