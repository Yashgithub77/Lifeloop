import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { status, actualMinutes, notes } = body;

        // Find the task
        const task = await prisma.task.findUnique({
            where: { id },
            include: { goal: true },
        });

        if (!task) {
            return NextResponse.json(
                { error: "Task not found" },
                { status: 404 }
            );
        }

        // Update task
        const updateData: {
            status?: string;
            actualMinutes?: number;
            notes?: string;
            completedAt?: Date | null;
        } = {};

        if (status !== undefined) {
            updateData.status = status;
            if (status === "done") {
                updateData.completedAt = new Date();
            } else if (status === "pending") {
                updateData.completedAt = null;
            }
        }

        if (actualMinutes !== undefined) {
            updateData.actualMinutes = actualMinutes;
        }

        if (notes !== undefined) {
            updateData.notes = notes;
        }

        const updatedTask = await prisma.task.update({
            where: { id },
            data: updateData,
        });

        // If task completed, update goal progress
        if (status === "done" && task.goal) {
            const completedTasksCount = await prisma.task.count({
                where: {
                    goalId: task.goalId,
                    status: "done",
                },
            });

            // Update goal's current value based on completed tasks
            await prisma.goal.update({
                where: { id: task.goalId },
                data: {
                    currentValue: completedTasksCount,
                },
            });
        }

        // Log agent action
        await prisma.agentAction.create({
            data: {
                userId: task.userId,
                type: "check_progress",
                title: status === "done" ? "Task Completed" : "Task Updated",
                description: `Task "${task.title}" marked as ${status}`,
                status: "completed",
                duration: 100,
            },
        });

        return NextResponse.json({
            success: true,
            task: {
                ...updatedTask,
                scheduledDate: updatedTask.scheduledDate.toISOString(),
                completedAt: updatedTask.completedAt?.toISOString() ?? null,
                createdAt: updatedTask.createdAt.toISOString(),
                updatedAt: updatedTask.updatedAt.toISOString(),
            },
        });
    } catch (error) {
        console.error("Error updating task:", error);
        return NextResponse.json(
            { error: "Failed to update task", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
