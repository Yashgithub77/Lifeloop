import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { store } from "@/data/store";

export async function POST(req: NextRequest) {
    try {
        const { message, tasks, goals } = await req.json();

        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        // If no API key, return helpful message
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({
                response: "AI chat is not configured. Please add GEMINI_API_KEY to your environment variables.",
                isAI: false,
            });
        }

        // Create AI instance only when we have a key
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Build context from user's current state
        const context = buildContext(tasks, goals);

        const prompt = `You are LifeLoop AI, a helpful and motivating life planning assistant. 

User's Current Context:
${context}

User's Message: ${message}

Provide a helpful, concise response (2-3 sentences max). Be:
- Friendly and encouraging
- Specific to their goals and tasks when relevant
- Actionable - give concrete advice
- Brief - don't ramble

Response:`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        return NextResponse.json({
            response,
            isAI: true,
        });
    } catch (error) {
        console.error("AI chat error:", error);
        return NextResponse.json(
            {
                error: "Failed to get AI response",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}

function buildContext(tasks: any[], goals: any[]): string {
    const todayTasks = tasks?.filter(t => t.dayIndex === 0) || [];
    const completed = todayTasks.filter(t => t.status === "done").length;
    const pending = todayTasks.filter(t => t.status === "pending").length;

    const goalsList = goals?.map(g => `- ${g.title} (${g.category})`).join('\n') || "No goals set";

    return `
Goals:
${goalsList}

Today's Progress:
- Total tasks: ${todayTasks.length}
- Completed: ${completed}
- Pending: ${pending}
- Completion rate: ${todayTasks.length > 0 ? Math.round((completed / todayTasks.length) * 100) : 0}%
`;
}
