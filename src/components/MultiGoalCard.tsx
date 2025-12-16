"use client";

import { Goal } from "@/types";

interface MultiGoalCardProps {
    goals: Goal[];
}

const categoryStyles: Record<string, { gradient: string; icon: string }> = {
    Study: { gradient: "from-indigo-500 to-violet-500", icon: "📚" },
    Fitness: { gradient: "from-emerald-500 to-teal-500", icon: "💪" },
    Health: { gradient: "from-rose-500 to-pink-500", icon: "❤️" },
    Project: { gradient: "from-amber-500 to-orange-500", icon: "🚀" },
    Career: { gradient: "from-cyan-500 to-blue-500", icon: "💼" },
    Personal: { gradient: "from-purple-500 to-indigo-500", icon: "🌟" },
};

const priorityConfig = {
    high: { bg: "rgba(239, 68, 68, 0.1)", color: "#ef4444", label: "High" },
    medium: { bg: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", label: "Medium" },
    low: { bg: "rgba(16, 185, 129, 0.1)", color: "#10b981", label: "Low" },
};

export default function MultiGoalCard({ goals }: MultiGoalCardProps) {
    if (!goals || goals.length === 0) {
        return (
            <div
                className="p-8 rounded-2xl text-center shadow-sm"
                style={{ background: "var(--cardBg)", border: "1px solid var(--cardBorder)" }}
            >
                <span className="text-4xl mb-3 block">🎯</span>
                <p style={{ color: "var(--foregroundMuted)" }}>No goals set yet. Start by creating one!</p>
            </div>
        );
    }

    return (
        <div
            className="p-5 rounded-2xl shadow-sm"
            style={{ background: "var(--cardBg)", border: "1px solid var(--cardBorder)" }}
        >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                <span>🎯</span> Your Goals
                <span
                    className="ml-auto text-sm font-normal px-2 py-1 rounded-full"
                    style={{ background: "var(--backgroundSecondary)", color: "var(--foregroundMuted)" }}
                >
                    {goals.length} active
                </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map((goal) => {
                    const style = categoryStyles[goal.category] || categoryStyles.Personal;
                    const priority = priorityConfig[goal.priority];
                    const progress = goal.targetValue
                        ? Math.min(100, Math.round(((goal.currentValue ?? 0) / goal.targetValue) * 100))
                        : 0;

                    return (
                        <div
                            key={goal.id}
                            className="p-4 rounded-xl transition-all card-hover"
                            style={{ background: "var(--backgroundSecondary)", border: "1px solid var(--cardBorder)" }}
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div
                                    className={`w-14 h-14 rounded-xl bg-gradient-to-r ${style.gradient} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}
                                >
                                    {style.icon}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h4 className="font-semibold line-clamp-1" style={{ color: "var(--foreground)" }}>
                                            {goal.title}
                                        </h4>
                                        <span
                                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                                            style={{ background: priority.bg, color: priority.color }}
                                        >
                                            {priority.label}
                                        </span>
                                    </div>

                                    <p className="text-sm mb-3 line-clamp-1" style={{ color: "var(--foregroundMuted)" }}>
                                        {goal.description}
                                    </p>

                                    {/* Progress Bar */}
                                    {goal.targetValue && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center text-xs">
                                                <span style={{ color: "var(--foregroundMuted)" }}>
                                                    {(goal.currentValue ?? 0).toLocaleString()} / {goal.targetValue.toLocaleString()} {goal.unit}
                                                </span>
                                                <span
                                                    className="font-semibold"
                                                    style={{ color: progress >= 100 ? "#10b981" : "var(--primary)" }}
                                                >
                                                    {progress}%
                                                </span>
                                            </div>
                                            <div
                                                className="h-2 rounded-full overflow-hidden"
                                                style={{ background: "var(--cardBorder)" }}
                                            >
                                                <div
                                                    className={`h-full rounded-full bg-gradient-to-r ${style.gradient} transition-all duration-500`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Meta Info */}
                                    <div className="flex items-center gap-3 mt-3 text-xs" style={{ color: "var(--foregroundMuted)" }}>
                                        <span>📅 {goal.targetWeeks} weeks</span>
                                        {goal.deadline && (
                                            <span>⏰ Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                                        )}
                                        {goal.isRecurring && (
                                            <span className="flex items-center gap-1">
                                                <span>🔄</span> Daily
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
