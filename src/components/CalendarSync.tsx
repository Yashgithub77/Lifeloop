"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";

interface CalendarSyncProps {
    onSyncComplete?: () => void;
}

export default function CalendarSync({ onSyncComplete }: CalendarSyncProps) {
    const { data: session, status } = useSession();
    const [isPushing, setIsPushing] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handlePushToCalendar = async () => {
        if (!session) {
            signIn("google");
            return;
        }

        setIsPushing(true);
        setMessage(null);

        try {
            const response = await fetch("/api/calendar/push", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}), // Push all upcoming tasks
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({
                    type: "success",
                    text: `✅ ${data.message}`,
                });
                onSyncComplete?.();
            } else {
                setMessage({
                    type: "error",
                    text: `❌ ${data.error || "Failed to push to calendar"}`,
                });
            }
        } catch (error) {
            setMessage({
                type: "error",
                text: `❌ ${error instanceof Error ? error.message : "Network error"}`,
            });
        } finally {
            setIsPushing(false);
        }
    };

    const handleSyncFromCalendar = async () => {
        if (!session) {
            signIn("google");
            return;
        }

        setIsSyncing(true);
        setMessage(null);

        try {
            const response = await fetch("/api/calendar/sync");
            const data = await response.json();

            if (response.ok) {
                setMessage({
                    type: "success",
                    text: `✅ ${data.message}`,
                });
                onSyncComplete?.();
            } else {
                setMessage({
                    type: "error",
                    text: `❌ ${data.error || "Failed to sync calendar"}`,
                });
            }
        } catch (error) {
            setMessage({
                type: "error",
                text: `❌ ${error instanceof Error ? error.message : "Network error"}`,
            });
        } finally {
            setIsSyncing(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="p-4 rounded-xl animate-pulse" style={{ background: "var(--cardBg)" }}>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
        );
    }

    return (
        <div
            className="p-5 rounded-2xl shadow-sm"
            style={{ background: "var(--cardBg)", border: "1px solid var(--cardBorder)" }}
        >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                <span>📅</span> Google Calendar
                {session && (
                    <span
                        className="ml-auto text-xs font-normal px-2 py-1 rounded-full"
                        style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}
                    >
                        Connected ✓
                    </span>
                )}
            </h3>

            {!session ? (
                <div className="text-center py-4">
                    <p className="text-sm mb-4" style={{ color: "var(--foregroundMuted)" }}>
                        Connect your Google Calendar to sync tasks
                    </p>
                    <button
                        onClick={() => signIn("google")}
                        className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                        style={{
                            background: "white",
                            color: "#1f2937",
                            border: "1px solid #e5e7eb",
                        }}
                    >
                        🔗 Connect Google Calendar
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex gap-3">
                        <button
                            onClick={handlePushToCalendar}
                            disabled={isPushing}
                            className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
                            style={{ background: "var(--primaryGradient)", color: "white" }}
                        >
                            {isPushing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Pushing...
                                </span>
                            ) : (
                                "📤 Push Tasks to Calendar"
                            )}
                        </button>

                        <button
                            onClick={handleSyncFromCalendar}
                            disabled={isSyncing}
                            className="px-4 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
                            style={{ background: "var(--backgroundSecondary)", color: "var(--foreground)", border: "1px solid var(--cardBorder)" }}
                        >
                            {isSyncing ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                </span>
                            ) : (
                                "🔄"
                            )}
                        </button>
                    </div>

                    {message && (
                        <div
                            className="p-3 rounded-lg text-sm"
                            style={{
                                background: message.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                                color: message.type === "success" ? "#10b981" : "#ef4444",
                            }}
                        >
                            {message.text}
                        </div>
                    )}

                    <p className="text-xs" style={{ color: "var(--foregroundMuted)" }}>
                        Push your scheduled tasks to Google Calendar or sync your existing events.
                    </p>
                </div>
            )}
        </div>
    );
}
