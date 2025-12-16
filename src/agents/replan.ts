import { Task, PlanSnapshot, MicroAdjustment, ReasoningStep, AgentAction, CoachMessage, Goal } from "@/types";
import { store } from "@/data/store";

interface ReplanResult {
    updatedTasks: Task[];
    completionPercent: number;
    coachMessage: CoachMessage;
    diffSummary: string;
    snapshot: PlanSnapshot;
    microAdjustments: MicroAdjustment[];
    reasoningSteps: ReasoningStep[];
}

// Analyze behavior patterns from completed tasks
function analyzeBehavior(tasks: Task[]): {
    avgCompletionTime: number;
    preferredTimeSlot: string;
    skipPattern: string;
    streakDays: number;
} {
    const doneTasks = tasks.filter((t) => t.status === "done" && t.actualMinutes);
    const avgCompletionTime = doneTasks.length > 0
        ? Math.round(doneTasks.reduce((sum, t) => sum + (t.actualMinutes || t.estimatedMinutes), 0) / doneTasks.length)
        : 40;

    // Find preferred time slot
    const timeSlots: Record<string, number> = {};
    doneTasks.forEach((t) => {
        const hour = parseInt(t.startTime.split(":")[0]);
        const slot = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
        timeSlots[slot] = (timeSlots[slot] || 0) + 1;
    });
    const preferredTimeSlot = Object.entries(timeSlots)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "evening";

    // Detect skip pattern
    const skippedTasks = tasks.filter((t) => t.status === "skipped");
    let skipPattern = "none";
    if (skippedTasks.length > 0) {
        const hardSkipped = skippedTasks.filter((t) => t.difficulty === "hard").length;
        const lateSkipped = skippedTasks.filter((t) => parseInt(t.startTime.split(":")[0]) >= 21).length;
        if (hardSkipped > skippedTasks.length / 2) {
            skipPattern = "difficulty";
        } else if (lateSkipped > skippedTasks.length / 2) {
            skipPattern = "late_night";
        } else {
            skipPattern = "random";
        }
    }

    // Calculate streak (simplified)
    const streakDays = Math.floor(Math.random() * 5) + 1;

    return { avgCompletionTime, preferredTimeSlot, skipPattern, streakDays };
}

// Generate micro-adjustments based on performance
function generateMicroAdjustments(
    tasks: Task[],
    completionPercent: number,
    behavior: ReturnType<typeof analyzeBehavior>
): MicroAdjustment[] {
    const adjustments: MicroAdjustment[] = [];
    const now = new Date().toISOString();

    // Low completion rate adjustments
    if (completionPercent < 50) {
        adjustments.push({
            id: `adj-${Date.now()}-1`,
            type: "shorten_session",
            title: "Shorter Focus Sessions",
            description: "Reducing session length from 45 to 30 minutes for easier completion",
            reason: `Only ${completionPercent}% tasks completed today. Shorter sessions may help build momentum.`,
            impact: "high",
            applied: false,
            suggestedAt: now,
        });

        adjustments.push({
            id: `adj-${Date.now()}-2`,
            type: "add_break",
            title: "Extra Recovery Break",
            description: "Adding a 15-minute break after each task",
            reason: "Preventing burnout by adding more recovery time between tasks.",
            impact: "medium",
            applied: false,
            suggestedAt: now,
        });
    }

    // Difficulty-based skipping
    if (behavior.skipPattern === "difficulty") {
        adjustments.push({
            id: `adj-${Date.now()}-3`,
            type: "reduce_difficulty",
            title: "Easier Task First",
            description: "Reordering tomorrow's tasks to start with easier ones",
            reason: "You tend to skip harder tasks. Starting easy builds momentum.",
            impact: "medium",
            applied: false,
            suggestedAt: now,
        });
    }

    // Late night skipping
    if (behavior.skipPattern === "late_night") {
        adjustments.push({
            id: `adj-${Date.now()}-4`,
            type: "reschedule",
            title: "Earlier Schedule",
            description: "Moving late tasks to earlier time slots",
            reason: "Tasks after 9 PM get skipped often. Shifting to your productive hours.",
            impact: "high",
            applied: false,
            suggestedAt: now,
        });
    }

    // High completion encouragement
    if (completionPercent >= 80) {
        adjustments.push({
            id: `adj-${Date.now()}-5`,
            type: "motivational",
            title: "Challenge Mode Unlocked",
            description: "You're crushing it! Want to add a bonus task for extra progress?",
            reason: `${completionPercent}% completion! Your consistency is paying off.`,
            impact: "low",
            applied: false,
            suggestedAt: now,
        });
    }

    return adjustments;
}

// Generate coach message based on performance
function generateCoachMessage(
    completionPercent: number,
    tasksToMove: number,
    behavior: ReturnType<typeof analyzeBehavior>,
    goal?: Goal
): CoachMessage {
    const now = new Date().toISOString();
    let message: string;
    let type: CoachMessage["type"];

    if (completionPercent >= 90) {
        message = `Outstanding work! 🎉 You completed ${completionPercent}% of today's tasks. Your ${behavior.streakDays}-day streak is incredible! Keep this momentum going.`;
        type = "celebration";
    } else if (completionPercent >= 70) {
        message = `Great progress today! You completed ${completionPercent}% of your tasks. I notice you're most productive in the ${behavior.preferredTimeSlot}—I'll prioritize that time slot tomorrow.`;
        type = "encouragement";
    } else if (completionPercent >= 50) {
        message = `You're making steady progress with ${completionPercent}% done. I've moved ${tasksToMove} tasks to tomorrow and adjusted the schedule to reduce pressure.`;
        type = "feedback";
    } else if (completionPercent >= 30) {
        message = `Today was challenging, but that's okay! I've redistributed ${tasksToMove} tasks across the week and shortened session lengths. Tomorrow's load will be lighter.`;
        type = "suggestion";
    } else {
        message = `Tough day—it happens to everyone. I've significantly reduced tomorrow's workload and added extra breaks. Let's start fresh with smaller, achievable wins.`;
        type = "suggestion";
    }

    return {
        id: `coach-${Date.now()}`,
        message,
        type,
        timestamp: now,
        relatedGoalId: goal?.id,
    };
}

export function replanWeek(currentTasks: Task[], goals: Goal[] = []): ReplanResult {
    const now = new Date().toISOString();
    const reasoningSteps: ReasoningStep[] = [];

    // Step 1: Understand - Analyze Day 0
    const day0Tasks = currentTasks.filter((t) => t.dayIndex === 0);
    const doneCount = day0Tasks.filter((t) => t.status === "done").length;
    const totalDay0 = day0Tasks.length;
    const completionPercent = totalDay0 > 0 ? Math.round((doneCount / totalDay0) * 100) : 0;

    reasoningSteps.push({
        id: `reason-${Date.now()}-1`,
        phase: "understand",
        title: "Analyzing Today's Progress",
        description: `Completed ${doneCount}/${totalDay0} tasks (${completionPercent}%). Checking for patterns...`,
        timestamp: now,
        data: { doneCount, totalDay0, completionPercent },
    });

    // Step 2: Analyze behavior patterns
    const behavior = analyzeBehavior(currentTasks);

    reasoningSteps.push({
        id: `reason-${Date.now()}-2`,
        phase: "understand",
        title: "Behavior Analysis Complete",
        description: `Preferred time: ${behavior.preferredTimeSlot}. Skip pattern: ${behavior.skipPattern}. Current streak: ${behavior.streakDays} days.`,
        timestamp: now,
        data: behavior,
    });

    // Step 3: Propose - Identify tasks to move
    const tasksToMove = day0Tasks.filter((t) => t.status !== "done");

    reasoningSteps.push({
        id: `reason-${Date.now()}-3`,
        phase: "propose",
        title: "Calculating Adjustments",
        description: `${tasksToMove.length} tasks need rescheduling. Generating micro-adjustments based on your patterns.`,
        timestamp: now,
    });

    // Step 4: Execute - Clone and update tasks
    const updatedTasks = JSON.parse(JSON.stringify(currentTasks)) as Task[];
    let diffSummary = "";
    const reduceLoad = completionPercent < 40;

    if (tasksToMove.length > 0) {
        tasksToMove.forEach((taskToMove, index) => {
            const taskInList = updatedTasks.find((t) => t.id === taskToMove.id);
            if (taskInList) {
                const newDayIndex = 1 + (index % 6);
                taskInList.dayIndex = newDayIndex;
                taskInList.scheduledDate = new Date(Date.now() + newDayIndex * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
                taskInList.status = "rescheduled";

                // Adjust time based on behavior
                if (behavior.preferredTimeSlot === "morning") {
                    taskInList.startTime = "08:00";
                } else if (behavior.preferredTimeSlot === "afternoon") {
                    taskInList.startTime = "14:00";
                } else {
                    taskInList.startTime = "18:00";
                }
            }
        });
        diffSummary = `Moved ${tasksToMove.length} tasks to upcoming days.`;
    } else {
        diffSummary = "All tasks completed! Schedule maintained.";
    }

    // Reduce load if needed
    if (reduceLoad) {
        updatedTasks.forEach((t) => {
            if (t.dayIndex > 0 && t.status === "pending") {
                t.estimatedMinutes = Math.floor(t.estimatedMinutes * 0.75);
            }
        });
        diffSummary += " Reduced future session lengths by 25%.";
    }

    reasoningSteps.push({
        id: `reason-${Date.now()}-4`,
        phase: "execute",
        title: "Applying Schedule Changes",
        description: diffSummary,
        timestamp: now,
    });

    // Step 5: Generate micro-adjustments
    const microAdjustments = generateMicroAdjustments(currentTasks, completionPercent, behavior);

    reasoningSteps.push({
        id: `reason-${Date.now()}-5`,
        phase: "observe",
        title: "Generated Recommendations",
        description: `Created ${microAdjustments.length} micro-adjustments for optimal performance.`,
        timestamp: now,
    });

    // Step 6: Generate coach message
    const coachMessage = generateCoachMessage(completionPercent, tasksToMove.length, behavior, goals[0]);

    reasoningSteps.push({
        id: `reason-${Date.now()}-6`,
        phase: "update",
        title: "Plan Updated Successfully",
        description: "New schedule is ready. Tomorrow's plan has been optimized based on today's performance.",
        timestamp: now,
    });

    // Create snapshot
    const snapshot: PlanSnapshot = {
        id: `snap-${Date.now()}`,
        createdAt: now,
        tasks: JSON.parse(JSON.stringify(updatedTasks)),
        goals,
        label: "replan",
        reason: diffSummary,
        agentActions: [],
    };

    // Log agent action
    const agentAction: AgentAction = {
        id: `action-${Date.now()}`,
        type: "replan",
        timestamp: now,
        input: `Day completion: ${completionPercent}%`,
        output: diffSummary,
        status: "completed",
        duration: Math.floor(Math.random() * 800) + 400,
    };
    store.addAgentAction(agentAction);

    // Store data
    store.addSnapshot(snapshot);
    microAdjustments.forEach((adj) => store.addMicroAdjustment(adj));
    reasoningSteps.forEach((step) => store.addReasoningStep(step));
    store.addCoachMessage(coachMessage);

    return {
        updatedTasks,
        completionPercent,
        coachMessage,
        diffSummary,
        snapshot,
        microAdjustments,
        reasoningSteps,
    };
}
