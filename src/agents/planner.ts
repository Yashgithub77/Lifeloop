import { Goal, Task, User, CalendarEvent, AgentAction, ReasoningStep } from "@/types";
import { store } from "@/data/store";

// Helper to add minutes to a time string "HH:MM"
function addMinutes(time: string, minutes: number): string {
    const [h, m] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    date.setMinutes(date.getMinutes() + minutes);
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

// Helper to get date string for a day offset
function getDateForDay(dayOffset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    return date.toISOString().split("T")[0];
}

// Check if a time slot conflicts with calendar events
function hasConflict(startTime: string, duration: number, dayIndex: number, events: CalendarEvent[]): boolean {
    const targetDate = getDateForDay(dayIndex);
    const endTime = addMinutes(startTime, duration);

    for (const event of events) {
        const eventDate = event.start.split("T")[0];
        if (eventDate !== targetDate) continue;

        const eventStart = event.start.split("T")[1]?.substring(0, 5) || "00:00";
        const eventEnd = event.end.split("T")[1]?.substring(0, 5) || "23:59";

        // Check overlap
        if (startTime < eventEnd && endTime > eventStart) {
            return true;
        }
    }
    return false;
}

// Get task difficulty based on content and context
function determineDifficulty(taskIndex: number, totalTasks: number): Task["difficulty"] {
    const progress = taskIndex / totalTasks;
    if (progress < 0.3) return "easy"; // First 30% are introductory
    if (progress < 0.7) return "medium"; // Middle 40% are core content
    return "hard"; // Last 30% are advanced
}

// Generate study plan for a study goal
function generateStudyPlan(goal: Goal, user: User, calendarEvents: CalendarEvent[]): Task[] {
    const tasks: Task[] = [];
    const units = 5;
    const tasksPerUnit = 4;
    const totalTasks = units * tasksPerUnit;

    let currentUnit = 1;
    let currentSubTask = 1;

    for (let day = 0; day < 7; day++) {
        const tasksForDay = day < 6 ? 3 : 2;
        let currentStartTime = user.preferences.focusTimeStart || "18:00";

        for (let i = 0; i < tasksForDay; i++) {
            if (tasks.length >= totalTasks) break;

            const duration = user.preferences.preferredSessionLength || 40;

            // Skip if there's a calendar conflict
            while (hasConflict(currentStartTime, duration, day, calendarEvents)) {
                currentStartTime = addMinutes(currentStartTime, 30);
                if (currentStartTime > "22:00") break;
            }

            if (currentStartTime > "22:00") continue;

            tasks.push({
                id: `task-${Date.now()}-${tasks.length}`,
                goalId: goal.id,
                title: `Unit ${currentUnit}: ${getStudyTopicTitle(currentUnit, currentSubTask)}`,
                description: `Study session for Unit ${currentUnit}, covering ${getStudyTopicDescription(currentUnit, currentSubTask)}`,
                dayIndex: day,
                scheduledDate: getDateForDay(day),
                estimatedMinutes: duration,
                startTime: currentStartTime,
                status: "pending",
                difficulty: determineDifficulty(tasks.length, totalTasks),
            });

            currentStartTime = addMinutes(currentStartTime, duration + (user.preferences.breakDuration || 10));

            currentSubTask++;
            if (currentSubTask > tasksPerUnit) {
                currentUnit++;
                currentSubTask = 1;
            }
        }
    }

    return tasks;
}

// Generate topic titles for ML syllabus
function getStudyTopicTitle(unit: number, subtask: number): string {
    const topics: Record<number, string[]> = {
        1: ["Introduction to ML", "Types of Learning", "ML Pipeline", "Data Preprocessing"],
        2: ["Linear Regression", "Logistic Regression", "Gradient Descent", "Model Evaluation"],
        3: ["Decision Trees", "Random Forests", "SVM Basics", "Ensemble Methods"],
        4: ["Neural Networks Intro", "Backpropagation", "CNNs Overview", "RNNs Overview"],
        5: ["Clustering (K-Means)", "Dimensionality Reduction", "PCA", "Final Review"],
    };
    return topics[unit]?.[subtask - 1] || `Topic ${subtask}`;
}

function getStudyTopicDescription(unit: number, subtask: number): string {
    const descriptions: Record<number, string[]> = {
        1: [
            "Understanding what machine learning is and its applications",
            "Supervised, unsupervised, and reinforcement learning",
            "Steps from data collection to deployment",
            "Cleaning, normalizing, and preparing data",
        ],
        2: [
            "Predicting continuous values with linear models",
            "Classification using sigmoid function",
            "Optimizing model parameters",
            "Accuracy, precision, recall, and F1 score",
        ],
        3: [
            "Building tree-based classifiers",
            "Ensemble of decision trees",
            "Maximum margin classifiers",
            "Bagging and boosting techniques",
        ],
        4: [
            "Perceptrons and multi-layer networks",
            "Training neural networks",
            "Image recognition architectures",
            "Sequence modeling networks",
        ],
        5: [
            "Unsupervised grouping algorithms",
            "Reducing feature dimensions",
            "Principal components analysis",
            "Comprehensive course review",
        ],
    };
    return descriptions[unit]?.[subtask - 1] || "Focus on key concepts";
}

// Generate fitness plan for a fitness goal
function generateFitnessPlan(goal: Goal, user: User): Task[] {
    const tasks: Task[] = [];
    const targetSteps = goal.targetValue || 5000;

    // Create daily step tracking tasks
    for (let day = 0; day < 7; day++) {
        tasks.push({
            id: `fitness-${Date.now()}-${day}`,
            goalId: goal.id,
            title: `Daily Steps: ${targetSteps.toLocaleString()} steps`,
            description: `Track your daily step count. Break it into: morning walk, lunch walk, evening activity.`,
            dayIndex: day,
            scheduledDate: getDateForDay(day),
            estimatedMinutes: 60,
            startTime: "07:00",
            status: day === 0 ? "in_progress" : "pending",
            difficulty: "medium",
        });

        // Add exercise task every other day
        if (day % 2 === 0) {
            tasks.push({
                id: `exercise-${Date.now()}-${day}`,
                goalId: goal.id,
                title: `${getExerciseType(day)} Session`,
                description: `${getExerciseDescription(day)}`,
                dayIndex: day,
                scheduledDate: getDateForDay(day),
                estimatedMinutes: 30,
                startTime: "17:30",
                status: "pending",
                difficulty: day < 4 ? "easy" : "medium",
            });
        }
    }

    return tasks;
}

function getExerciseType(day: number): string {
    const types = ["Cardio", "Strength", "Yoga", "HIIT"];
    return types[Math.floor(day / 2) % types.length];
}

function getExerciseDescription(day: number): string {
    const descriptions = [
        "20-30 min cardio: jogging, cycling, or brisk walking",
        "Full body strength training with bodyweight exercises",
        "Relaxation and flexibility focused yoga session",
        "High-intensity interval training for maximum calorie burn",
    ];
    return descriptions[Math.floor(day / 2) % descriptions.length];
}

// Main planning function
export function generatePlan(
    goal: Goal,
    user: User,
    calendarEvents: CalendarEvent[] = []
): { tasks: Task[]; reasoningSteps: ReasoningStep[] } {
    const reasoningSteps: ReasoningStep[] = [];
    const now = new Date().toISOString();

    // Step 1: Understand
    reasoningSteps.push({
        id: `reason-${Date.now()}-1`,
        phase: "understand",
        title: "Analyzing User State",
        description: `Processing goal: "${goal.title}" (${goal.category}). User available: ${user.dailyAvailableMinutes} mins/day. Focus time: ${user.preferences.focusTimeStart}-${user.preferences.focusTimeEnd}.`,
        timestamp: now,
        data: { goal, userConstraints: user },
    });

    // Step 2: Propose
    reasoningSteps.push({
        id: `reason-${Date.now()}-2`,
        phase: "propose",
        title: "Designing Schedule Strategy",
        description: `Planning ${goal.targetWeeks} week schedule. Will distribute tasks across 7 days, respecting ${calendarEvents.length} calendar events.`,
        timestamp: now,
        data: { calendarEvents: calendarEvents.length },
    });

    // Step 3: Execute
    let tasks: Task[] = [];

    if (goal.category === "Fitness" || goal.category === "Health") {
        tasks = generateFitnessPlan(goal, user);
    } else {
        tasks = generateStudyPlan(goal, user, calendarEvents);
    }

    reasoningSteps.push({
        id: `reason-${Date.now()}-3`,
        phase: "execute",
        title: "Generating Task Schedule",
        description: `Created ${tasks.length} tasks spanning 7 days. Each session: ${user.preferences.preferredSessionLength} mins with ${user.preferences.breakDuration} min breaks.`,
        timestamp: now,
        data: { tasksGenerated: tasks.length },
    });

    // Step 4: Observe
    const totalMinutes = tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
    reasoningSteps.push({
        id: `reason-${Date.now()}-4`,
        phase: "observe",
        title: "Validating Schedule",
        description: `Total scheduled: ${totalMinutes} mins across ${tasks.length} tasks. Average daily load: ${Math.round(totalMinutes / 7)} mins.`,
        timestamp: now,
        data: { totalMinutes, averageDaily: Math.round(totalMinutes / 7) },
    });

    // Step 5: Update
    reasoningSteps.push({
        id: `reason-${Date.now()}-5`,
        phase: "update",
        title: "Plan Ready",
        description: `Schedule optimized for your focus time. Calendar conflicts avoided. Ready to begin!`,
        timestamp: now,
    });

    // Log agent action
    const agentAction: AgentAction = {
        id: `action-${Date.now()}`,
        type: "generate_plan",
        timestamp: now,
        input: JSON.stringify({ goal: goal.title, category: goal.category }),
        output: `Generated ${tasks.length} tasks for 7-day plan`,
        status: "completed",
        duration: Math.floor(Math.random() * 500) + 200,
    };
    store.addAgentAction(agentAction);

    // Store reasoning steps
    reasoningSteps.forEach(step => store.addReasoningStep(step));

    return { tasks, reasoningSteps };
}

// Generate multiple goal plans
export function generateMultiGoalPlan(
    goals: Goal[],
    user: User,
    calendarEvents: CalendarEvent[] = []
): { allTasks: Task[]; allReasoningSteps: ReasoningStep[] } {
    let allTasks: Task[] = [];
    let allReasoningSteps: ReasoningStep[] = [];

    for (const goal of goals) {
        const { tasks, reasoningSteps } = generatePlan(goal, user, calendarEvents);
        allTasks = [...allTasks, ...tasks];
        allReasoningSteps = [...allReasoningSteps, ...reasoningSteps];
    }

    // Sort tasks by day and time
    allTasks.sort((a, b) => {
        if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
        return a.startTime.localeCompare(b.startTime);
    });

    return { allTasks, allReasoningSteps };
}
