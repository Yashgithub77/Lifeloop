import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
    try {
        const { tasks, goals, fitnessData } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({
                insight: "💡 Keep up the great work! Every task completed brings you closer to your goals.",
                mood: "okay",
                tip: "Try breaking large tasks into smaller chunks for easier completion.",
                isAI: false,
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const todayTasks = tasks.filter((t: any) => t.dayIndex === 0);
        const completed = todayTasks.filter((t: any) => t.status === "done");
        const pending = todayTasks.filter((t: any) => t.status === "pending");
        const completionRate = todayTasks.length > 0
            ? Math.round((completed.length / todayTasks.length) * 100)
            : 0;

        const prompt = `You are a motivational AI coach analyzing a user's daily productivity.

Today's Stats:
- Tasks completed: ${completed.length}/${todayTasks.length}
- Completion rate: ${completionRate}%
- Active goals: ${goals.length}

Completed tasks:
${completed.slice(0, 5).map((t: any) => `- ${t.title} (${t.estimatedMinutes} mins)`).join('\n')}

Pending tasks:
${pending.slice(0, 3).map((t: any) => `- ${t.title}`).join('\n')}

${fitnessData ? `Fitness: ${fitnessData.steps}/${fitnessData.stepsGoal} steps today` : ''}

Generate a JSON response with:
1. "insight" - A short motivational message (1 sentence, max 100 chars)
2. "mood" - One of: "great", "good", "okay", "low", "tired"
3. "tip" - One actionable tip for tomorrow (1 sentence)

Be:
- Encouraging but realistic
- Specific to their actual performance
- Actionable

Return ONLY valid JSON:
{
  "insight": "...",
  "mood": "...",
  "tip": "..."
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON in AI response");
        }

        const aiResponse = JSON.parse(jsonMatch[0]);

        return NextResponse.json({
            ...aiResponse,
            isAI: true,
        });

    } catch (error) {
        console.error("AI insights error:", error);

        // Fallback response
        return NextResponse.json({
            insight: "💡 Making progress every day! Keep the momentum going.",
            mood: "good",
            tip: "Focus on your most important task first thing tomorrow.",
            isAI: false,
        });
    }
}
