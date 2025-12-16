import { NextRequest, NextResponse } from "next/server";
import { store } from "@/data/store";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { adjustmentId } = body;

        if (!adjustmentId) {
            return NextResponse.json(
                { error: "Adjustment ID required" },
                { status: 400 }
            );
        }

        const adjustment = store.applyMicroAdjustment(adjustmentId);

        if (!adjustment) {
            return NextResponse.json(
                { error: "Adjustment not found" },
                { status: 404 }
            );
        }

        // Apply the adjustment effect based on type
        const tasks = store.getTasks();
        let updatedTasks = [...tasks];

        switch (adjustment.type) {
            case "shorten_session":
                // Reduce all future task durations by 25%
                updatedTasks = tasks.map((t) => ({
                    ...t,
                    estimatedMinutes: t.dayIndex > 0 ? Math.floor(t.estimatedMinutes * 0.75) : t.estimatedMinutes,
                }));
                store.setTasks(updatedTasks);
                break;

            case "reduce_difficulty":
                // Reorder tomorrow's tasks to put easier ones first
                const tomorrowTasks = tasks.filter((t) => t.dayIndex === 1);
                const otherTasks = tasks.filter((t) => t.dayIndex !== 1);
                const sortedTomorrow = tomorrowTasks.sort((a, b) => {
                    const diffOrder = { easy: 0, medium: 1, hard: 2 };
                    return (diffOrder[a.difficulty] || 1) - (diffOrder[b.difficulty] || 1);
                });
                // Reassign start times
                let currentTime = "18:00";
                sortedTomorrow.forEach((task) => {
                    task.startTime = currentTime;
                    const [h, m] = currentTime.split(":").map(Number);
                    const newMinutes = m + task.estimatedMinutes + 10;
                    currentTime = `${String(h + Math.floor(newMinutes / 60)).padStart(2, "0")}:${String(newMinutes % 60).padStart(2, "0")}`;
                });
                store.setTasks([...otherTasks, ...sortedTomorrow]);
                break;

            case "reschedule":
                // Move late tasks to earlier slots
                updatedTasks = tasks.map((t) => {
                    if (t.dayIndex > 0 && parseInt(t.startTime.split(":")[0]) >= 21) {
                        return { ...t, startTime: "18:00" };
                    }
                    return t;
                });
                store.setTasks(updatedTasks);
                break;

            case "add_break":
                // Increase gap between tasks (handled client-side for display)
                break;

            case "motivational":
                // No actual task changes, just encouragement
                break;
        }

        return NextResponse.json({
            success: true,
            adjustment,
            tasks: store.getTasks(),
            message: `Applied: ${adjustment.title}`,
        });
    } catch (error) {
        console.error("Error applying adjustment:", error);
        return NextResponse.json(
            { error: "Failed to apply adjustment" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const adjustments = store.getMicroAdjustments();
        return NextResponse.json({ adjustments });
    } catch (error) {
        console.error("Error fetching adjustments:", error);
        return NextResponse.json(
            { error: "Failed to fetch adjustments" },
            { status: 500 }
        );
    }
}
