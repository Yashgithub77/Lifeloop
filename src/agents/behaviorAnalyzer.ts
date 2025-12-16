import { Task, BehaviorPattern, DailyInsight, FitnessData, AgentAction } from "@/types";
import { store } from "@/data/store";

interface AnalysisResult {
    patterns: BehaviorPattern[];
    insights: DailyInsight;
    recommendations: string[];
}

// Analyze productivity patterns over time
function analyzeProductivityPatterns(tasks: Task[]): BehaviorPattern[] {
    const patterns: BehaviorPattern[] = [];
    const now = new Date().toISOString();

    // Pattern 1: Productivity Peak Time
    const timePerformance: Record<string, { done: number; total: number }> = {};
    tasks.forEach((task) => {
        const hour = parseInt(task.startTime.split(":")[0]);
        const period = hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 20 ? "evening" : "night";
        if (!timePerformance[period]) {
            timePerformance[period] = { done: 0, total: 0 };
        }
        timePerformance[period].total++;
        if (task.status === "done") {
            timePerformance[period].done++;
        }
    });

    let bestPeriod = "evening";
    let bestRate = 0;
    Object.entries(timePerformance).forEach(([period, data]) => {
        const rate = data.total > 0 ? (data.done / data.total) * 100 : 0;
        if (rate > bestRate) {
            bestRate = rate;
            bestPeriod = period;
        }
    });

    if (bestRate > 0) {
        patterns.push({
            id: `pattern-${Date.now()}-1`,
            type: "productivity_peak",
            insight: `Your most productive time is ${bestPeriod} with ${Math.round(bestRate)}% task completion rate.`,
            confidence: Math.min(90, bestRate + 10),
            detectedAt: now,
            dataPoints: tasks.length,
        });
    }

    // Pattern 2: Completion Rate Trend
    const completedTasks = tasks.filter((t) => t.status === "done").length;
    const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    patterns.push({
        id: `pattern-${Date.now()}-2`,
        type: "completion_rate",
        insight: `Your overall completion rate is ${Math.round(completionRate)}%. ${completionRate >= 70 ? "Great consistency!" : "Room for improvement—try smaller tasks."
            }`,
        confidence: Math.min(95, 50 + completionRate / 2),
        detectedAt: now,
        dataPoints: tasks.length,
    });

    // Pattern 3: Skip Pattern Detection
    const skippedTasks = tasks.filter((t) => t.status === "skipped" || t.status === "rescheduled");
    if (skippedTasks.length > 0) {
        const hardSkipped = skippedTasks.filter((t) => t.difficulty === "hard").length;
        const skipReason = hardSkipped > skippedTasks.length / 2
            ? "You tend to skip harder tasks. Consider breaking them into smaller chunks."
            : "Some tasks are being rescheduled. Try adjusting your daily load.";

        patterns.push({
            id: `pattern-${Date.now()}-3`,
            type: "skip_pattern",
            insight: skipReason,
            confidence: 75,
            detectedAt: now,
            dataPoints: skippedTasks.length,
        });
    }

    // Pattern 4: Focus Duration
    const tasksWithActual = tasks.filter((t) => t.actualMinutes && t.status === "done");
    if (tasksWithActual.length > 0) {
        const avgDuration = Math.round(
            tasksWithActual.reduce((sum, t) => sum + (t.actualMinutes || 0), 0) / tasksWithActual.length
        );
        const plannedAvg = Math.round(
            tasksWithActual.reduce((sum, t) => sum + t.estimatedMinutes, 0) / tasksWithActual.length
        );

        patterns.push({
            id: `pattern-${Date.now()}-4`,
            type: "focus_duration",
            insight: `Your average focus session is ${avgDuration} mins (planned: ${plannedAvg} mins). ${avgDuration < plannedAvg
                    ? "You finish faster than expected!"
                    : "Tasks take longer—consider adding buffer time."
                }`,
            confidence: 80,
            detectedAt: now,
            dataPoints: tasksWithActual.length,
        });
    }

    return patterns;
}

// Calculate daily insight
function calculateDailyInsight(tasks: Task[], fitnessData: FitnessData): DailyInsight {
    const todayTasks = tasks.filter((t) => t.dayIndex === 0);
    const completed = todayTasks.filter((t) => t.status === "done").length;
    const totalFocusMinutes = todayTasks
        .filter((t) => t.status === "done")
        .reduce((sum, t) => sum + (t.actualMinutes || t.estimatedMinutes), 0);

    // Estimate mood based on completion and fitness
    let mood: DailyInsight["mood"] = "okay";
    const completionRate = todayTasks.length > 0 ? (completed / todayTasks.length) * 100 : 0;
    const stepsAchieved = (fitnessData.steps / fitnessData.stepsGoal) * 100;

    if (completionRate >= 80 && stepsAchieved >= 80) {
        mood = "great";
    } else if (completionRate >= 60 || stepsAchieved >= 60) {
        mood = "good";
    } else if (completionRate < 30 && stepsAchieved < 30) {
        mood = "tired";
    }

    // Energy level estimation
    const energyLevel = Math.min(10, Math.round((completionRate + stepsAchieved) / 20));

    return {
        date: new Date().toISOString().split("T")[0],
        tasksCompleted: completed,
        tasksTotal: todayTasks.length,
        completionRate,
        totalFocusMinutes,
        streakDays: Math.floor(Math.random() * 7) + 1, // Simplified
        mood,
        energyLevel,
    };
}

// Generate recommendations based on analysis
function generateRecommendations(patterns: BehaviorPattern[], insight: DailyInsight): string[] {
    const recommendations: string[] = [];

    // Based on productivity peak
    const peakPattern = patterns.find((p) => p.type === "productivity_peak");
    if (peakPattern) {
        const period = peakPattern.insight.includes("morning")
            ? "morning"
            : peakPattern.insight.includes("afternoon")
                ? "afternoon"
                : "evening";
        recommendations.push(`Schedule important tasks during ${period} for best results.`);
    }

    // Based on completion rate
    if (insight.completionRate < 50) {
        recommendations.push("Try reducing daily task count to build consistency.");
        recommendations.push("Consider shorter 25-minute focus sessions (Pomodoro technique).");
    } else if (insight.completionRate >= 80) {
        recommendations.push("You're doing great! Consider adding one stretch goal.");
    }

    // Based on focus duration
    const focusPattern = patterns.find((p) => p.type === "focus_duration");
    if (focusPattern && focusPattern.insight.includes("longer")) {
        recommendations.push("Add 10-minute buffer to task estimates.");
    }

    // Based on energy level
    if (insight.energyLevel && insight.energyLevel <= 4) {
        recommendations.push("Your energy seems low—prioritize rest and lighter tasks tomorrow.");
    }

    // Default recommendations
    if (recommendations.length === 0) {
        recommendations.push("Keep up your current routine—consistency is key!");
        recommendations.push("Take a 5-minute stretch break between tasks.");
    }

    return recommendations;
}

// Main analysis function
export function analyzeBehavior(tasks: Task[], fitnessData: FitnessData): AnalysisResult {
    const now = new Date().toISOString();

    // Analyze patterns
    const patterns = analyzeProductivityPatterns(tasks);

    // Calculate daily insight
    const insight = calculateDailyInsight(tasks, fitnessData);

    // Generate recommendations
    const recommendations = generateRecommendations(patterns, insight);

    // Store patterns
    patterns.forEach((pattern) => store.addBehaviorPattern(pattern));
    store.addDailyInsight(insight);

    // Log agent action
    const agentAction: AgentAction = {
        id: `action-${Date.now()}`,
        type: "analyze_behavior",
        timestamp: now,
        input: `Analyzed ${tasks.length} tasks and fitness data`,
        output: `Detected ${patterns.length} patterns, generated ${recommendations.length} recommendations`,
        status: "completed",
        duration: Math.floor(Math.random() * 300) + 100,
    };
    store.addAgentAction(agentAction);

    return { patterns, insights: insight, recommendations };
}

// Analyze fitness progress
export function analyzeFitnessProgress(fitnessHistory: FitnessData[]): {
    weeklySteps: number;
    avgDailySteps: number;
    goalAchievementDays: number;
    trend: "improving" | "stable" | "declining";
    message: string;
} {
    const weeklySteps = fitnessHistory.reduce((sum, d) => sum + d.steps, 0);
    const avgDailySteps = Math.round(weeklySteps / fitnessHistory.length);
    const goalAchievementDays = fitnessHistory.filter((d) => d.steps >= d.stepsGoal).length;

    // Calculate trend
    const firstHalf = fitnessHistory.slice(0, Math.floor(fitnessHistory.length / 2));
    const secondHalf = fitnessHistory.slice(Math.floor(fitnessHistory.length / 2));
    const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.steps, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.steps, 0) / secondHalf.length;

    let trend: "improving" | "stable" | "declining";
    if (secondHalfAvg > firstHalfAvg * 1.1) {
        trend = "improving";
    } else if (secondHalfAvg < firstHalfAvg * 0.9) {
        trend = "declining";
    } else {
        trend = "stable";
    }

    // Generate message
    let message: string;
    if (goalAchievementDays >= 5) {
        message = `Excellent! You hit your step goal ${goalAchievementDays}/7 days this week. 🎉`;
    } else if (goalAchievementDays >= 3) {
        message = `Good progress! ${goalAchievementDays} days at goal. Keep building that momentum!`;
    } else {
        message = `You reached your goal ${goalAchievementDays} days. Try breaking walks into 3 short sessions.`;
    }

    return { weeklySteps, avgDailySteps, goalAchievementDays, trend, message };
}
