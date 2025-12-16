"use client";

import { Integration, CalendarEvent } from "@/types";

interface IntegrationsPanelProps {
    integrations: Integration[];
    calendarEvents: CalendarEvent[];
    onConnect?: (integrationId: string) => void;
    onSync?: (integrationId: string) => void;
}

export default function IntegrationsPanel({
    integrations,
    calendarEvents,
    onConnect,
    onSync,
}: IntegrationsPanelProps) {
    const connectedCount = integrations.filter((i) => i.connected).length;

    const getEventTypeColor = (type: CalendarEvent["type"]) => {
        switch (type) {
            case "deadline":
                return "bg-rose-500/20 text-rose-400 border-rose-500/30";
            case "meeting":
                return "bg-blue-500/20 text-blue-400 border-blue-500/30";
            case "reminder":
                return "bg-amber-500/20 text-amber-400 border-amber-500/30";
            case "blocked":
                return "bg-slate-500/20 text-slate-400 border-slate-500/30";
            default:
                return "bg-slate-500/20 text-slate-400 border-slate-500/30";
        }
    };

    const formatEventDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return "Tomorrow";
        } else {
            const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return `In ${diff} days`;
        }
    };

    return (
        <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🔗</span>
                    Integrations
                </h3>
                <span className="text-xs bg-slate-800 px-2 py-1 rounded-full text-slate-400">
                    {connectedCount}/{integrations.length} connected
                </span>
            </div>

            {/* Integration Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {integrations.map((integration) => (
                    <div
                        key={integration.id}
                        className={`p-3 rounded-xl border transition-all ${integration.connected
                                ? "bg-emerald-500/10 border-emerald-500/30"
                                : "bg-slate-800/50 border-slate-700/50 hover:border-slate-600"
                            }`}
                    >
                        <div className="text-center">
                            <span className="text-2xl mb-1 block">{integration.icon}</span>
                            <span className="text-xs text-slate-300 font-medium block truncate">
                                {integration.name}
                            </span>
                            {integration.connected ? (
                                <div className="mt-2">
                                    <span className="text-xs text-emerald-400 flex items-center justify-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                                        Connected
                                    </span>
                                    {onSync && (
                                        <button
                                            onClick={() => onSync(integration.id)}
                                            className="mt-1 text-xs text-slate-500 hover:text-slate-300"
                                        >
                                            Sync
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => onConnect?.(integration.id)}
                                    className="mt-2 text-xs text-indigo-400 hover:text-indigo-300"
                                >
                                    Connect
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Upcoming Events */}
            <div className="border-t border-slate-700/50 pt-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <span>📅</span> Upcoming from Calendar
                </h4>
                <div className="space-y-2">
                    {calendarEvents.slice(0, 3).map((event) => (
                        <div
                            key={event.id}
                            className={`p-3 rounded-lg border ${getEventTypeColor(event.type)}`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium text-white block truncate">
                                        {event.title}
                                    </span>
                                    <span className="text-xs opacity-80">{formatEventDate(event.start)}</span>
                                </div>
                                <span
                                    className={`text-xs px-2 py-0.5 rounded-full capitalize ${getEventTypeColor(event.type)}`}
                                >
                                    {event.type}
                                </span>
                            </div>
                        </div>
                    ))}
                    {calendarEvents.length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-4">
                            No upcoming events synced
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
