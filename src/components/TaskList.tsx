"use client";

import { Task, Goal } from "@/types";

interface TaskListProps {
    tasks: Task[];
    onStatusChange?: (taskId: string, status: Task["status"]) => void;
    compact?: boolean;
}

const statusConfig = {
    pending: { bg: "var(--backgroundSecondary)", border: "var(--cardBorder)", textColor: "var(--foregroundMuted)", icon: "○" },
    in_progress: { bg: "rgba(59, 130, 246, 0.1)", border: "rgba(59, 130, 246, 0.3)", textColor: "#3b82f6", icon: "◐" },
    done: { bg: "rgba(16, 185, 129, 0.1)", border: "rgba(16, 185, 129, 0.3)", textColor: "#10b981", icon: "✓" },
    skipped: { bg: "rgba(100, 116, 139, 0.1)", border: "rgba(100, 116, 139, 0.2)", textColor: "#64748b", icon: "⊘" },
    rescheduled: { bg: "rgba(245, 158, 11, 0.1)", border: "rgba(245, 158, 11, 0.3)", textColor: "#f59e0b", icon: "↻" },
};

const difficultyBadge = {
    easy: { bg: "rgba(16, 185, 129, 0.1)", color: "#10b981", border: "rgba(16, 185, 129, 0.3)" },
    medium: { bg: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", border: "rgba(245, 158, 11, 0.3)" },
    hard: { bg: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "rgba(239, 68, 68, 0.3)" },
};

export default function TaskList({ tasks, onStatusChange, compact = false }: TaskListProps) {
    if (tasks.length === 0) {
        return (
            <div className="text-center py-8" style={{ color: "var(--foregroundMuted)" }}>
                <span className="text-4xl mb-3 block">📋</span>
                <p>No tasks scheduled for today</p>
            </div>
        );
    }

    const handleStatusToggle = (task: Task) => {
        if (!onStatusChange) return;

        const newStatus: Task["status"] =
            task.status === "pending" ? "in_progress" :
                task.status === "in_progress" ? "done" :
                    task.status === "done" ? "pending" : task.status;

        onStatusChange(task.id, newStatus);
    };

    const handleQuickAction = (taskId: string, status: Task["status"]) => {
        if (onStatusChange) {
            onStatusChange(taskId, status);
        }
    };

    return (
        <div className="space-y-3">
            {tasks.map((task) => {
                const config = statusConfig[task.status];
                const isDone = task.status === "done";
                const isSkipped = task.status === "skipped";
                const difficulty = difficultyBadge[task.difficulty];

                return (
                    <div
                        key={task.id}
                        className={`group p-4 rounded-xl transition-all duration-300 ${isDone || isSkipped ? "opacity-70" : "hover:shadow-md hover:scale-[1.01]"
                            }`}
                        style={{
                            background: config.bg,
                            border: `1px solid ${config.border}`,
                        }}
                    >
                        <div className="flex items-start gap-4">
                            {/* Status Button */}
                            <button
                                onClick={() => handleStatusToggle(task)}
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold transition-all shadow-sm"
                                style={{
                                    background: isDone ? "#10b981" : task.status === "in_progress" ? "#3b82f6" : "var(--cardBg)",
                                    color: isDone || task.status === "in_progress" ? "white" : config.textColor,
                                    border: isDone || task.status === "in_progress" ? "none" : "1px solid var(--cardBorder)",
                                }}
                            >
                                {config.icon}
                            </button>

                            {/* Task Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h4
                                        className={`font-semibold ${isDone ? "line-through" : ""}`}
                                        style={{ color: isDone ? "var(--foregroundMuted)" : "var(--foreground)" }}
                                    >
                                        {task.title}
                                    </h4>
                                    {task.difficulty && (
                                        <span
                                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                                            style={{ background: difficulty.bg, color: difficulty.color, border: `1px solid ${difficulty.border}` }}
                                        >
                                            {task.difficulty}
                                        </span>
                                    )}
                                </div>

                                {!compact && (
                                    <p className="text-sm mb-2" style={{ color: isDone ? "var(--foregroundMuted)" : "var(--foregroundMuted)" }}>
                                        {task.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 text-xs" style={{ color: "var(--foregroundMuted)" }}>
                                    <span className="flex items-center gap-1">
                                        <span>🕐</span>
                                        {task.startTime}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span>⏱️</span>
                                        {task.estimatedMinutes} min
                                    </span>
                                    {task.actualMinutes && (
                                        <span className="flex items-center gap-1" style={{ color: "#10b981" }}>
                                            <span>✓</span>
                                            Actual: {task.actualMinutes} min
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {task.status !== "done" && (
                                    <button
                                        onClick={() => handleQuickAction(task.id, "done")}
                                        className="p-2 rounded-lg transition-colors"
                                        style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}
                                        title="Mark as done"
                                    >
                                        ✓
                                    </button>
                                )}
                                {task.status !== "skipped" && task.status !== "done" && (
                                    <button
                                        onClick={() => handleQuickAction(task.id, "skipped")}
                                        className="p-2 rounded-lg transition-colors"
                                        style={{ background: "var(--backgroundSecondary)", color: "var(--foregroundMuted)" }}
                                        title="Skip task"
                                    >
                                        ⊘
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
