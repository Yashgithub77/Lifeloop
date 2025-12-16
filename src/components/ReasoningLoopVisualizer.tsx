"use client";

import { ReasoningStep } from "@/types";
import { useState, useEffect } from "react";

interface ReasoningLoopVisualizerProps {
    steps: ReasoningStep[];
    isActive?: boolean;
}

const phaseConfig = {
    understand: {
        icon: "🔍",
        color: "from-blue-500 to-cyan-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
        textColor: "text-blue-400",
        label: "Understanding",
    },
    propose: {
        icon: "💡",
        color: "from-amber-500 to-yellow-500",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
        textColor: "text-amber-400",
        label: "Proposing",
    },
    execute: {
        icon: "⚡",
        color: "from-violet-500 to-purple-500",
        bgColor: "bg-violet-500/10",
        borderColor: "border-violet-500/30",
        textColor: "text-violet-400",
        label: "Executing",
    },
    observe: {
        icon: "👁️",
        color: "from-emerald-500 to-teal-500",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/30",
        textColor: "text-emerald-400",
        label: "Observing",
    },
    update: {
        icon: "✅",
        color: "from-indigo-500 to-blue-500",
        bgColor: "bg-indigo-500/10",
        borderColor: "border-indigo-500/30",
        textColor: "text-indigo-400",
        label: "Updating",
    },
};

export default function ReasoningLoopVisualizer({ steps, isActive = false }: ReasoningLoopVisualizerProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        if (isActive && steps.length > 0) {
            const interval = setInterval(() => {
                setActiveIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
            }, 1500);
            return () => clearInterval(interval);
        }
    }, [isActive, steps.length]);

    const displaySteps = showAll ? steps : steps.slice(0, 5);

    return (
        <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🧠</span>
                    Agent Reasoning
                </h3>
                {isActive && (
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="text-emerald-400 text-sm font-medium">Processing</span>
                    </div>
                )}
            </div>

            {/* Loop Diagram */}
            <div className="flex justify-center mb-6">
                <div className="flex items-center gap-1">
                    {(["understand", "propose", "execute", "observe", "update"] as const).map((phase, idx) => {
                        const config = phaseConfig[phase];
                        const isCurrentPhase = steps.some((s, i) => s.phase === phase && (showAll || i <= activeIndex));
                        const isPastPhase = steps.findIndex((s) => s.phase === phase) < activeIndex;

                        return (
                            <div key={phase} className="flex items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-500 ${isCurrentPhase
                                            ? `bg-gradient-to-r ${config.color} shadow-lg`
                                            : "bg-slate-800 opacity-50"
                                        }`}
                                >
                                    {config.icon}
                                </div>
                                {idx < 4 && (
                                    <div
                                        className={`w-6 h-0.5 transition-colors duration-500 ${isPastPhase ? "bg-gradient-to-r from-slate-500 to-slate-600" : "bg-slate-700"
                                            }`}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Steps List */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {displaySteps.map((step, index) => {
                    const config = phaseConfig[step.phase];
                    const isVisible = showAll || index <= activeIndex;

                    return (
                        <div
                            key={step.id}
                            className={`transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                                }`}
                        >
                            <div
                                className={`p-4 rounded-xl ${config.bgColor} border ${config.borderColor} transition-all duration-300`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${config.color} flex items-center justify-center text-sm flex-shrink-0`}>
                                        {config.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-bold uppercase tracking-wider ${config.textColor}`}>
                                                {config.label}
                                            </span>
                                            <span className="text-slate-600 text-xs">•</span>
                                            <span className="text-slate-500 text-xs font-mono">
                                                {new Date(step.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <h4 className="text-white font-semibold text-sm mb-1">{step.title}</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Show More Button */}
            {steps.length > 5 && !showAll && (
                <button
                    onClick={() => setShowAll(true)}
                    className="mt-4 w-full py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                    Show all {steps.length} steps →
                </button>
            )}

            {steps.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                    <span className="text-3xl mb-2 block">🤖</span>
                    <p>Agent reasoning will appear here during planning and replanning.</p>
                </div>
            )}
        </div>
    );
}
