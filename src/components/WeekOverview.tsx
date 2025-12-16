"use client";

import { Task, Goal } from "@/types";

interface WeekOverviewProps {
    tasks: Task[];
    goals: Goal[];
}

export default function WeekOverview({ tasks, goals }: WeekOverviewProps) {
    const days = ["Today", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Get today's day name for proper labeling
    const today = new Date().getDay();
    const dayLabels = days.map((_, idx) => {
        if (idx === 0) return "Today";
        const dayIndex = (today + idx) % 7;
        return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayIndex];
    });

    // Group tasks by day
    const tasksByDay = Array.from({ length: 7 }, (_, i) => ({
        dayIndex: i,
        label: dayLabels[i],
        tasks: tasks.filter((t) => t.dayIndex === i),
    }));

    // Get goal color map
    const goalColors: Record<string, string> = {};
    goals.forEach((g) => {
        goalColors[g.id] = g.color || "#6366f1";
    });

    return (
        <div
            className="p-5 rounded-2xl shadow-sm"
            style={{ background: "var(--cardBg)", border: "1px solid var(--cardBorder)" }}
        >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                <span>📅</span> Week Overview
            </h3>

            <div className="space-y-3">
                {tasksByDay.map((day) => {
                    const completed = day.tasks.filter((t) => t.status === "done").length;
                    const total = day.tasks.length;
                    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

                    return (
                        <div key={day.dayIndex} className="flex items-center gap-3">
                            {/* Day Label */}
                            <div
                                className="w-14 text-sm font-medium flex-shrink-0"
                                style={{ color: day.dayIndex === 0 ? "var(--primary)" : "var(--foregroundMuted)" }}
                            >
                                {day.label}
                            </div>

                            {/* Progress Bar */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="flex-1 h-8 rounded-lg overflow-hidden flex items-center px-2 gap-1"
                                        style={{ background: "var(--backgroundSecondary)" }}
                                    >
                                        {day.tasks.length > 0 ? (
                                            day.tasks.slice(0, 5).map((task) => {
                                                const goalColor = goalColors[task.goalId] || "#6366f1";
                                                const statusOpacity = task.status === "done" ? "1" : task.status === "pending" ? "0.4" : "0.2";
                                                return (
                                                    <div
                                                        key={task.id}
                                                        className="h-5 rounded-md flex-1 transition-all"
                                                        style={{
                                                            background: goalColor,
                                                            opacity: statusOpacity,
                                                        }}
                                                        title={task.title}
                                                    />
                                                );
                                            })
                                        ) : (
                                            <span className="text-xs" style={{ color: "var(--foregroundMuted)" }}>No tasks</span>
                                        )}
                                        {day.tasks.length > 5 && (
                                            <span className="text-xs font-medium" style={{ color: "var(--foregroundMuted)" }}>
                                                +{day.tasks.length - 5}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="w-16 text-right">
                                <span
                                    className="text-sm font-semibold"
                                    style={{ color: progress >= 100 ? "#10b981" : progress > 0 ? "var(--primary)" : "var(--foregroundMuted)" }}
                                >
                                    {completed}/{total}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t flex flex-wrap gap-3" style={{ borderColor: "var(--cardBorder)" }}>
                {goals.slice(0, 3).map((goal) => (
                    <div key={goal.id} className="flex items-center gap-2">
                        <div
                            className="w-3 h,3 rounded-sm"
                            style={{ background: goal.color || "#6366f1", width: "12px", height: "12px" }}
                        />
                        <span className="text-xs" style={{ color: "var(--foregroundMuted)" }}>{goal.title.slice(0, 20)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
