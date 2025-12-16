import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { google } from "googleapis";
import { store } from "@/data/store";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.accessToken) {
            return NextResponse.json(
                { error: "Not authenticated. Please sign in with Google." },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { taskIds } = body; // Optional: specific task IDs to push, or push all

        // Get tasks from in-memory store
        let tasks = store.getTasks();
        const goals = store.getGoals();

        if (tasks.length === 0) {
            return NextResponse.json({
                success: false,
                message: "No tasks found. Please generate a plan first.",
                pushedCount: 0,
            });
        }

        // Filter to specific tasks if taskIds provided
        if (taskIds && Array.isArray(taskIds) && taskIds.length > 0) {
            tasks = tasks.filter(t => taskIds.includes(t.id));
        } else {
            // Get only pending/upcoming tasks for today and future
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayStr = today.toISOString().split("T")[0];

            tasks = tasks.filter(t => {
                const taskDate = t.scheduledDate.split("T")[0];
                return taskDate >= todayStr && (t.status === "pending" || t.status === "in_progress");
            });
        }

        if (tasks.length === 0) {
            return NextResponse.json({
                success: true,
                message: "No pending tasks to push to calendar",
                pushedCount: 0,
            });
        }

        // Create OAuth2 client with the access token
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({
            access_token: session.accessToken,
        });

        // Create Calendar API client
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        const pushedEvents = [];
        const errors = [];

        for (const task of tasks) {
            try {
                // Find the goal for this task
                const goal = goals.find(g => g.id === task.goalId);

                // Calculate start and end times
                const startDate = new Date(task.scheduledDate);
                const [hours, minutes] = task.startTime.split(":").map(Number);
                startDate.setHours(hours, minutes, 0, 0);

                const endDate = new Date(startDate);
                endDate.setMinutes(endDate.getMinutes() + task.estimatedMinutes);

                // Create calendar event
                const event = {
                    summary: `📚 ${task.title}`,
                    description: `${task.description || ""}\n\n🎯 Goal: ${goal?.title || "Personal"}\n⏱️ Duration: ${task.estimatedMinutes} minutes\n📊 Difficulty: ${task.difficulty}\n\n— Created by LifeLoop`,
                    start: {
                        dateTime: startDate.toISOString(),
                        timeZone: "Asia/Kolkata",
                    },
                    end: {
                        dateTime: endDate.toISOString(),
                        timeZone: "Asia/Kolkata",
                    },
                    colorId: getColorId(goal?.category || "Study"),
                    reminders: {
                        useDefault: false,
                        overrides: [
                            { method: "popup", minutes: 10 },
                        ],
                    },
                };

                const response = await calendar.events.insert({
                    calendarId: "primary",
                    requestBody: event,
                });

                pushedEvents.push({
                    taskId: task.id,
                    taskTitle: task.title,
                    eventId: response.data.id,
                    eventLink: response.data.htmlLink,
                });

            } catch (error) {
                console.error(`Error pushing task ${task.id}:`, error);
                errors.push({
                    taskId: task.id,
                    taskTitle: task.title,
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Pushed ${pushedEvents.length} tasks to Google Calendar`,
            pushedCount: pushedEvents.length,
            pushedEvents,
            errors: errors.length > 0 ? errors : undefined,
        });

    } catch (error) {
        console.error("Error pushing to calendar:", error);

        if (error instanceof Error) {
            if (error.message.includes("invalid_grant") || error.message.includes("Token has been expired")) {
                return NextResponse.json(
                    { error: "Calendar access expired. Please sign in again." },
                    { status: 401 }
                );
            }
        }

        return NextResponse.json(
            { error: "Failed to push tasks to calendar", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// Map goal categories to Google Calendar color IDs
function getColorId(category: string): string {
    const colorMap: Record<string, string> = {
        Study: "9",      // Purple/Blue
        Fitness: "10",   // Green
        Health: "11",    // Red
        Project: "5",    // Yellow
        Career: "7",     // Cyan
        Personal: "3",   // Purple
    };
    return colorMap[category] || "9";
}
