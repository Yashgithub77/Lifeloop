import { GoogleGenerativeAI } from "@google/generative-ai";
import { Goal, Task } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface AITaskGenerationInput {
    goals: Goal[];
    userContext?: {
        collegeHours?: { start: string; end: string };
        sleepHours?: { start: string; end: string };
        dailyAvailableMinutes?: number;
    };
}

interface AITaskSuggestion {
    title: string;
    description: string;
    estimatedMinutes: number;
    difficulty: "easy" | "medium" | "hard";
    goalId: string;
    dayIndex: number;
    startTime: string;
}

export async function generateTasksWithAI(input: AITaskGenerationInput): Promise<AITaskSuggestion[]> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are an AI life planning assistant. Generate a detailed study/work plan based on these goals:

${input.goals.map((g, i) => `
Goal ${i + 1}: ${g.title}
- Description: ${g.description}
- Category: ${g.category}
- Target: ${g.targetValue} ${g.unit} in ${g.targetWeeks} weeks
`).join('\n')}

User Context:
- College Hours: ${input.userContext?.collegeHours?.start} - ${input.userContext?.collegeHours?.end}
- Sleep Hours: ${input.userContext?.sleepHours?.start} - ${input.userContext?.sleepHours?.end}
- Daily Available Minutes: ${input.userContext?.dailyAvailableMinutes}

Generate a 7-day plan with specific tasks. For each task, provide:
1. Title (specific and actionable)
2. Description (what exactly to do)
3. Estimated minutes (realistic)
4. Difficulty (easy/medium/hard)
5. Which goal it belongs to (use goal index 0, 1, etc.)
6. Which day (0-6, where 0 is today)
7. Start time (HH:MM format, avoid college and sleep hours)

Return ONLY valid JSON array in this exact format:
[
  {
    "title": "Review Chapter 1: Introduction to ML",
    "description": "Read and take notes on supervised vs unsupervised learning",
    "estimatedMinutes": 45,
    "difficulty": "medium",
    "goalIndex": 0,
    "dayIndex": 0,
    "startTime": "18:00"
  }
]

Generate 20-30 tasks covering all goals. Make it realistic and achievable.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error("AI response did not contain valid JSON");
        }

        const aiTasks: Array<{
            title: string;
            description: string;
            estimatedMinutes: number;
            difficulty: "easy" | "medium" | "hard";
            goalIndex: number;
            dayIndex: number;
            startTime: string;
        }> = JSON.parse(jsonMatch[0]);

        // Map goalIndex to actual goalId
        return aiTasks.map(task => ({
            ...task,
            goalId: input.goals[task.goalIndex]?.id || input.goals[0].id,
        })).filter(task => task.goalId); // Filter out invalid tasks

    } catch (error) {
        console.error("AI task generation error:", error);
        throw new Error("Failed to generate tasks with AI: " + (error instanceof Error ? error.message : String(error)));
    }
}

export async function generateDailyInsight(completedTasks: Task[], totalTasks: Task[]): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are a motivational AI coach. Analyze today's productivity:

Completed: ${completedTasks.length}/${totalTasks.length} tasks
Completion rate: ${Math.round((completedTasks.length / totalTasks.length) * 100)}%

Tasks completed:
${completedTasks.map(t => `- ${t.title} (${t.estimatedMinutes} mins)`).join('\n')}

Generate a SHORT motivational message (1-2 sentences) that:
1. Acknowledges their progress
2. Provides encouragement
3. Gives a specific tip for tomorrow

Be positive and personal.`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("AI insight generation error:", error);
        return "Great work today! Keep the momentum going tomorrow.";
    }
}

export async function generateSmartReschedule(
    skippedTask: Task,
    existingTasks: Task[]
): Promise<{ newDayIndex: number; newStartTime: string; reason: string }> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `A user skipped this task:
Task: ${skippedTask.title}
Original day: Day ${skippedTask.dayIndex}
Original time: ${skippedTask.startTime}
Duration: ${skippedTask.estimatedMinutes} mins

Existing tasks for the week:
${existingTasks.map(t => `Day ${t.dayIndex} at ${t.startTime}: ${t.title} (${t.estimatedMinutes} mins)`).join('\n')}

Suggest the best time to reschedule this task. Avoid conflicts and consider user's likely availability.

Return ONLY valid JSON:
{
  "newDayIndex": 1,
  "newStartTime": "19:00",
  "reason": "Tomorrow evening has a gap and aligns with your productive hours"
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error("No valid JSON in response");
        }

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error("AI reschedule error:", error);
        // Fallback to simple next-day logic
        return {
            newDayIndex: (skippedTask.dayIndex + 1) % 7,
            newStartTime: skippedTask.startTime,
            reason: "Moved to next day at same time",
        };
    }
}
