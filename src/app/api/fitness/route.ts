import { NextRequest, NextResponse } from "next/server";
import { store } from "@/data/store";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { steps } = body;

        if (typeof steps !== "number" || steps < 0) {
            return NextResponse.json(
                { error: "Invalid steps value" },
                { status: 400 }
            );
        }

        // Update today's fitness data
        store.updateTodaySteps(steps);

        // Update fitness goal progress
        const goals = store.getGoals();
        const fitnessGoal = goals.find((g) => g.category === "Fitness");
        if (fitnessGoal) {
            store.updateGoal(fitnessGoal.id, { currentValue: steps });
        }

        const todayFitness = store.getTodayFitness();

        return NextResponse.json({
            success: true,
            fitnessData: todayFitness,
            goals: store.getGoals(),
        });
    } catch (error) {
        console.error("Error updating fitness:", error);
        return NextResponse.json(
            { error: "Failed to update fitness data" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const fitnessData = store.getFitnessData();
        const todayFitness = store.getTodayFitness();

        return NextResponse.json({
            history: fitnessData,
            today: todayFitness,
        });
    } catch (error) {
        console.error("Error fetching fitness:", error);
        return NextResponse.json(
            { error: "Failed to fetch fitness data" },
            { status: 500 }
        );
    }
}
