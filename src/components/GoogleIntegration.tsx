"use client";

import { useState, useEffect } from "react";
import { CalendarEvent, FitnessData } from "@/types";

interface GoogleIntegrationProps {
    onCalendarSync?: (events: CalendarEvent[]) => void;
    onFitnessSync?: (data: FitnessData) => void;
    calendarConnected?: boolean;
    fitnessConnected?: boolean;
}

export default function GoogleIntegration({
    onCalendarSync,
    onFitnessSync,
    calendarConnected = false,
    fitnessConnected = false,
}: GoogleIntegrationProps) {
    const [isCalendarConnected, setIsCalendarConnected] = useState(calendarConnected);
    const [isFitnessConnected, setIsFitnessConnected] = useState(fitnessConnected);
    const [isConnecting, setIsConnecting] = useState<"calendar" | "fitness" | null>(null);
    const [lastCalendarSync, setLastCalendarSync] = useState<Date | null>(null);
    const [lastFitnessSync, setLastFitnessSync] = useState<Date | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<"calendar" | "fitness" | null>(null);

    // Check for existing connections on mount
    useEffect(() => {
        const calendarConnectedStorage = localStorage.getItem("lifeloop-google-calendar");
        const fitnessConnectedStorage = localStorage.getItem("lifeloop-google-fit");

        if (calendarConnectedStorage === "connected") {
            setIsCalendarConnected(true);
            setLastCalendarSync(new Date());
        }
        if (fitnessConnectedStorage === "connected") {
            setIsFitnessConnected(true);
            setLastFitnessSync(new Date());
        }
    }, []);

    const handleConnect = async (type: "calendar" | "fitness") => {
        setModalType(type);
        setShowModal(true);
    };

    const confirmConnect = async () => {
        const type = modalType;
        if (!type) return;

        setShowModal(false);
        setIsConnecting(type);

        // Simulate OAuth flow with delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        if (type === "calendar") {
            setIsCalendarConnected(true);
            localStorage.setItem("lifeloop-google-calendar", "connected");
            setLastCalendarSync(new Date());

            // Simulate fetching calendar events
            const mockEvents: CalendarEvent[] = [
                {
                    id: "cal-sync-1",
                    title: "Team Meeting",
                    start: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                    end: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
                    type: "meeting",
                    source: "google",
                    color: "#4285f4",
                },
                {
                    id: "cal-sync-2",
                    title: "Project Deadline",
                    start: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
                    end: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
                    type: "deadline",
                    source: "google",
                    color: "#ea4335",
                },
                {
                    id: "cal-sync-3",
                    title: "Study Session",
                    start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    end: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
                    type: "reminder",
                    source: "google",
                    color: "#34a853",
                },
            ];

            onCalendarSync?.(mockEvents);
        } else {
            setIsFitnessConnected(true);
            localStorage.setItem("lifeloop-google-fit", "connected");
            setLastFitnessSync(new Date());

            // Simulate fetching fitness data
            const mockFitness: FitnessData = {
                date: new Date().toISOString().split("T")[0],
                steps: 4250,
                stepsGoal: 5000,
                activeMinutes: 42,
                caloriesBurned: 180,
                distanceKm: 3.4,
                heartRateAvg: 72,
                sleepHours: 7.5,
                sleepQuality: "good",
            };

            onFitnessSync?.(mockFitness);
        }

        setIsConnecting(null);
    };

    const handleDisconnect = (type: "calendar" | "fitness") => {
        if (type === "calendar") {
            setIsCalendarConnected(false);
            localStorage.removeItem("lifeloop-google-calendar");
            setLastCalendarSync(null);
        } else {
            setIsFitnessConnected(false);
            localStorage.removeItem("lifeloop-google-fit");
            setLastFitnessSync(null);
        }
    };

    const handleSync = async (type: "calendar" | "fitness") => {
        setIsConnecting(type);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        if (type === "calendar") {
            setLastCalendarSync(new Date());
        } else {
            setLastFitnessSync(new Date());
        }

        setIsConnecting(null);
    };

    const formatLastSync = (date: Date | null) => {
        if (!date) return "Never";
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diff < 60) return "Just now";
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <>
            <div
                className="p-5 rounded-2xl"
                style={{
                    background: "var(--cardBg)",
                    border: "1px solid var(--cardBorder)",
                }}
            >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                    <span>🔗</span> Google Integration
                </h3>

                <div className="space-y-4">
                    {/* Google Calendar */}
                    <div
                        className="p-4 rounded-xl flex items-center gap-4"
                        style={{ background: "var(--backgroundSecondary)" }}
                    >
                        <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center">
                            <svg className="w-8 h-8" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold" style={{ color: "var(--foreground)" }}>Google Calendar</h4>
                            <p className="text-sm" style={{ color: "var(--foregroundMuted)" }}>
                                {isCalendarConnected ? `Last sync: ${formatLastSync(lastCalendarSync)}` : "Sync your events & deadlines"}
                            </p>
                        </div>
                        {isCalendarConnected ? (
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                                    Connected
                                </span>
                                <button
                                    onClick={() => handleSync("calendar")}
                                    disabled={isConnecting === "calendar"}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <svg
                                        className={`w-5 h-5 ${isConnecting === "calendar" ? "animate-spin" : ""}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        style={{ color: "var(--primary)" }}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleDisconnect("calendar")}
                                    className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => handleConnect("calendar")}
                                disabled={isConnecting === "calendar"}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
                                style={{ background: "var(--primaryGradient)" }}
                            >
                                {isConnecting === "calendar" ? "Connecting..." : "Connect"}
                            </button>
                        )}
                    </div>

                    {/* Google Fit */}
                    <div
                        className="p-4 rounded-xl flex items-center gap-4"
                        style={{ background: "var(--backgroundSecondary)" }}
                    >
                        <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center">
                            <svg className="w-8 h-8" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                                <path fill="#34A853" d="M12 2v10l6.93 4" />
                                <path fill="#EA4335" d="M12 2C6.48 2 2 6.48 2 12h10" />
                                <path fill="#FBBC05" d="M12 12v10c5.52 0 10-4.48 10-10h-10z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold" style={{ color: "var(--foreground)" }}>Google Fit</h4>
                            <p className="text-sm" style={{ color: "var(--foregroundMuted)" }}>
                                {isFitnessConnected ? `Last sync: ${formatLastSync(lastFitnessSync)}` : "Track steps, activity & health"}
                            </p>
                        </div>
                        {isFitnessConnected ? (
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                                    Connected
                                </span>
                                <button
                                    onClick={() => handleSync("fitness")}
                                    disabled={isConnecting === "fitness"}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <svg
                                        className={`w-5 h-5 ${isConnecting === "fitness" ? "animate-spin" : ""}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        style={{ color: "var(--primary)" }}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleDisconnect("fitness")}
                                    className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => handleConnect("fitness")}
                                disabled={isConnecting === "fitness"}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
                                style={{ background: "var(--primaryGradient)" }}
                            >
                                {isConnecting === "fitness" ? "Connecting..." : "Connect"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Info Note */}
                <div className="mt-4 p-3 rounded-xl text-sm" style={{ background: "var(--backgroundSecondary)", color: "var(--foregroundMuted)" }}>
                    💡 Connecting allows LifeLoop to sync your calendar events as deadlines and track your fitness progress in real-time.
                </div>
            </div>

            {/* OAuth Consent Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div
                        className="w-full max-w-md p-6 rounded-2xl shadow-2xl"
                        style={{ background: "var(--cardBg)" }}
                    >
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white shadow-md flex items-center justify-center">
                                {modalType === "calendar" ? (
                                    <svg className="w-10 h-10" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                ) : (
                                    <span className="text-4xl">💪</span>
                                )}
                            </div>
                            <h3 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
                                Connect {modalType === "calendar" ? "Google Calendar" : "Google Fit"}
                            </h3>
                            <p className="mt-2 text-sm" style={{ color: "var(--foregroundMuted)" }}>
                                LifeLoop will have access to:
                            </p>
                        </div>

                        <ul className="space-y-2 mb-6">
                            {modalType === "calendar" ? (
                                <>
                                    <li className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)" }}>
                                        <span className="text-green-500">✓</span> View your calendar events
                                    </li>
                                    <li className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)" }}>
                                        <span className="text-green-500">✓</span> Create events for your tasks
                                    </li>
                                    <li className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)" }}>
                                        <span className="text-green-500">✓</span> Sync deadlines automatically
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)" }}>
                                        <span className="text-green-500">✓</span> Read your step count
                                    </li>
                                    <li className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)" }}>
                                        <span className="text-green-500">✓</span> Track active minutes
                                    </li>
                                    <li className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)" }}>
                                        <span className="text-green-500">✓</span> View sleep & heart rate data
                                    </li>
                                </>
                            )}
                        </ul>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-3 rounded-xl font-medium transition-colors"
                                style={{
                                    background: "var(--backgroundSecondary)",
                                    color: "var(--foreground)",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmConnect}
                                className="flex-1 px-4 py-3 rounded-xl font-medium text-white transition-all hover:opacity-90"
                                style={{ background: "var(--primaryGradient)" }}
                            >
                                Allow Access
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
