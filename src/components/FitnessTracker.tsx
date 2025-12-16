"use client";

import { FitnessData } from "@/types";

interface FitnessTrackerProps {
    data: FitnessData | null;
    onUpdateSteps?: (steps: number) => void;
}

export default function FitnessTracker({ data, onUpdateSteps }: FitnessTrackerProps) {
    // Default values - merge with data if exists to handle partial objects
    const defaultFitness = {
        steps: 0,
        stepsGoal: 5000,
        distanceKm: 0,
        activeMinutes: 0,
        caloriesBurned: 0,
        date: new Date().toISOString().split("T")[0],
    };

    const fitnessData = data ? { ...defaultFitness, ...data } : defaultFitness;

    const progress = Math.min(100, ((fitnessData.steps || 0) / (fitnessData.stepsGoal || 5000)) * 100);
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const getProgressColor = () => {
        if (progress >= 100) return "#10b981";
        if (progress >= 70) return "#06b6d4";
        if (progress >= 40) return "#f59e0b";
        return "#f43f5e";
    };

    const getGradientColors = () => {
        if (progress >= 100) return ["#10b981", "#14b8a6"];
        if (progress >= 70) return ["#06b6d4", "#0ea5e9"];
        if (progress >= 40) return ["#f59e0b", "#fb923c"];
        return ["#f43f5e", "#fb7185"];
    };

    const [startColor, endColor] = getGradientColors();

    return (
        <div
            className="p-6 rounded-2xl shadow-sm"
            style={{ background: "var(--cardBg)", border: "1px solid var(--cardBorder)" }}
        >
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                    <span className="text-2xl">🏃</span>
                    Fitness Today
                </h3>
                <div className="flex items-center gap-2 text-xs">
                    <span
                        className="px-2 py-1 rounded-full font-medium"
                        style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}
                    >
                        Google Fit ✓
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Progress Ring */}
                <div className="relative w-28 h-28 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={startColor} />
                                <stop offset="100%" stopColor={endColor} />
                            </linearGradient>
                        </defs>
                        {/* Background Circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="var(--cardBorder)"
                            strokeWidth="8"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            strokeWidth="8"
                            strokeLinecap="round"
                            stroke="url(#progressGradient)"
                            className="transition-all duration-1000 ease-out"
                            style={{
                                strokeDasharray: circumference,
                                strokeDashoffset: strokeDashoffset,
                            }}
                        />
                    </svg>
                    {/* Center Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold" style={{ color: getProgressColor() }}>
                            {Math.round(progress)}%
                        </span>
                        <span className="text-xs" style={{ color: "var(--foregroundMuted)" }}>of goal</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: "var(--foregroundMuted)" }}>Steps</span>
                        <span className="font-bold text-lg" style={{ color: "var(--foreground)" }}>
                            {fitnessData.steps.toLocaleString()}
                            <span className="font-normal text-sm" style={{ color: "var(--foregroundMuted)" }}>/{fitnessData.stepsGoal.toLocaleString()}</span>
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: "var(--foregroundMuted)" }}>Distance</span>
                        <span className="font-semibold" style={{ color: "var(--foreground)" }}>{fitnessData.distanceKm} km</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: "var(--foregroundMuted)" }}>Active</span>
                        <span className="font-semibold" style={{ color: "var(--foreground)" }}>{fitnessData.activeMinutes} min</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: "var(--foregroundMuted)" }}>Calories</span>
                        <span className="font-semibold" style={{ color: "var(--foreground)" }}>{fitnessData.caloriesBurned} kcal</span>
                    </div>
                </div>
            </div>

            {/* Motivation Message */}
            <div
                className="mt-5 p-4 rounded-xl"
                style={{ background: "var(--backgroundSecondary)" }}
            >
                <p className="text-sm" style={{ color: "var(--foreground)" }}>
                    {progress >= 100 ? (
                        <span className="flex items-center gap-2">
                            🎉 <span className="font-medium" style={{ color: "#10b981" }}>Goal achieved!</span> You&apos;ve crushed it today!
                        </span>
                    ) : progress >= 70 ? (
                        <span className="flex items-center gap-2">
                            💪 Almost there! Just {(fitnessData.stepsGoal - fitnessData.steps).toLocaleString()} more steps to go!
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            🚶 A 15-min walk adds ~1,500 steps. You&apos;ve got this!
                        </span>
                    )}
                </p>
            </div>

            {/* Quick Actions */}
            {onUpdateSteps && (
                <div className="mt-4 flex gap-2">
                    <button
                        onClick={() => onUpdateSteps(fitnessData.steps + 500)}
                        className="flex-1 px-3 py-2 text-sm rounded-lg transition-all hover:scale-105"
                        style={{ background: "var(--backgroundSecondary)", color: "var(--foreground)", border: "1px solid var(--cardBorder)" }}
                    >
                        +500
                    </button>
                    <button
                        onClick={() => onUpdateSteps(fitnessData.steps + 1000)}
                        className="flex-1 px-3 py-2 text-sm rounded-lg transition-all hover:scale-105"
                        style={{ background: "var(--backgroundSecondary)", color: "var(--foreground)", border: "1px solid var(--cardBorder)" }}
                    >
                        +1000
                    </button>
                    <button
                        onClick={() => onUpdateSteps(fitnessData.stepsGoal)}
                        className="flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-all hover:scale-105"
                        style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)" }}
                    >
                        Complete ✓
                    </button>
                </div>
            )}
        </div>
    );
}
