import { Goal } from "@/types";

interface Props {
    goal: Goal;
}

export default function GoalSummaryCard({ goal }: Props) {
    return (
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-700 group-hover:bg-indigo-500/20"></div>

            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Current Mission</h3>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">{goal.title}</h2>
            <p className="text-slate-400 mb-6 text-sm leading-relaxed">{goal.description}</p>

            <div className="flex gap-3">
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold uppercase tracking-wide">
                    {goal.category}
                </span>
                <span className="px-3 py-1 bg-slate-700/50 text-slate-300 border border-slate-600/50 rounded-full text-xs font-semibold uppercase tracking-wide">
                    {goal.targetWeeks} Weeks
                </span>
            </div>
        </div>
    );
}
