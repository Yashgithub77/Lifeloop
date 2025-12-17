"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoalCategory } from "@/types";
import { DEMO_USER } from "@/data/store";
import ThemeSelector from "@/components/ThemeSelector";

interface GoalInput {
    id: string;
    title: string;
    description: string;
    category: GoalCategory;
    targetWeeks: number;
    targetValue?: number;
    unit?: string;
}

const categoryOptions = [
    { value: "Study", icon: "📚", color: "from-indigo-500 to-violet-500" },
    { value: "Fitness", icon: "💪", color: "from-emerald-500 to-teal-500" },
    { value: "Health", icon: "❤️", color: "from-rose-500 to-pink-500" },
    { value: "Project", icon: "🚀", color: "from-amber-500 to-orange-500" },
    { value: "Career", icon: "💼", color: "from-cyan-500 to-blue-500" },
    { value: "Personal", icon: "🌟", color: "from-purple-500 to-indigo-500" },
];

const presetGoals: GoalInput[] = [
    {
        id: "preset-1",
        title: "Finish ML syllabus (Units 1–5)",
        description: "Cover all 5 units including supervised learning, unsupervised learning, and neural networks.",
        category: "Study",
        targetWeeks: 4,
        targetValue: 20,
        unit: "chapters",
    },
    {
        id: "preset-2",
        title: "Walk 5,000 steps daily",
        description: "Build a consistent walking habit for better health and energy levels.",
        category: "Fitness",
        targetWeeks: 4,
        targetValue: 5000,
        unit: "steps",
    },
];

export default function SetupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"goals" | "review">("goals");
    const [goals, setGoals] = useState<GoalInput[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newGoal, setNewGoal] = useState<GoalInput>({
        id: "",
        title: "",
        description: "",
        category: "Study",
        targetWeeks: 4,
        targetValue: undefined,
        unit: "",
    });

    const addPresetGoals = () => {
        setGoals(presetGoals);
    };

    const addGoal = () => {
        if (!newGoal.title.trim()) return;
        setGoals([...goals, { ...newGoal, id: `goal-${Date.now()}` }]);
        setNewGoal({ id: "", title: "", description: "", category: "Study", targetWeeks: 4, targetValue: undefined, unit: "" });
        setShowAddForm(false);
    };

    const removeGoal = (id: string) => {
        setGoals(goals.filter((g) => g.id !== id));
    };

    const handleSubmit = async () => {
        if (goals.length === 0) {
            alert("Please add at least one goal");
            return;
        }

        setLoading(true);

        try {
            console.log("Sending goals:", goals);
            // Try AI-powered generation first, falls back automatically if it fails
            const res = await fetch("/api/generate-plan-ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ goals, useAI: true }),
            });

            console.log("Response status:", res.status);
            const data = await res.json();
            console.log("Response data:", data);

            if (res.ok && data.success) {
                router.push("/dashboard");
            } else {
                console.error("API Error:", data);
                alert(`Failed to generate plan: ${data.error || data.details || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            alert(`An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative" style={{ background: "var(--background)" }}>
            {/* Background Decorations */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div
                    className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-20"
                    style={{ background: "var(--primaryGradient)" }}
                />
                <div
                    className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] rounded-full blur-[80px] opacity-15"
                    style={{ background: "var(--secondaryGradient)" }}
                />
            </div>

            {/* Theme Selector */}
            <div className="absolute top-6 right-6">
                <ThemeSelector compact />
            </div>

            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
                        Set Up Your <span className="text-gradient">Goals</span>
                    </h1>
                    <p className="mt-3 text-lg" style={{ color: "var(--foregroundMuted)" }}>
                        Tell the agent what you want to achieve. It will create a personalized plan.
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                        <span
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                            style={{ background: step === "goals" ? "var(--primaryGradient)" : "var(--cardBorder)" }}
                        >
                            1
                        </span>
                        <span className="text-sm font-medium" style={{ color: step === "goals" ? "var(--primary)" : "var(--foregroundMuted)" }}>
                            Add Goals
                        </span>
                    </div>
                    <div className="w-12 h-0.5" style={{ background: "var(--cardBorder)" }} />
                    <div className="flex items-center gap-2">
                        <span
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{
                                background: step === "review" ? "var(--primaryGradient)" : "var(--backgroundSecondary)",
                                color: step === "review" ? "white" : "var(--foregroundMuted)",
                                border: step !== "review" ? "1px solid var(--cardBorder)" : undefined,
                            }}
                        >
                            2
                        </span>
                        <span className="text-sm font-medium" style={{ color: step === "review" ? "var(--primary)" : "var(--foregroundMuted)" }}>
                            Review & Generate
                        </span>
                    </div>
                </div>

                {/* User Schedule Card */}
                <div
                    className="p-5 rounded-2xl shadow-sm"
                    style={{ background: "var(--cardBg)", border: "1px solid var(--cardBorder)" }}
                >
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--primary)" }}>
                        Your Schedule
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { icon: "🎓", label: "Busy Hours", value: `${DEMO_USER.collegeHours.start} - ${DEMO_USER.collegeHours.end}` },
                            { icon: "😴", label: "Sleep", value: `${DEMO_USER.sleepHours.start} - ${DEMO_USER.sleepHours.end}` },
                            { icon: "⚡", label: "Available", value: `${DEMO_USER.dailyAvailableMinutes} min/day` },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center gap-2">
                                <span className="text-xl">{item.icon}</span>
                                <div>
                                    <span className="text-xs block" style={{ color: "var(--foregroundMuted)" }}>{item.label}</span>
                                    <span className="font-mono text-sm" style={{ color: "var(--foreground)" }}>{item.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {step === "goals" && (
                    <>
                        {/* Quick Start */}
                        {goals.length === 0 && (
                            <div
                                className="p-8 rounded-2xl text-center shadow-sm"
                                style={{ background: "var(--cardBg)", border: "1px solid var(--cardBorder)" }}
                            >
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl" style={{ background: "var(--backgroundSecondary)" }}>
                                    🎯
                                </div>
                                <h3 className="text-xl font-bold mb-2" style={{ color: "var(--foreground)" }}>Quick Start</h3>
                                <p className="mb-6" style={{ color: "var(--foregroundMuted)" }}>
                                    Use our preset goals to get started quickly, or add your own.
                                </p>
                                <button
                                    onClick={addPresetGoals}
                                    className="btn-primary px-8 py-4 rounded-xl text-lg"
                                >
                                    Use Demo Goals (ML + Fitness)
                                </button>
                            </div>
                        )}

                        {/* Goals List */}
                        {goals.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                                    Your Goals ({goals.length})
                                </h3>
                                {goals.map((goal) => {
                                    const category = categoryOptions.find((c) => c.value === goal.category);
                                    return (
                                        <div
                                            key={goal.id}
                                            className="p-5 rounded-2xl flex items-start gap-4 shadow-sm card-hover"
                                            style={{ background: "var(--cardBg)", border: "1px solid var(--cardBorder)" }}
                                        >
                                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${category?.color} flex items-center justify-center text-2xl shadow-lg`}>
                                                {category?.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-lg" style={{ color: "var(--foreground)" }}>{goal.title}</h4>
                                                <p className="text-sm mt-1" style={{ color: "var(--foregroundMuted)" }}>{goal.description}</p>
                                                <div className="flex gap-4 mt-2 text-xs" style={{ color: "var(--foregroundMuted)" }}>
                                                    <span>📅 {goal.targetWeeks} weeks</span>
                                                    {goal.targetValue && <span>🎯 Target: {goal.targetValue.toLocaleString()} {goal.unit}</span>}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeGoal(goal.id)}
                                                className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Add Goal Form */}
                        {showAddForm ? (
                            <div
                                className="p-6 rounded-2xl space-y-5 shadow-sm"
                                style={{ background: "var(--cardBg)", border: "1px solid var(--cardBorder)" }}
                            >
                                <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Add New Goal</h3>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>Title</label>
                                    <input
                                        type="text"
                                        value={newGoal.title}
                                        onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                                        placeholder="e.g., Learn Spanish basics"
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>Description</label>
                                    <textarea
                                        rows={2}
                                        value={newGoal.description}
                                        onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                                        placeholder="What do you want to achieve?"
                                        className="input-field"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>Category</label>
                                        <select
                                            value={newGoal.category}
                                            onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as GoalCategory })}
                                            className="input-field"
                                        >
                                            {categoryOptions.map((cat) => (
                                                <option key={cat.value} value={cat.value}>{cat.icon} {cat.value}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>Duration</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min={1}
                                                max={12}
                                                value={newGoal.targetWeeks}
                                                onChange={(e) => setNewGoal({ ...newGoal, targetWeeks: parseInt(e.target.value) })}
                                                className="input-field"
                                            />
                                            <span style={{ color: "var(--foregroundMuted)" }}>weeks</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                                            Target Value <span className="font-normal" style={{ color: "var(--foregroundMuted)" }}>(optional)</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={newGoal.targetValue || ""}
                                            onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseInt(e.target.value) || undefined })}
                                            placeholder="e.g., 5000"
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                                            Unit <span className="font-normal" style={{ color: "var(--foregroundMuted)" }}>(optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={newGoal.unit || ""}
                                            onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                                            placeholder="e.g., steps, pages"
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={addGoal}
                                        className="flex-1 py-3 rounded-xl font-medium text-white"
                                        style={{ background: "var(--primaryGradient)" }}
                                    >
                                        Add Goal
                                    </button>
                                    <button
                                        onClick={() => setShowAddForm(false)}
                                        className="px-6 py-3 rounded-xl font-medium btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="w-full py-5 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                                style={{ borderColor: "var(--cardBorder)", color: "var(--foregroundMuted)" }}
                            >
                                <span className="text-2xl">+</span>
                                Add Custom Goal
                            </button>
                        )}

                        {/* Continue Button */}
                        {goals.length > 0 && (
                            <button
                                onClick={() => setStep("review")}
                                className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all hover:scale-[1.01]"
                                style={{ background: "var(--primaryGradient)" }}
                            >
                                Continue to Review →
                            </button>
                        )}
                    </>
                )}

                {step === "review" && (
                    <div className="space-y-6">
                        {/* Review Summary */}
                        <div
                            className="p-6 rounded-2xl shadow-sm"
                            style={{ background: "var(--cardBg)", border: "1px solid var(--cardBorder)" }}
                        >
                            <h3 className="text-xl font-bold mb-4" style={{ color: "var(--foreground)" }}>Review Your Plan</h3>

                            <div className="space-y-3">
                                {goals.map((goal) => {
                                    const category = categoryOptions.find((c) => c.value === goal.category);
                                    return (
                                        <div key={goal.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "var(--backgroundSecondary)" }}>
                                            <span className="text-2xl">{category?.icon}</span>
                                            <div className="flex-1">
                                                <h4 className="font-semibold" style={{ color: "var(--foreground)" }}>{goal.title}</h4>
                                                <span className="text-xs" style={{ color: "var(--foregroundMuted)" }}>{goal.category} • {goal.targetWeeks} weeks</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div
                                className="mt-6 p-4 rounded-xl"
                                style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)", border: "1px solid rgba(99, 102, 241, 0.2)" }}
                            >
                                <h4 className="text-sm font-bold mb-3" style={{ color: "var(--primary)" }}>What the Agent Will Do:</h4>
                                <ul className="space-y-2">
                                    {[
                                        "Generate a 7-day adaptive schedule",
                                        "Sync with your Google Calendar events",
                                        "Track fitness data from Google Fit",
                                        "Adjust daily based on your progress",
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)" }}>
                                            <span style={{ color: "var(--success)" }}>✓</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep("goals")}
                                className="px-8 py-4 rounded-xl font-medium btn-secondary"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 py-4 rounded-xl font-bold text-white text-lg transition-all hover:scale-[1.01] disabled:opacity-50"
                                style={{ background: "var(--primaryGradient)" }}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Agent is generating your plan...
                                    </span>
                                ) : (
                                    "🚀 Generate Plan"
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
