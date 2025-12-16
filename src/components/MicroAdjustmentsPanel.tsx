"use client";

import { MicroAdjustment } from "@/types";

interface MicroAdjustmentsPanelProps {
    adjustments: MicroAdjustment[];
    onApply?: (adjustmentId: string) => void;
    onDismiss?: (adjustmentId: string) => void;
}

const typeConfig: Record<string, { icon: string; color: string; bg: string }> = {
    shorten_session: { icon: "⏱️", color: "#6366f1", bg: "rgba(99, 102, 241, 0.1)" },
    add_break: { icon: "☕", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" },
    reschedule: { icon: "📅", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" },
    reduce_difficulty: { icon: "🎯", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
    motivational: { icon: "💪", color: "#ec4899", bg: "rgba(236, 72, 153, 0.1)" },
};

const impactConfig = {
    low: { label: "Low impact", color: "#10b981" },
    medium: { label: "Medium impact", color: "#f59e0b" },
    high: { label: "High impact", color: "#6366f1" },
};

export default function MicroAdjustmentsPanel({ adjustments, onApply, onDismiss }: MicroAdjustmentsPanelProps) {
    const pendingAdjustments = adjustments.filter((a) => !a.applied);
    const appliedAdjustments = adjustments.filter((a) => a.applied);

    if (adjustments.length === 0) {
        return (
            <div
                className="p-6 rounded-2xl text-center shadow-sm"
                style={{ background: "var(--cardBg)", border: "1px solid var(--cardBorder)" }}
            >
                <span className="text-4xl block mb-3">⚡</span>
                <h3 className="font-bold mb-1" style={{ color: "var(--foreground)" }}>No Adjustments Yet</h3>
                <p className="text-sm" style={{ color: "var(--foregroundMuted)" }}>
                    Complete your daily tasks and the agent will suggest optimizations.
                </p>
            </div>
        );
    }

    return (
        <div
            className="p-5 rounded-2xl shadow-sm"
            style={{ background: "var(--cardBg)", border: "1px solid var(--cardBorder)" }}
        >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                <span>⚡</span> AI Suggestions
                {pendingAdjustments.length > 0 && (
                    <span
                        className="ml-auto text-xs font-medium px-2 py-1 rounded-full"
                        style={{ background: "rgba(99, 102, 241, 0.1)", color: "#6366f1" }}
                    >
                        {pendingAdjustments.length} new
                    </span>
                )}
            </h3>

            <div className="space-y-3">
                {pendingAdjustments.map((adj) => {
                    const config = typeConfig[adj.type] || typeConfig.motivational;
                    const impact = impactConfig[adj.impact];

                    return (
                        <div
                            key={adj.id}
                            className="p-4 rounded-xl transition-all card-hover"
                            style={{ background: config.bg, border: `1px solid ${config.color}20` }}
                        >
                            <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                                    style={{ background: "var(--cardBg)" }}
                                >
                                    {config.icon}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                                        {adj.title}
                                    </h4>
                                    <p className="text-sm mb-2" style={{ color: "var(--foregroundMuted)" }}>
                                        {adj.description}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="text-xs px-2 py-0.5 rounded-full"
                                            style={{ background: `${impact.color}15`, color: impact.color }}
                                        >
                                            {impact.label}
                                        </span>
                                        {adj.reason && (
                                            <span className="text-xs" style={{ color: "var(--foregroundMuted)" }}>
                                                💡 {adj.reason}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    {onApply && (
                                        <button
                                            onClick={() => onApply(adj.id)}
                                            className="px-3 py-1.5 text-sm font-medium rounded-lg text-white transition-all hover:scale-105"
                                            style={{ background: config.color }}
                                        >
                                            Apply
                                        </button>
                                    )}
                                    {onDismiss && (
                                        <button
                                            onClick={() => onDismiss(adj.id)}
                                            className="px-3 py-1.5 text-sm rounded-lg transition-colors"
                                            style={{ background: "var(--backgroundSecondary)", color: "var(--foregroundMuted)" }}
                                        >
                                            Dismiss
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Applied Adjustments */}
                {appliedAdjustments.length > 0 && (
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--cardBorder)" }}>
                        <h4 className="text-sm font-medium mb-3" style={{ color: "var(--foregroundMuted)" }}>
                            Recently Applied
                        </h4>
                        <div className="space-y-2">
                            {appliedAdjustments.slice(0, 2).map((adj) => {
                                const config = typeConfig[adj.type] || typeConfig.motivational;
                                return (
                                    <div
                                        key={adj.id}
                                        className="flex items-center gap-2 text-sm p-2 rounded-lg"
                                        style={{ background: "var(--backgroundSecondary)" }}
                                    >
                                        <span>{config.icon}</span>
                                        <span style={{ color: "var(--foreground)" }}>{adj.title}</span>
                                        <span className="ml-auto text-xs" style={{ color: "#10b981" }}>✓ Applied</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
