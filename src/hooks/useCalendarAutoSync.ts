import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Task } from "@/types";

export function useCalendarAutoSync(tasks: Task[]) {
    const { data: session } = useSession();
    const previousTasksRef = useRef<Task[]>([]);
    const isSyncingRef = useRef(false);

    useEffect(() => {
        if (!session || !tasks || tasks.length === 0 || isSyncingRef.current) {
            return;
        }

        const previousTasks = previousTasksRef.current;

        // Check if tasks have changed
        const hasTasksChanged = tasks.length !== previousTasks.length ||
            tasks.some((task, index) => {
                const prevTask = previousTasks[index];
                return !prevTask ||
                    task.id !== prevTask.id ||
                    task.title !== prevTask.title ||
                    task.scheduledDate !== prevTask.scheduledDate ||
                    task.startTime !== prevTask.startTime ||
                    task.status !== prevTask.status;
            });

        if (hasTasksChanged && previousTasks.length > 0) {
            // Tasks have changed, trigger sync
            syncToCalendar();
        }

        // Update ref
        previousTasksRef.current = JSON.parse(JSON.stringify(tasks));
    }, [tasks, session]);

    const syncToCalendar = async () => {
        if (isSyncingRef.current) return;

        isSyncingRef.current = true;

        try {
            console.log("🔄 Auto-syncing tasks to Google Calendar...");

            const response = await fetch("/api/calendar/push", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}), // Push all pending tasks
            });

            const data = await response.json();

            if (response.ok) {
                console.log(`✅ Synced ${data.pushedCount} tasks to Google Calendar`);
            } else {
                console.warn("⚠️ Calendar sync failed:", data.error);
            }
        } catch (error) {
            console.error("❌ Calendar sync error:", error);
        } finally {
            isSyncingRef.current = false;
        }
    };

    return { syncToCalendar };
}
