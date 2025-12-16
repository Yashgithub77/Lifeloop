import { NextResponse } from "next/server";
import { store } from "@/data/store";

// Try to import prisma, but don't fail if database is unavailable
let prisma: typeof import("@/lib/prisma").default | null = null;
try {
    prisma = require("@/lib/prisma").default;
} catch {
    console.warn("Prisma not available, using in-memory store");
}

const DEMO_USER_ID = "demo-user-001";

export async function GET() {
    try {
        // First, try to get data from in-memory store
        const inMemoryGoals = store.getGoals();
        const inMemoryTasks = store.getTasks();

        // If we have in-memory data, use it
        if (inMemoryGoals.length > 0 || inMemoryTasks.length > 0) {
            console.log("Using in-memory store data");
            return getInMemoryResponse();
        }

        // Try database if available
        if (prisma) {
            try {
                const user = await prisma.user.findUnique({
                    where: { id: DEMO_USER_ID },
                });

                if (!user) {
                    return NextResponse.json(
                        { error: "No plan found. Please set up your goals first." },
                        { status: 404 }
                    );
                }

                // Fetch from database
                const [goals, tasks, agentActions, behaviorPatterns, dailyInsights, fitnessData, calendarEvents, coachMessages] = await Promise.all([
                    prisma.goal.findMany({ where: { userId: DEMO_USER_ID }, orderBy: { createdAt: "desc" } }),
                    prisma.task.findMany({ where: { userId: DEMO_USER_ID }, orderBy: { scheduledDate: "asc" } }),
                    prisma.agentAction.findMany({ where: { userId: DEMO_USER_ID }, orderBy: { timestamp: "desc" }, take: 50 }),
                    prisma.behaviorPattern.findMany({ where: { userId: DEMO_USER_ID }, orderBy: { detectedAt: "desc" } }),
                    prisma.dailyInsight.findMany({ where: { userId: DEMO_USER_ID }, orderBy: { date: "desc" }, take: 7 }),
                    prisma.fitnessData.findMany({ where: { userId: DEMO_USER_ID }, orderBy: { date: "desc" }, take: 7 }),
                    prisma.calendarEvent.findMany({ where: { userId: DEMO_USER_ID }, orderBy: { start: "asc" } }),
                    prisma.coachMessage.findMany({ where: { userId: DEMO_USER_ID }, orderBy: { timestamp: "desc" }, take: 10 }),
                ]);

                if (goals.length === 0 && tasks.length === 0) {
                    return NextResponse.json(
                        { error: "No plan found. Please set up your goals first." },
                        { status: 404 }
                    );
                }

                console.log("Using database data");
                return getDatabaseResponse(goals, tasks, agentActions, behaviorPatterns, dailyInsights, fitnessData, calendarEvents, coachMessages);
            } catch (dbError) {
                console.warn("Database fetch failed, trying in-memory:", dbError instanceof Error ? dbError.message : dbError);
            }
        }

        // Fallback to in-memory if database failed
        if (inMemoryGoals.length > 0 || inMemoryTasks.length > 0) {
            console.log("Fallback to in-memory store data");
            return getInMemoryResponse();
        }

        return NextResponse.json(
            { error: "No plan found. Please set up your goals first." },
            { status: 404 }
        );
    } catch (error) {
        console.error("Error fetching dashboard:", error);
        return NextResponse.json(
            { error: "Failed to fetch dashboard data", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

function getInMemoryResponse() {
    const goals = store.getGoals();
    const tasks = store.getTasks();
    const agentActions = store.getAgentActions();
    const behaviorPatterns = store.getBehaviorPatterns();
    const dailyInsights = store.getDailyInsights();
    const fitnessData = store.getFitnessData();
    const calendarEvents = store.getCalendarEvents();
    const coachMessages = store.getCoachMessages();
    const integrations = store.getIntegrations();

    // Calculate task statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    const todayTasks = tasks.filter((t) => {
        const taskDate = t.scheduledDate.split("T")[0];
        return taskDate === todayStr;
    });
    const completedToday = todayTasks.filter((t) => t.status === "done").length;
    const completionPercent = todayTasks.length > 0
        ? Math.round((completedToday / todayTasks.length) * 100)
        : 0;

    const latestInsight = dailyInsights.length > 0 ? dailyInsights[0] : null;
    const todayFitness = fitnessData || null;

    return NextResponse.json({
        goals,
        tasks,
        goal: goals[0],
        completionPercent,
        hasReplanned: false,
        agentActions,
        reasoningSteps: store.getReasoningSteps(),
        microAdjustments: store.getMicroAdjustments(),
        coachMessages,
        behaviorPatterns,
        dailyInsights,
        latestInsight,
        fitnessData: fitnessData ? [fitnessData] : [],
        todayFitness,
        integrations,
        calendarEvents,
        snapshots: store.getSnapshots(),
        storageMode: "in-memory",
    });
}

function getDatabaseResponse(
    goals: unknown[],
    tasks: unknown[],
    agentActions: unknown[],
    behaviorPatterns: unknown[],
    dailyInsights: unknown[],
    fitnessData: unknown[],
    calendarEvents: unknown[],
    coachMessages: unknown[]
) {
    // Calculate task statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    interface TaskWithDate {
        scheduledDate: Date;
        status: string;
    }

    const todayTasks = (tasks as TaskWithDate[]).filter((t) => {
        const taskDate = new Date(t.scheduledDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
    });
    const completedToday = todayTasks.filter((t) => t.status === "done").length;
    const completionPercent = todayTasks.length > 0
        ? Math.round((completedToday / todayTasks.length) * 100)
        : 0;

    // Format dates for JSON response
    interface GoalRecord {
        createdAt: Date;
        updatedAt: Date;
        deadline?: Date | null;
    }

    interface TaskRecord {
        scheduledDate: Date;
        completedAt?: Date | null;
        createdAt: Date;
        updatedAt: Date;
        dayIndex: number;
    }

    interface ActionRecord {
        timestamp: Date;
    }

    interface PatternRecord {
        detectedAt: Date;
    }

    interface InsightRecord {
        date: Date;
    }

    interface FitnessRecord {
        date: Date;
    }

    interface EventRecord {
        start: Date;
        end: Date;
    }

    interface MessageRecord {
        timestamp: Date;
    }

    const formattedGoals = (goals as GoalRecord[]).map((g) => ({
        ...g,
        createdAt: g.createdAt.toISOString(),
        updatedAt: g.updatedAt.toISOString(),
        deadline: g.deadline?.toISOString() ?? null,
    }));

    const formattedTasks = (tasks as TaskRecord[]).map((t) => ({
        ...t,
        scheduledDate: t.scheduledDate.toISOString(),
        completedAt: t.completedAt?.toISOString() ?? null,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        dayIndex: t.dayIndex,
    }));

    const formattedAgentActions = (agentActions as ActionRecord[]).map((a) => ({
        ...a,
        timestamp: a.timestamp.toISOString(),
    }));

    const formattedBehaviorPatterns = (behaviorPatterns as PatternRecord[]).map((p) => ({
        ...p,
        detectedAt: p.detectedAt.toISOString(),
    }));

    const formattedDailyInsights = (dailyInsights as InsightRecord[]).map((i) => ({
        ...i,
        date: i.date.toISOString().split("T")[0],
    }));

    const formattedFitnessData = (fitnessData as FitnessRecord[]).map((f) => ({
        ...f,
        date: f.date.toISOString().split("T")[0],
    }));

    const formattedCalendarEvents = (calendarEvents as EventRecord[]).map((e) => ({
        ...e,
        start: e.start.toISOString(),
        end: e.end.toISOString(),
    }));

    const formattedCoachMessages = (coachMessages as MessageRecord[]).map((m) => ({
        ...m,
        timestamp: m.timestamp.toISOString(),
    }));

    const todayFitness = formattedFitnessData.length > 0 ? formattedFitnessData[0] : null;
    const latestInsight = formattedDailyInsights.length > 0 ? formattedDailyInsights[0] : null;

    return NextResponse.json({
        goals: formattedGoals,
        tasks: formattedTasks,
        goal: formattedGoals[0],
        completionPercent,
        hasReplanned: false,
        agentActions: formattedAgentActions,
        reasoningSteps: [],
        microAdjustments: [],
        coachMessages: formattedCoachMessages,
        behaviorPatterns: formattedBehaviorPatterns,
        dailyInsights: formattedDailyInsights,
        latestInsight,
        fitnessData: formattedFitnessData,
        todayFitness,
        integrations: [],
        calendarEvents: formattedCalendarEvents,
        snapshots: [],
        storageMode: "database",
    });
}
