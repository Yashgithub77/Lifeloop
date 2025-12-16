import { NextResponse } from "next/server";
import { store } from "@/data/store";
import { replanWeek } from "@/agents/replan";
import { analyzeBehavior } from "@/agents/behaviorAnalyzer";

export async function POST() {
    try {
        const currentTasks = store.getTasks();
        const goals = store.getGoals();
        const fitnessData = store.getTodayFitness();

        if (currentTasks.length === 0) {
            return NextResponse.json(
                { error: "No tasks to replan" },
                { status: 400 }
            );
        }

        // Clear previous reasoning steps for fresh analysis
        store.clearReasoningSteps();

        // Run replan agent
        const replanResult = replanWeek(currentTasks, goals);

        // Run behavior analysis
        const behaviorResult = analyzeBehavior(currentTasks, fitnessData);

        // Update tasks in store
        store.setTasks(replanResult.updatedTasks);

        // Update goal progress based on completed tasks
        goals.forEach((goal) => {
            const goalTasks = replanResult.updatedTasks.filter((t) => t.goalId === goal.id);
            const completedTasks = goalTasks.filter((t) => t.status === "done").length;

            if (goal.category === "Fitness") {
                // Update fitness goal with step data
                store.updateGoal(goal.id, { currentValue: fitnessData.steps });
            } else {
                // Update study/project goals with task completion
                store.updateGoal(goal.id, { currentValue: completedTasks });
            }
        });

        return NextResponse.json({
            success: true,
            updatedTasks: replanResult.updatedTasks,
            completionPercent: replanResult.completionPercent,
            coachMessage: replanResult.coachMessage,
            diffSummary: replanResult.diffSummary,
            microAdjustments: replanResult.microAdjustments,
            reasoningSteps: replanResult.reasoningSteps,
            behaviorPatterns: behaviorResult.patterns,
            behaviorInsight: behaviorResult.insights,
            recommendations: behaviorResult.recommendations,
            goals: store.getGoals(),
        });
    } catch (error) {
        console.error("Error replanning:", error);
        return NextResponse.json(
            { error: "Failed to replan" },
            { status: 500 }
        );
    }
}
