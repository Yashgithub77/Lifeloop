"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Goal, Task, ReasoningStep, MicroAdjustment, BehaviorPattern, DailyInsight, FitnessData, Integration, CalendarEvent, AgentAction, CoachMessage } from "@/types";
import TaskList from "@/components/TaskList";
import WeekOverview from "@/components/WeekOverview";
import AgentTimeline from "@/components/AgentTimeline";
import MultiGoalCard from "@/components/MultiGoalCard";
import FitnessTracker from "@/components/FitnessTracker";
import MicroAdjustmentsPanel from "@/components/MicroAdjustmentsPanel";
import BehaviorInsights from "@/components/BehaviorInsights";
import MoodEmoji from "@/components/MoodEmoji";
import Chatbot from "@/components/Chatbot";
import ThemeSelector from "@/components/ThemeSelector";
import GoogleIntegration from "@/components/GoogleIntegration";
import CalendarSync from "@/components/CalendarSync";

interface DashboardData {
    goals: Goal[];
    tasks: Task[];
    completionPercent: number;
    hasReplanned: boolean;
    agentActions: AgentAction[];
    reasoningSteps: ReasoningStep[];
    microAdjustments: MicroAdjustment[];
    coachMessages: CoachMessage[];
    behaviorPatterns: BehaviorPattern[];
    latestInsight: DailyInsight | null;
    todayFitness: FitnessData;
    integrations: Integration[];
    calendarEvents: CalendarEvent[];
}

export default function DashboardPage() {
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"today" | "insights" | "settings">("today");
    const [isReplanning, setIsReplanning] = useState(false);
    const [latestCoachMessage, setLatestCoachMessage] = useState<CoachMessage | null>(null);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/dashboard");
            if (res.ok) {
                const dashboardData = await res.json();
                setData(dashboardData);
            } else {
                router.push("/setup");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleStatusChange = async (taskId: string, status: Task["status"]) => {
        if (!data) return;

        setData({
            ...data,
            tasks: data.tasks.map((t) =>
                t.id === taskId ? { ...t, status, completedAt: status === "done" ? new Date().toISOString() : undefined } : t
            ),
        });

        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (res.ok) {
                const result = await res.json();
                setData((prev) => prev ? { ...prev, goals: result.goals } : prev);
            } else {
                fetchData();
            }
        } catch (error) {
            console.error(error);
            fetchData();
        }
    };

    const handleCreateTask = async (taskData: { title: string; description: string; goalId: string }) => {
        if (!data) return;

        const newTask: Task = {
            id: `task-${Date.now()}`,
            goalId: taskData.goalId,
            title: taskData.title,
            description: taskData.description,
            dayIndex: 0,
            scheduledDate: new Date().toISOString().split("T")[0],
            estimatedMinutes: 30,
            startTime: "18:00",
            status: "pending",
            difficulty: "medium",
        };

        setData({
            ...data,
            tasks: [...data.tasks, newTask],
        });

        // In a real app, you'd also save this to the backend
    };

    const handleCompleteTask = async (taskId: string) => {
        handleStatusChange(taskId, "done");
    };

    const handleReplan = async () => {
        setIsReplanning(true);

        try {
            const res = await fetch("/api/replan", { method: "POST" });
            if (res.ok) {
                const result = await res.json();
                setData((prev) =>
                    prev
                        ? {
                            ...prev,
                            tasks: result.updatedTasks,
                            goals: result.goals,
                            hasReplanned: true,
                            reasoningSteps: result.reasoningSteps,
                            microAdjustments: result.microAdjustments,
                            behaviorPatterns: result.behaviorPatterns,
                            latestInsight: result.behaviorInsight,
                        }
                        : prev
                );
                setLatestCoachMessage(result.coachMessage);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsReplanning(false);
        }
    };

    const handleUpdateSteps = async (steps: number) => {
        if (!data) return;

        setData({
            ...data,
            todayFitness: { ...data.todayFitness, steps },
        });

        try {
            const res = await fetch("/api/fitness", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ steps }),
            });

            if (res.ok) {
                const result = await res.json();
                setData((prev) =>
                    prev
                        ? {
                            ...prev,
                            todayFitness: result.fitnessData,
                            goals: result.goals,
                        }
                        : prev
                );
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleApplyAdjustment = async (adjustmentId: string) => {
        try {
            const res = await fetch("/api/adjustments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adjustmentId }),
            });

            if (res.ok) {
                const result = await res.json();
                setData((prev) =>
                    prev
                        ? {
                            ...prev,
                            tasks: result.tasks,
                            microAdjustments: prev.microAdjustments.map((a) =>
                                a.id === adjustmentId ? { ...a, applied: true, appliedAt: new Date().toISOString() } : a
                            ),
                        }
                        : prev
                );
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
                <div className="text-center">
                    <div
                        className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center animate-pulse"
                        style={{ background: "var(--primaryGradient)" }}
                    >
                        <span className="text-3xl">🤖</span>
                    </div>
                    <p style={{ color: "var(--foregroundMuted)" }}>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const todayTasks = data.tasks.filter((t) => t.dayIndex === 0);
    const tasksDone = todayTasks.filter((t) => t.status === "done").length;
    const completionPercent = todayTasks.length > 0 ? Math.round((tasksDone / todayTasks.length) * 100) : 0;

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 relative" style={{ background: "var(--background)" }}>
            {/* Background Decorations */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div
                    className="absolute top-[-10%] left-[-5%] w-[30%] h-[30%] rounded-full blur-[100px] opacity-20"
                    style={{ background: "var(--primaryGradient)" }}
                />
                <div
                    className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] rounded-full blur-[100px] opacity-15"
                    style={{ background: "var(--secondaryGradient)" }}
                />
            </div>

            <div className="max-w-[1600px] mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <MoodEmoji completionPercent={completionPercent} size="md" />
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                                <span className="text-gradient">Life</span>Loop
                            </h1>
                            <p className="text-sm" style={{ color: "var(--foregroundMuted)" }}>
                                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeSelector compact />
                        <button
                            onClick={() => router.push("/setup")}
                            className="px-4 py-2 text-sm rounded-xl font-medium transition-all"
                            style={{
                                background: "var(--backgroundSecondary)",
                                color: "var(--foreground)",
                                border: "1px solid var(--cardBorder)",
                            }}
                        >
                            + New Goal
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div
                    className="flex gap-1 p-1 rounded-xl w-fit"
                    style={{ background: "var(--backgroundSecondary)" }}
                >
                    {[
                        { id: "today", label: "Today's Plan", icon: "📋" },
                        { id: "insights", label: "Insights", icon: "📈" },
                        { id: "settings", label: "Settings", icon: "⚙️" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            style={{
                                background: activeTab === tab.id ? "var(--primaryGradient)" : "transparent",
                                color: activeTab === tab.id ? "white" : "var(--foregroundMuted)",
                            }}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-6">
                        {activeTab === "today" && (
                            <>
                                {/* Goals Overview */}
                                <MultiGoalCard goals={data.goals} />

                                {/* Today's Summary */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div
                                        className="p-5 rounded-2xl shadow-sm"
                                        style={{ background: "var(--cardBg)", border: "1px solid var(--cardBorder)" }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center text-2xl shadow-lg">
                                                ✓
                                            </div>
                                            <div>
                                                <span className="text-3xl font-bold" style={{ color: "var(--foreground)" }}>{completionPercent}%</span>
                                                <p className="text-sm" style={{ color: "var(--foregroundMuted)" }}>Today&apos;s Progress</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className="p-5 rounded-2xl shadow-sm"
                                        style={{ background: "var(--cardBg)", border: "1px solid var(--cardBorder)" }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-2xl shadow-lg">
                                                📋
                                            </div>
                                            <div>
                                                <span className="text-3xl font-bold" style={{ color: "var(--foreground)" }}>{tasksDone}/{todayTasks.length}</span>
                                                <p className="text-sm" style={{ color: "var(--foregroundMuted)" }}>Tasks Done</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className="p-5 rounded-2xl shadow-sm"
                                        style={{ background: "var(--cardBg)", border: "1px solid var(--cardBorder)" }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-2xl shadow-lg">
                                                🔥
                                            </div>
                                            <div>
                                                <span className="text-3xl font-bold" style={{ color: "var(--foreground)" }}>{data.latestInsight?.streakDays || 1}</span>
                                                <p className="text-sm" style={{ color: "var(--foregroundMuted)" }}>Day Streak</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Today's Tasks */}
                                <div
                                    className="p-6 rounded-2xl shadow-sm"
                                    style={{ background: "var(--cardBg)", border: "1px solid var(--cardBorder)" }}
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Today&apos;s Tasks</h3>
                                        <span
                                            className="text-sm font-medium px-3 py-1 rounded-full"
                                            style={{ background: "var(--backgroundSecondary)", color: "var(--foregroundMuted)" }}
                                        >
                                            {new Date().toLocaleDateString()}
                                        </span>
                                    </div>
                                    <TaskList tasks={todayTasks} onStatusChange={handleStatusChange} />
                                </div>

                                {/* Replan CTA */}
                                <div
                                    className="relative overflow-hidden rounded-2xl"
                                    style={{ background: "var(--primaryGradient)" }}
                                >
                                    <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                                        <div className="text-white">
                                            <h4 className="font-bold text-lg">Ready to wrap up the day?</h4>
                                            <p className="text-sm opacity-90 mt-1">
                                                The agent will analyze your progress and optimize tomorrow&apos;s schedule.
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleReplan}
                                            disabled={isReplanning}
                                            className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 whitespace-nowrap disabled:opacity-50"
                                        >
                                            {isReplanning ? "Analyzing..." : "End Day & Replan"}
                                        </button>
                                    </div>
                                </div>

                                {/* Coach Message */}
                                {(latestCoachMessage || (data.coachMessages && data.coachMessages.length > 0)) && (
                                    <div
                                        className="p-6 rounded-2xl"
                                        style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)", border: "1px solid rgba(16, 185, 129, 0.3)" }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                                                <span className="text-2xl">🤖</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg" style={{ color: "var(--success)" }}>Coach&apos;s Feedback</h4>
                                                <p className="mt-2 text-lg leading-relaxed" style={{ color: "var(--foreground)" }}>
                                                    &ldquo;{latestCoachMessage?.message || data.coachMessages[data.coachMessages.length - 1]?.message}&rdquo;
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === "insights" && (
                            <>
                                <BehaviorInsights
                                    patterns={data.behaviorPatterns}
                                    insight={data.latestInsight}
                                    recommendations={[
                                        "Schedule important tasks during your peak productivity hours.",
                                        "Your completion rate is trending upward—keep it up!",
                                        "Consider adding a stretch goal for extra momentum.",
                                    ]}
                                />
                                <MicroAdjustmentsPanel
                                    adjustments={data.microAdjustments}
                                    onApply={handleApplyAdjustment}
                                />
                                <WeekOverview tasks={data.tasks} goals={data.goals} />
                            </>
                        )}

                        {activeTab === "settings" && (
                            <>
                                <ThemeSelector />
                                <GoogleIntegration
                                    calendarConnected={data.integrations.some(i => i.provider === "google_calendar" && i.connected)}
                                    fitnessConnected={data.integrations.some(i => i.provider === "google_fit" && i.connected)}
                                    onCalendarSync={(events) => {
                                        setData(prev => prev ? { ...prev, calendarEvents: events } : prev);
                                    }}
                                    onFitnessSync={(fitness) => {
                                        setData(prev => prev ? { ...prev, todayFitness: fitness } : prev);
                                    }}
                                />
                            </>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Calendar Sync */}
                        <CalendarSync onSyncComplete={fetchData} />

                        {/* Fitness Tracker */}
                        <FitnessTracker data={data.todayFitness} onUpdateSteps={handleUpdateSteps} />

                        {/* Week Overview (only on Today tab) */}
                        {activeTab === "today" && <WeekOverview tasks={data.tasks} goals={data.goals} />}

                        {/* Agent Timeline */}
                        <AgentTimeline hasReplanned={data.hasReplanned} actions={data.agentActions} />
                    </div>
                </div>
            </div>

            {/* Chatbot */}
            <Chatbot
                tasks={data.tasks}
                goals={data.goals}
                onCreateTask={handleCreateTask}
                onCompleteTask={handleCompleteTask}
                onReplan={handleReplan}
            />
        </div>
    );
}
