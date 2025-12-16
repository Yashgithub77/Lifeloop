import { NextRequest, NextResponse } from "next/server";
import { generateMultiGoalPlan } from "@/agents/planner";
import { Goal, GoalCategory, GoalPriority } from "@/types";
import { store, DEMO_USER } from "@/data/store";

// Try to import prisma, but don't fail if database is unavailable
let prisma: typeof import("@/lib/prisma").default | null = null;
try {
    prisma = require("@/lib/prisma").default;
} catch {
    console.warn("Prisma not available, using in-memory store");
}

const DEMO_USER_ID = "demo-user-001";

async function tryDatabaseOperation<T>(
    dbOperation: () => Promise<T>,
    fallback: () => T
): Promise<{ result: T; usedDatabase: boolean }> {
    if (!prisma) {
        return { result: fallback(), usedDatabase: false };
    }

    try {
        const result = await dbOperation();
        return { result, usedDatabase: true };
    } catch (error) {
        console.warn("Database operation failed, using fallback:", error instanceof Error ? error.message : error);
        return { result: fallback(), usedDatabase: false };
    }
}

export async function POST(req: NextRequest) {
    try {
        console.log("=== Generate Plan API Called ===");

        const body = await req.json();
        const { goals: inputGoals } = body;

        console.log("Input goals:", JSON.stringify(inputGoals, null, 2));

        // Reset in-memory store
        store.reset();
        store.clearReasoningSteps();

        // Create goals from input or use default
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
                {
                    title: "Walk 5,000 steps daily",
                    description: "Build a consistent walking habit for better health and energy levels.",
                    category: "Fitness",
                    targetWeeks: 4,
                    targetValue: 5000,
                    unit: "steps",
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
        console.log("Goals added to in-memory store");

        // Try to save to database as well
        let usedDatabase = false;
        if (prisma) {
            try {
                // Ensure demo user exists
                await prisma.user.upsert({
                    where: { id: DEMO_USER_ID },
                    update: {},
                    create: {
                        id: DEMO_USER_ID,
                        name: "Demo User",
                        email: "demo@lifeloop.app",
                    },
                });

                // Clear existing goals and tasks
                await prisma.task.deleteMany({ where: { userId: DEMO_USER_ID } });
                await prisma.goal.deleteMany({ where: { userId: DEMO_USER_ID } });

                // Create goals in database
                for (const goal of goalsToCreate) {
                    await prisma.goal.create({
                        data: {
                            id: goal.id,
                            userId: DEMO_USER_ID,
                            title: goal.title,
                            description: goal.description || "",
                            category: goal.category,
                            priority: goal.priority,
                            targetWeeks: goal.targetWeeks,
                            targetValue: goal.targetValue,
                            currentValue: goal.currentValue,
                            unit: goal.unit,
                            isRecurring: goal.isRecurring,
                            color: goal.color,
                        },
                    });
                }
                usedDatabase = true;
                console.log("Goals saved to database");
            } catch (dbError) {
                console.warn("Database save failed, continuing with in-memory only:", dbError instanceof Error ? dbError.message : dbError);
            }
        }

        // Get calendar events from in-memory store
        const calendarEvents = store.getCalendarEvents();
        console.log("Calendar events:", calendarEvents.length);

        // Generate multi-goal plan
        console.log("Calling generateMultiGoalPlan...");
        const { allTasks, allReasoningSteps } = generateMultiGoalPlan(
            goalsToCreate,
            DEMO_USER,
            calendarEvents
        );

        console.log("Tasks generated:", allTasks.length);

        // Save tasks to in-memory store
        store.setTasks(allTasks);
        console.log("Tasks saved to in-memory store");

        // Try to save tasks to database
        if (prisma && usedDatabase) {
            try {
                for (const task of allTasks) {
                    await prisma.task.create({
                        data: {
                            id: task.id,
                            userId: DEMO_USER_ID,
                            goalId: task.goalId,
                            title: task.title,
                            description: task.description,
                            dayIndex: task.dayIndex,
                            scheduledDate: new Date(task.scheduledDate),
                            estimatedMinutes: task.estimatedMinutes,
                            startTime: task.startTime,
                            status: task.status,
                            difficulty: task.difficulty,
                        },
                    });
                }
                console.log("Tasks saved to database");
            } catch (dbError) {
                console.warn("Task save to database failed:", dbError instanceof Error ? dbError.message : dbError);
            }
        }

        // Create initial snapshot in in-memory store
        store.addSnapshot({
            id: `snap-${Date.now()}`,
            createdAt: new Date().toISOString(),
            tasks: allTasks,
            goals: goalsToCreate,
            label: "initial",
            reason: "Initial plan generated",
            agentActions: store.getAgentActions(),
        });

        console.log("Snapshot created");
        console.log(`=== Generate Plan API Success (Database: ${usedDatabase ? "Yes" : "No - Using In-Memory"}) ===`);

        return NextResponse.json({
            success: true,
            goals: goalsToCreate,
            tasks: allTasks,
            reasoningSteps: allReasoningSteps,
            message: `Generated ${allTasks.length} tasks for ${goalsToCreate.length} goals`,
            storageMode: usedDatabase ? "database" : "in-memory",
        });
    } catch (error) {
        console.error("=== Generate Plan API Error ===");
        console.error("Error:", error instanceof Error ? error.message : String(error));

        return NextResponse.json(
            { error: "Failed to generate plan", details: error instanceof Error ? error.message : String(error) },
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
