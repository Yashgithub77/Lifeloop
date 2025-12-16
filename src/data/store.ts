import {
    Goal, Task, PlanSnapshot, User,
    Integration, FitnessData, CalendarEvent,
    AgentAction, ReasoningStep, MicroAdjustment,
    BehaviorPattern, DailyInsight, CoachMessage, Notification
} from "@/types";

// ==================== DEMO USER ====================
export const DEMO_USER: User = {
    id: "user-1",
    name: "Alex Chen",
    email: "alex.chen@university.edu",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    collegeHours: { start: "08:00", end: "17:00" },
    sleepHours: { start: "23:00", end: "06:00" },
    dailyAvailableMinutes: 180,
    preferences: {
        preferredSessionLength: 45,
        breakDuration: 10,
        focusTimeStart: "18:00",
        focusTimeEnd: "22:00",
        notificationsEnabled: true,
    },
};

// Helper to get date offset from today (for client-side only)
function getOffsetDate(daysFromNow: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString();
}

// ==================== MOCK INTEGRATIONS ====================
export const MOCK_INTEGRATIONS: Integration[] = [
    {
        id: "int-1",
        name: "Google Calendar",
        type: "calendar",
        provider: "google_calendar",
        connected: true,
        lastSync: "2025-12-12T08:00:00.000Z", // Fixed date
        icon: "📅",
    },
    {
        id: "int-2",
        name: "Google Fit",
        type: "fitness",
        provider: "google_fit",
        connected: true,
        lastSync: "2025-12-12T08:00:00.000Z", // Fixed date
        icon: "💪",
    },
    {
        id: "int-3",
        name: "Notion",
        type: "notes",
        provider: "notion",
        connected: false,
        icon: "📝",
    },
];

// ==================== MOCK CALENDAR EVENTS (generated on demand) ====================
let _mockCalendarEvents: CalendarEvent[] | null = null;

function getMockCalendarEvents(): CalendarEvent[] {
    if (_mockCalendarEvents === null) {
        _mockCalendarEvents = [
            {
                id: "cal-1",
                title: "ML Assignment Due",
                start: getOffsetDate(3),
                end: getOffsetDate(3),
                type: "deadline",
                source: "google",
                color: "#ef4444",
            },
            {
                id: "cal-2",
                title: "Study Group Meeting",
                start: getOffsetDate(1),
                end: getOffsetDate(1),
                type: "meeting",
                source: "google",
                color: "#3b82f6",
            },
            {
                id: "cal-3",
                title: "Project Presentation",
                start: getOffsetDate(5),
                end: getOffsetDate(5),
                type: "deadline",
                source: "google",
                color: "#f59e0b",
            },
        ];
    }
    return _mockCalendarEvents;
}

export { getMockCalendarEvents as MOCK_CALENDAR_EVENTS_GETTER };

// For legacy compatibility (will be generated on first API call)
export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [];

// ==================== MOCK FITNESS DATA ====================
let _mockFitnessData: FitnessData[] | null = null;

function generateFitnessData(): FitnessData[] {
    if (_mockFitnessData !== null) {
        return _mockFitnessData;
    }

    const data: FitnessData[] = [];
    // Use seeded random-like values for consistency
    const stepValues = [4500, 5200, 3800, 6100, 4900, 5500, 3200]; // Pre-defined values

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const steps = stepValues[6 - i];
        data.push({
            date: date.toISOString().split("T")[0],
            steps,
            stepsGoal: 5000,
            activeMinutes: Math.floor(steps / 100),
            caloriesBurned: Math.floor(steps * 0.04),
            distanceKm: Math.round((steps * 0.0008) * 100) / 100,
            heartRateAvg: 75 + (i % 5),
            sleepHours: 6 + (i % 3),
            sleepQuality: ["fair", "good", "good", "excellent", "good", "fair", "good"][i] as FitnessData["sleepQuality"],
        });
    }

    _mockFitnessData = data;
    return data;
}

export let MOCK_FITNESS_DATA: FitnessData[] = [];

// Initialize fitness data lazily
function initFitnessData() {
    if (MOCK_FITNESS_DATA.length === 0) {
        MOCK_FITNESS_DATA = generateFitnessData();
    }
    return MOCK_FITNESS_DATA;
}

// ==================== IN-MEMORY STORE ====================
let goals: Goal[] = [];
let tasks: Task[] = [];
let snapshots: PlanSnapshot[] = [];
let agentActions: AgentAction[] = [];
let reasoningSteps: ReasoningStep[] = [];
let microAdjustments: MicroAdjustment[] = [];
let behaviorPatterns: BehaviorPattern[] = [];
let dailyInsights: DailyInsight[] = [];
let coachMessages: CoachMessage[] = [];
let notifications: Notification[] = [];

// ==================== STORE METHODS ====================
export const store = {
    // Goals
    getGoals: () => goals,
    getGoalById: (id: string) => goals.find(g => g.id === id),
    addGoal: (goal: Goal) => {
        goals.push(goal);
    },
    updateGoal: (id: string, updates: Partial<Goal>) => {
        const index = goals.findIndex(g => g.id === id);
        if (index !== -1) {
            goals[index] = { ...goals[index], ...updates };
        }
        return goals[index];
    },
    clearGoals: () => {
        goals = [];
    },

    // Tasks
    getTasks: () => tasks,
    setTasks: (newTasks: Task[]) => {
        tasks = newTasks;
    },
    addTask: (task: Task) => {
        tasks.push(task);
    },
    updateTaskStatus: (taskId: string, status: Task["status"]) => {
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
            task.status = status;
            if (status === "done") {
                task.completedAt = new Date().toISOString();
            }
        }
        return task;
    },
    updateTask: (taskId: string, updates: Partial<Task>) => {
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...updates };
        }
        return tasks[index];
    },
    getTasksForDay: (dayIndex: number) => {
        return tasks.filter((t) => t.dayIndex === dayIndex);
    },
    getTasksByGoal: (goalId: string) => {
        return tasks.filter((t) => t.goalId === goalId);
    },

    // Snapshots
    addSnapshot: (snapshot: PlanSnapshot) => {
        snapshots.push(snapshot);
    },
    getSnapshots: () => snapshots,

    // Agent Actions
    addAgentAction: (action: AgentAction) => {
        agentActions.push(action);
    },
    getAgentActions: () => agentActions,
    updateAgentAction: (id: string, updates: Partial<AgentAction>) => {
        const index = agentActions.findIndex(a => a.id === id);
        if (index !== -1) {
            agentActions[index] = { ...agentActions[index], ...updates };
        }
    },

    // Reasoning Steps
    addReasoningStep: (step: ReasoningStep) => {
        reasoningSteps.push(step);
    },
    getReasoningSteps: () => reasoningSteps,
    clearReasoningSteps: () => {
        reasoningSteps = [];
    },

    // Micro Adjustments
    addMicroAdjustment: (adjustment: MicroAdjustment) => {
        microAdjustments.push(adjustment);
    },
    getMicroAdjustments: () => microAdjustments,
    applyMicroAdjustment: (id: string) => {
        const adjustment = microAdjustments.find(a => a.id === id);
        if (adjustment) {
            adjustment.applied = true;
            adjustment.appliedAt = new Date().toISOString();
        }
        return adjustment;
    },

    // Behavior Patterns
    addBehaviorPattern: (pattern: BehaviorPattern) => {
        behaviorPatterns.push(pattern);
    },
    getBehaviorPatterns: () => behaviorPatterns,

    // Daily Insights
    addDailyInsight: (insight: DailyInsight) => {
        dailyInsights.push(insight);
    },
    getDailyInsights: () => dailyInsights,

    // Coach Messages
    addCoachMessage: (message: CoachMessage) => {
        coachMessages.push(message);
    },
    getCoachMessages: () => coachMessages,

    // Notifications
    addNotification: (notification: Notification) => {
        notifications.push(notification);
    },
    getNotifications: () => notifications,
    markNotificationRead: (id: string) => {
        const notification = notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
        }
    },

    // Fitness Data
    getFitnessData: () => initFitnessData(),
    getTodayFitness: () => {
        const data = initFitnessData();
        return data[data.length - 1];
    },
    updateTodaySteps: (steps: number) => {
        const data = initFitnessData();
        data[data.length - 1].steps = steps;
    },

    // Calendar Events
    getCalendarEvents: () => getMockCalendarEvents(),

    // Integrations
    getIntegrations: () => MOCK_INTEGRATIONS,

    // Reset
    reset: () => {
        goals = [];
        tasks = [];
        snapshots = [];
        agentActions = [];
        reasoningSteps = [];
        microAdjustments = [];
        behaviorPatterns = [];
        dailyInsights = [];
        coachMessages = [];
        notifications = [];
        _mockFitnessData = null;
        MOCK_FITNESS_DATA = [];
    },
};
