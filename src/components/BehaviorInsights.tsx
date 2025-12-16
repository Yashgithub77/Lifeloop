"use client";

import { BehaviorPattern, DailyInsight } from "@/types";

interface BehaviorInsightsProps {
    patterns: BehaviorPattern[];
    insight: DailyInsight | null;
    recommendations?: string[];
}

const patternConfig: Record<string, { icon: string; color: string; bg: string }> = {
    productivity_peak: { icon: "📈", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
    low_energy: { icon: "😴", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" },
    skip_pattern: { icon: "⚠️", color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" },
    streak: { icon: "🔥", color: "#f97316", bg: "rgba(249, 115, 22, 0.1)" },
    focus_champion: { icon: "🏆", color: "#6366f1", bg: "rgba(99, 102, 241, 0.1)" },
};

const moodEmojis: Record<string, string> = {
    great: "😄",
    good: "🙂",
    okay: "😐",
    low: "😔",
};

const energyBars: Record<string, number> = {
    high: 100,
    medium: 66,
    low: 33,
};

export default function BehaviorInsights({ patterns, insight, recommendations = [] }: BehaviorInsightsProps) {
    return (
        <div
            className="p-5 rounded-2xl shadow-sm"
            style={{ background: "var(--cardBg)", border: "1px solid var(--cardBorder)" }}
        >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                <span>🧠</span> Behavior Insights
            </h3>

            {/* Daily Snapshot */}
            {insight && (
                <div
                    className="p-4 rounded-xl mb-4"
                    style={{ background: "var(--backgroundSecondary)" }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold" style={{ color: "var(--foreground)" }}>Today&apos;s Snapshot</h4>
                        <span className="text-2xl">{moodEmojis[insight.mood] || "🙂"}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Completion */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span style={{ color: "var(--foregroundMuted)" }}>Completion</span>
                                <span className="font-semibold" style={{ color: "var(--foreground)" }}>{insight.completionRate}%</span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--cardBorder)" }}>
                                <div
                                    className="h-full rounded-full transition-all bg-gradient-to-r from-indigo-500 to-violet-500"
                                    style={{ width: `${insight.completionRate}%` }}
                                />
                            </div>
                        </div>

                        {/* Energy */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span style={{ color: "var(--foregroundMuted)" }}>Energy</span>
                                <span className="font-semibold capitalize" style={{ color: "var(--foreground)" }}>{insight.energyLevel}</span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--cardBorder)" }}>
                                <div
                                    className="h-full rounded-full transition-all bg-gradient-to-r from-emerald-500 to-teal-500"
                                    style={{ width: `${energyBars[insight.energyLevel] || 50}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 text-sm" style={{ color: "var(--foregroundMuted)" }}>
                        <span className="flex items-center gap-1">
                            <span>✅</span> {insight.tasksCompleted} tasks
                        </span>
                        <span className="flex items-center gap-1">
                            <span>🔥</span> {insight.streakDays} day streak
                        </span>
                        <span className="flex items-center gap-1">
                            <span>⏱️</span> {insight.focusMinutes} min focus
                        </span>
                    </div>
                </div>
            )}

            {/* Patterns */}
            {patterns.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>
                        Detected Patterns
                    </h4>
                    <div className="space-y-2">
                        {patterns.slice(0, 3).map((pattern) => {
                            const config = patternConfig[pattern.type] || patternConfig.productivity_peak;
                            return (
                                <div
                                    key={pattern.id}
                                    className="flex items-center gap-3 p-3 rounded-lg"
                                    style={{ background: config.bg }}
                                >
                                    <span className="text-xl">{config.icon}</span>
                                    <div className="flex-1">
                                        <span className="font-medium" style={{ color: "var(--foreground)" }}>{pattern.title}</span>
                                        <p className="text-xs" style={{ color: "var(--foregroundMuted)" }}>{pattern.description}</p>
                                    </div>
                                    <span
                                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                                        style={{ background: `${config.color}20`, color: config.color }}
                                    >
                                        {Math.round(pattern.confidence * 100)}% confident
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>
                        💡 Recommendations
                    </h4>
                    <div className="space-y-2">
                        {recommendations.map((rec, idx) => (
                            <div
                                key={idx}
                                className="flex items-start gap-2 p-3 rounded-lg"
                                style={{ background: "var(--backgroundSecondary)" }}
                            >
                                <span style={{ color: "var(--primary)" }}>→</span>
                                <span className="text-sm" style={{ color: "var(--foreground)" }}>{rec}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {patterns.length === 0 && !insight && recommendations.length === 0 && (
                <div className="text-center py-6" style={{ color: "var(--foregroundMuted)" }}>
                    <span className="text-3xl block mb-2">🧠</span>
                    <p className="text-sm">Complete more tasks and the agent will analyze your patterns!</p>
                </div>
            )}
        </div>
    );
}
