import { NextRequest, NextResponse } from "next/server";
import { generateTasksWithAI } from "@/lib/ai";
import { Goal, GoalCategory, GoalPriority, Task } from "@/types";
import { store, DEMO_USER } from "@/data/store";

const DEMO_USER_ID = "demo-user-001";

export async function POST(req: NextRequest) {
    try {
        console.log("=== AI-Powered Generate Plan API Called ===");

        const body = await req.json();
        const { goals: inputGoals, useAI = true } = body;

        console.log("Input goals:", JSON.stringify(inputGoals, null, 2));
        console.log("Use AI:", useAI);

        // Reset in-memory store
        store.reset();
        store.clearReasoningSteps();

        // Create goals from input
        const goalsToCreate: Goal[] = [];

        interface GoalInput {
            title: string;
            description?: string;
            category?: string;
            targetWeeks?: number;
            targetValue?: number;
            unit?: string;
        }

        const goalsData: GoalInput[] = inputGoals && Array.isArray(inputGoals) && inputGoals.length > 0
            ? inputGoals
            : [
                {
                    title: "Finish ML syllabus (Units 1–5)",
                    description: "Cover all 5 units including supervised learning, unsupervised learning, and neural networks.",
                    category: "Study",
                    targetWeeks: 4,
                    targetValue: 20,
                    unit: "chapters",
                },
            ];

        goalsData.forEach((g, index) => {
            goalsToCreate.push({
                id: `goal-${Date.now()}-${index}`,
                title: g.title,
                description: g.description || "",
                category: (g.category as GoalCategory) || "Study",
                priority: "high" as GoalPriority,
                targetWeeks: g.targetWeeks || 4,
                targetValue: g.targetValue,
                currentValue: 0,
                unit: g.unit,
                createdAt: new Date().toISOString(),
                isRecurring: g.category === "Fitness",
                color: getCategoryColor((g.category as GoalCategory) || "Study"),
            });
        });

        console.log("Goals to create:", goalsToCreate.length);

        // Add goals to in-memory store
        goalsToCreate.forEach((goal) => store.addGoal(goal));

        let allTasks: Task[] = [];

        if (useAI && process.env.GEMINI_API_KEY) {
            try {
                console.log("🤖 Generating tasks with AI...");

                const aiTaskSuggestions = await generateTasksWithAI({
                    goals: goalsToCreate,
                    userContext: {
                        collegeHours: DEMO_USER.collegeHours,
                        sleepHours: DEMO_USER.sleepHours,
                        dailyAvailableMinutes: DEMO_USER.dailyAvailableMinutes,
                    },
                });

                console.log(`✅ AI generated ${aiTaskSuggestions.length} task suggestions`);

                // Convert AI suggestions to Task objects
                allTasks = aiTaskSuggestions.map((suggestion, index) => {
                    const scheduledDate = new Date();
                    scheduledDate.setDate(scheduledDate.getDate() + suggestion.dayIndex);

                    return {
                        id: `task-${Date.now()}-${index}`,
                        goalId: suggestion.goalId,
                        title: suggestion.title,
                        description: suggestion.description,
                        dayIndex: suggestion.dayIndex,
                        scheduledDate: scheduledDate.toISOString(),
                        estimatedMinutes: suggestion.estimatedMinutes,
                        startTime: suggestion.startTime,
                        status: "pending" as const,
                        difficulty: suggestion.difficulty,
                        createdAt: new Date().toISOString(),
                    };
                });

            } catch (aiError) {
                console.warn("⚠️ AI generation failed, falling back to rule-based:", aiError);
                // Fallback to existing rule-based generation
                const { generateMultiGoalPlan } = await import("@/agents/planner");
                const result = generateMultiGoalPlan(goalsToCreate, DEMO_USER, store.getCalendarEvents());
                allTasks = result.allTasks;
            }
        } else {
            console.log("📝 Using rule-based task generation (AI disabled or no API key)");
            const { generateMultiGoalPlan } = await import("@/agents/planner");
            const result = generateMultiGoalPlan(goalsToCreate, DEMO_USER, store.getCalendarEvents());
            allTasks = result.allTasks;
        }

        console.log("Tasks generated:", allTasks.length);

        // Save tasks to in-memory store
        store.setTasks(allTasks);

        // Create initial snapshot
        store.addSnapshot({
            id: `snap-${Date.now()}`,
            createdAt: new Date().toISOString(),
            tasks: allTasks,
            goals: goalsToCreate,
            label: "initial",
            reason: useAI ? "AI-generated plan" : "Initial plan generated",
            agentActions: store.getAgentActions(),
        });

        console.log("=== Generate Plan API Success ===");

        return NextResponse.json({
            success: true,
            goals: goalsToCreate,
            tasks: allTasks,
            message: `Generated ${allTasks.length} tasks for ${goalsToCreate.length} goals`,
            aiPowered: useAI && process.env.GEMINI_API_KEY ? true : false,
        });
    } catch (error) {
        console.error("=== Generate Plan API Error ===");
        console.error("Error:", error instanceof Error ? error.message : String(error));

        return NextResponse.json(
            {
                error: "Failed to generate plan",
                details: error instanceof Error ? error.message : String(error),
                success: false,
            },
            { status: 500 }
        );
    }
}

function getCategoryColor(category: GoalCategory): string {
    const colors: Record<GoalCategory, string> = {
        Study: "#6366f1",
        Fitness: "#10b981",
        Health: "#f43f5e",
        Project: "#f59e0b",
        Career: "#06b6d4",
        Personal: "#8b5cf6",
    };
    return colors[category] || "#6366f1";
}
