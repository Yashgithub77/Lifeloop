// ==================== USER & PROFILE ====================
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  collegeHours: { start: string; end: string };
  sleepHours: { start: string; end: string };
  dailyAvailableMinutes: number;
  preferences: UserPreferences;
}

export interface UserPreferences {
  preferredSessionLength: number; // minutes
  breakDuration: number; // minutes
  focusTimeStart: string; // "HH:MM"
  focusTimeEnd: string; // "HH:MM"
  notificationsEnabled: boolean;
}

// ==================== GOALS ====================
export type GoalCategory = "Study" | "Fitness" | "Project" | "Health" | "Career" | "Personal";
export type GoalPriority = "high" | "medium" | "low";

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  priority: GoalPriority;
  targetWeeks: number;
  targetValue?: number; // e.g., 5000 steps, 20 chapters
  currentValue?: number;
  unit?: string; // "steps", "chapters", "hours"
  createdAt: string;
  deadline?: string;
  isRecurring: boolean;
  color: string;
}

// ==================== TASKS ====================
export type TaskStatus = "pending" | "in_progress" | "done" | "skipped" | "rescheduled";
export type TaskDifficulty = "easy" | "medium" | "hard";

export interface Task {
  id: string;
  goalId: string;
  title: string;
  description: string;
  dayIndex: number; // 0–6 from "today"
  scheduledDate: string; // ISO date
  estimatedMinutes: number;
  actualMinutes?: number;
  startTime: string; // "HH:MM"
  endTime?: string;
  status: TaskStatus;
  difficulty: TaskDifficulty;
  completedAt?: string;
  notes?: string;
}

// ==================== INTEGRATIONS ====================
export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO datetime
  end: string;
  type: "deadline" | "meeting" | "reminder" | "blocked";
  source: "google" | "outlook" | "manual";
  color?: string;
}

export interface FitnessData {
  date: string;
  steps: number;
  stepsGoal: number;
  activeMinutes: number;
  caloriesBurned: number;
  distanceKm: number;
  heartRateAvg?: number;
  sleepHours?: number;
  sleepQuality?: "poor" | "fair" | "good" | "excellent";
}

export interface Integration {
  id: string;
  name: string;
  type: "calendar" | "fitness" | "productivity" | "notes";
  provider: "google_calendar" | "google_fit" | "notion" | "todoist" | "apple_health";
  connected: boolean;
  lastSync?: string;
  icon: string;
}

// ==================== AGENT & REASONING ====================
export type AgentActionType =
  | "analyze_goal"
  | "generate_plan"
  | "check_progress"
  | "replan"
  | "suggest_adjustment"
  | "sync_calendar"
  | "sync_fitness"
  | "send_reminder"
  | "analyze_behavior";

export interface AgentAction {
  id: string;
  type: AgentActionType;
  title?: string;
  description?: string;
  timestamp: string;
  input?: string;
  output?: string;
  status: "pending" | "running" | "completed" | "failed";
  duration?: number; // ms
}

export interface ReasoningStep {
  id: string;
  phase: "understand" | "propose" | "execute" | "observe" | "update";
  title: string;
  description: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

export interface MicroAdjustment {
  id: string;
  type: "shorten_session" | "add_break" | "swap_task" | "reduce_difficulty" | "reschedule" | "motivational";
  title: string;
  description: string;
  reason: string;
  impact: "low" | "medium" | "high"; // Changed to match component
  applied: boolean;
  suggestedAt: string;
  appliedAt?: string;
}

// ==================== BEHAVIOR & INSIGHTS ====================
export interface BehaviorPattern {
  id: string;
  type: "productivity_peak" | "completion_rate" | "skip_pattern" | "focus_duration" | "break_pattern" | "low_energy" | "streak" | "focus_champion";
  title: string; // Added for display
  description: string; // Added for display
  insight: string;
  confidence: number; // 0-1 (will be converted to percentage in UI)
  detectedAt: string;
  dataPoints: number;
}

export interface DailyInsight {
  date: string;
  tasksCompleted: number;
  tasksTotal: number;
  completionRate: number;
  focusMinutes: number; // Changed from totalFocusMinutes
  streakDays: number;
  mood: "great" | "good" | "okay" | "low" | "tired" | "stressed";
  energyLevel: "high" | "medium" | "low"; // Changed from number to string
}

// ==================== PLAN SNAPSHOTS ====================
export interface PlanSnapshot {
  id: string;
  createdAt: string;
  tasks: Task[];
  goals: Goal[];
  label: "initial" | "replan" | "adjustment";
  reason?: string;
  agentActions: AgentAction[];
}

// ==================== NOTIFICATIONS ====================
export interface Notification {
  id: string;
  type: "reminder" | "achievement" | "suggestion" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// ==================== COACH MESSAGE ====================
export interface CoachMessage {
  id: string;
  message: string;
  type: "encouragement" | "feedback" | "suggestion" | "warning" | "celebration";
  timestamp: string;
  relatedTaskId?: string;
  relatedGoalId?: string;
}
