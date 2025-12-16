"use client";

import { AgentAction } from "@/types";

interface AgentTimelineProps {
    hasReplanned: boolean;
    actions?: AgentAction[];
}

const actionConfig: Record<string, { icon: string; color: string; label: string }> = {
    generate_plan: { icon: "📝", color: "#6366f1", label: "Generated Plan" },
    analyze_behavior: { icon: "🧠", color: "#8b5cf6", label: "Analyzed Behavior" },
    replan: { icon: "🔄", color: "#f59e0b", label: "Replanned Schedule" },
    sync_calendar: { icon: "📅", color: "#3b82f6", label: "Synced Calendar" },
    sync_fitness: { icon: "💪", color: "#10b981", label: "Synced Fitness" },
    generate_insight: { icon: "💡", color: "#06b6d4", label: "Generated Insight" },
    micro_adjustment: { icon: "⚡", color: "#ec4899", label: "Suggested Adjustment" },
};

export default function AgentTimeline({ hasReplanned, actions = [] }: AgentTimelineProps) {
    // Generate default actions if none provided
    const displayActions: AgentAction[] = actions.length > 0 ? actions : [
        {
            id: "action-1",
            type: "generate_plan",
            title: "Initial Plan Generated",
            description: "Created 7-day schedule based on your goals",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: "completed",
            duration: 1200,
        },
        ...(hasReplanned ? [{
            id: "action-2",
            type: "replan" as const,
            title: "Schedule Optimized",
            description: "Analyzed progress and adjusted tomorrow's plan",
            timestamp: new Date(Date.now() - 600000).toISOString(),
            status: "completed" as const,
            duration: 800,
        }] : []),
    ];

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div
            className="p-5 rounded-2xl shadow-sm"
            style={{ background: "var(--cardBg)", border: "1px solid var(--cardBorder)" }}
        >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                <span>🤖</span> Agent Activity
            </h3>

            <div className="relative">
                {/* Timeline Line */}
                <div
                    className="absolute left-5 top-0 bottom-0 w-0.5"
                    style={{ background: "var(--cardBorder)" }}
                />

                {/* Actions */}
                <div className="space-y-4">
                    {displayActions.slice(0, 5).map((action, idx) => {
                        const config = actionConfig[action.type] || actionConfig.generate_plan;

                        return (
                            <div key={action.id} className="flex gap-4 relative">
                                {/* Icon */}
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 shadow-sm"
                                    style={{
                                        background: "var(--cardBg)",
                                        border: `2px solid ${config.color}`,
                                    }}
                                >
                                    {config.icon}
                                </div>

                                {/* Content */}
                                <div className="flex-1 pb-4">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-semibold" style={{ color: "var(--foreground)" }}>
                                            {action.title || config.label}
                                        </h4>
                                        <span className="text-xs" style={{ color: "var(--foregroundMuted)" }}>
                                            {formatTimestamp(action.timestamp)}
                                        </span>
                                    </div>
                                    <p className="text-sm" style={{ color: "var(--foregroundMuted)" }}>
                                        {action.description || `${config.label} completed successfully`}
                                    </p>
                                    {action.duration && (
                                        <span
                                            className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full"
                                            style={{ background: `${config.color}10`, color: config.color }}
                                        >
                                            ⏱️ {(action.duration / 1000).toFixed(1)}s
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {displayActions.length === 0 && (
                        <div className="text-center py-6" style={{ color: "var(--foregroundMuted)" }}>
                            <span className="text-3xl block mb-2">🤖</span>
                            <p className="text-sm">Agent is standing by...</p>
                        </div>
                    )}
                </div>
            </div>

            {displayActions.length > 5 && (
                <button
                    className="w-full mt-4 py-2 text-sm font-medium rounded-lg transition-colors"
                    style={{ background: "var(--backgroundSecondary)", color: "var(--foregroundMuted)" }}
                >
                    View all {displayActions.length} actions →
                </button>
            )}
        </div>
    );
}
