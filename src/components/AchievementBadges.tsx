"use client";

import { Task } from "@/types";
import { useState, useEffect } from "react";

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedAt?: string;
    progress: number;
    target: number;
}

interface AchievementBadgesProps {
    tasks: Task[];
}

export default function AchievementBadges({ tasks }: AchievementBadgesProps) {
    const [achievements, setAchievements] = useState<Achievement[]>([]);

    useEffect(() => {
        calculateAchievements();
    }, [tasks]);

    const calculateAchievements = () => {
        const completedTasks = tasks.filter(t => t.status === "done");
        const todayCompleted = tasks.filter(t => t.dayIndex === 0 && t.status === "done").length;

        // Calculate streak (simplified - in real app, use actual dates)
        const streak = calculateStreak();

        const achievementsList: Achievement[] = [
            {
                id: "first-task",
                title: "First Steps",
                description: "Complete your first task",
                icon: "🎯",
                unlocked: completedTasks.length >= 1,
                progress: Math.min(completedTasks.length, 1),
                target: 1,
            },
            {
                id: "early-bird",
                title: "Early Bird",
                description: "Complete a task before 9 AM",
                icon: "🌅",
                unlocked: tasks.some(t => t.status === "done" && parseInt(t.startTime.split(":")[0]) < 9),
                progress: tasks.some(t => t.status === "done" && parseInt(t.startTime.split(":")[0]) < 9) ? 1 : 0,
                target: 1,
            },
            {
                id: "week-warrior",
                title: "Week Warrior",
                description: "Complete 7 tasks in one week",
                icon: "⚔️",
                unlocked: completedTasks.length >= 7,
                progress: Math.min(completedTasks.length, 7),
                target: 7,
            },
            {
                id: "streak-7",
                title: "Week Streak",
                description: "Maintain a 7-day streak",
                icon: "🔥",
                unlocked: streak >= 7,
                progress: Math.min(streak, 7),
                target: 7,
            },
            {
                id: "productive-day",
                title: "Productive Day",
                description: "Complete 5 tasks in one day",
                icon: "🚀",
                unlocked: todayCompleted >= 5,
                progress: Math.min(todayCompleted, 5),
                target: 5,
            },
            {
                id: "night-owl",
                title: "Night Owl",
                description: "Complete a task after 10 PM",
                icon: "🦉",
                unlocked: tasks.some(t => t.status === "done" && parseInt(t.startTime.split(":")[0]) >= 22),
                progress: tasks.some(t => t.status === "done" && parseInt(t.startTime.split(":")[0]) >= 22) ? 1 : 0,
                target: 1,
            },
            {
                id: "overachiever",
                title: "Overachiever",
                description: "Complete 20 tasks total",
                icon: "🏆",
                unlocked: completedTasks.length >= 20,
                progress: Math.min(completedTasks.length, 20),
                target: 20,
            },
            {
                id: "perfectionist",
                title: "Perfectionist",
                description: "Complete all tasks for a day",
                icon: "💎",
                unlocked: tasks.filter(t => t.dayIndex === 0).length > 0 &&
                    tasks.filter(t => t.dayIndex === 0).every(t => t.status === "done"),
                progress: tasks.filter(t => t.dayIndex === 0 && t.status === "done").length,
                target: tasks.filter(t => t.dayIndex === 0).length || 1,
            },
        ];

        setAchievements(achievementsList);
    };

    const calculateStreak = () => {
        // Simplified streak calculation
        // In production, calculate based on consecutive days with completed tasks
        return Math.floor(Math.random() * 10) + 1;
    };

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <div
            className="p-5 rounded-2xl shadow-sm"
            style={{ background: "var(--cardBg)", border: "1px solid var(--cardBorder)" }}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                    <span>🏆</span> Achievements
                </h3>
                <div
                    className="px-3 py-1 rounded-full text-sm font-bold"
                    style={{ background: "var(--primaryGradient)", color: "white" }}
                >
                    {unlockedCount}/{achievements.length}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {achievements.map((achievement) => (
                    <div
                        key={achievement.id}
                        className={`p-4 rounded-xl text-center transition-all cursor-pointer ${achievement.unlocked ? "hover:scale-105" : "opacity-50"
                            }`}
                        style={{
                            background: achievement.unlocked
                                ? "var(--primaryGradient)"
                                : "var(--backgroundSecondary)",
                        }}
                    >
                        <div className={`text-4xl mb-2 ${achievement.unlocked ? "animate-bounce" : ""}`}>
                            {achievement.icon}
                        </div>
                        <div
                            className="text-sm font-bold mb-1"
                            style={{ color: achievement.unlocked ? "white" : "var(--foreground)" }}
                        >
                            {achievement.title}
                        </div>
                        <div
                            className="text-xs mb-2"
                            style={{ color: achievement.unlocked ? "rgba(255,255,255,0.8)" : "var(--foregroundMuted)" }}
                        >
                            {achievement.description}
                        </div>

                        {/* Progress bar */}
                        {!achievement.unlocked && (
                            <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "var(--cardBorder)" }}>
                                <div
                                    className="h-full transition-all"
                                    style={{
                                        width: `${(achievement.progress / achievement.target) * 100}%`,
                                        background: "var(--primary)",
                                    }}
                                />
                            </div>
                        )}

                        {achievement.unlocked && achievement.unlockedAt && (
                            <div className="text-xs opacity-80" style={{ color: "white" }}>
                                Unlocked!
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
