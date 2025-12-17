"use client";

import { Task } from "@/types";
import { useTheme } from "@/context/ThemeContext";

interface ActivityHeatmapProps {
    tasks: Task[];
}

export default function ActivityHeatmap({ tasks }: ActivityHeatmapProps) {
    const { themeName } = useTheme();

    // Generate the last 12 weeks of data
    const generateHeatmapData = () => {
        const weeks = [];
        const today = new Date();

        for (let week = 11; week >= 0; week--) {
            const days = [];
            for (let day = 6; day >= 0; day--) {
                const date = new Date(today);
                date.setDate(date.getDate() - (week * 7 + day));

                // Count tasks completed on this date
                const dateStr = date.toISOString().split('T')[0];
                const count = tasks.filter(t => {
                    const taskDate = new Date(t.scheduledDate).toISOString().split('T')[0];
                    return taskDate === dateStr && t.status === "done";
                }).length;

                days.push({
                    date: dateStr,
                    count,
                    label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                });
            }
            weeks.push(days);
        }

        return weeks;
    };

    const heatmapData = generateHeatmapData();

    // Theme-aware colors
    const getColorForCount = (count: number): string => {
        if (count === 0) return "var(--backgroundSecondary)";

        // Different color schemes based on theme
        const colorSchemes: Record<string, string[]> = {
            midnight: [
                "rgba(99, 102, 241, 0.3)",
                "rgba(99, 102, 241, 0.5)",
                "rgba(99, 102, 241, 0.7)",
                "rgba(99, 102, 241, 0.9)",
                "#6366f1",
            ],
            sunset: [
                "rgba(251, 146, 60, 0.3)",
                "rgba(251, 146, 60, 0.5)",
                "rgba(251, 146, 60, 0.7)",
                "rgba(251, 146, 60, 0.9)",
                "#fb923c",
            ],
            forest: [
                "rgba(34, 197, 94, 0.3)",
                "rgba(34, 197, 94, 0.5)",
                "rgba(34, 197, 94, 0.7)",
                "rgba(34, 197, 94, 0.9)",
                "#22c55e",
            ],
            ocean: [
                "rgba(6, 182, 212, 0.3)",
                "rgba(6, 182, 212, 0.5)",
                "rgba(6, 182, 212, 0.7)",
                "rgba(6, 182, 212, 0.9)",
                "#06b6d4",
            ],
            lavender: [
                "rgba(139, 92, 246, 0.3)",
                "rgba(139, 92, 246, 0.5)",
                "rgba(139, 92, 246, 0.7)",
                "rgba(139, 92, 246, 0.9)",
                "#8b5cf6",
            ],
        };

        const colors = colorSchemes[themeName] || colorSchemes["midnight"];

        if (count >= 5) return colors[4];
        if (count >= 4) return colors[3];
        if (count >= 3) return colors[2];
        if (count >= 2) return colors[1];
        return colors[0];
    };

    const totalTasks = tasks.filter(t => t.status === "done").length;
    const maxCount = Math.max(...heatmapData.flat().map(d => d.count));

    return (
        <div
            className="p-5 rounded-2xl shadow-sm"
            style={{ background: "var(--cardBg)", border: "1px solid var(--cardBorder)" }}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                    <span>📊</span> Activity Heatmap
                </h3>
                <div className="text-sm" style={{ color: "var(--foregroundMuted)" }}>
                    {totalTasks} tasks completed
                </div>
            </div>

            <div className="overflow-x-auto pb-2">
                <div className="flex gap-1 min-w-max">
                    {heatmapData.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                            {week.map((day, dayIndex) => (
                                <div
                                    key={day.date}
                                    className="w-3 h-3 rounded-sm cursor-pointer transition-all hover:scale-125 hover:ring-2 hover:ring-offset-1"
                                    style={{
                                        background: getColorForCount(day.count),
                                        ringColor: "var(--primary)",
                                    }}
                                    title={`${day.label}: ${day.count} tasks`}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: "var(--cardBorder)" }}>
                <span className="text-xs" style={{ color: "var(--foregroundMuted)" }}>
                    Less
                </span>
                <div className="flex gap-1">
                    {[0, 1, 2, 3, 4, 5].map((count) => (
                        <div
                            key={count}
                            className="w-3 h-3 rounded-sm"
                            style={{ background: getColorForCount(count) }}
                        />
                    ))}
                </div>
                <span className="text-xs" style={{ color: "var(--foregroundMuted)" }}>
                    More
                </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center p-2 rounded-lg" style={{ background: "var(--backgroundSecondary)" }}>
                    <div className="text-xl font-bold" style={{ color: "var(--primary)" }}>
                        {maxCount}
                    </div>
                    <div className="text-xs" style={{ color: "var(--foregroundMuted)" }}>
                        Best Day
                    </div>
                </div>
                <div className="text-center p-2 rounded-lg" style={{ background: "var(--backgroundSecondary)" }}>
                    <div className="text-xl font-bold" style={{ color: "var(--primary)" }}>
                        {Math.round(totalTasks / 12)}
                    </div>
                    <div className="text-xs" style={{ color: "var(--foregroundMuted)" }}>
                        Week Avg
                    </div>
                </div>
                <div className="text-center p-2 rounded-lg" style={{ background: "var(--backgroundSecondary)" }}>
                    <div className="text-xl font-bold" style={{ color: "var(--primary)" }}>
                        {heatmapData.flat().filter(d => d.count > 0).length}
                    </div>
                    <div className="text-xs" style={{ color: "var(--foregroundMuted)" }}>
                        Active Days
                    </div>
                </div>
            </div>
        </div>
    );
}
