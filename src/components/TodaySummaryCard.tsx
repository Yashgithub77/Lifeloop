interface Props {
    completionPercent: number;
    tasksDone: number;
    tasksPending: number;
}

export default function TodaySummaryCard({ completionPercent, tasksDone, tasksPending }: Props) {
    return (
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Daily Progress</h3>

            <div className="flex items-end justify-between mb-2">
                <div>
                    <div className="text-5xl font-black text-white tracking-tighter">
                        {completionPercent}<span className="text-2xl text-indigo-400">%</span>
                    </div>
                    <div className="text-sm text-slate-400 font-medium mt-1">Completion Rate</div>
                </div>
                <div className="text-right space-y-1">
                    <div className="text-sm font-medium text-slate-300">
                        <span className="text-emerald-400 font-bold">{tasksDone}</span> Done
                    </div>
                    <div className="text-sm font-medium text-slate-300">
                        <span className="text-amber-400 font-bold">{tasksPending}</span> Pending
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-700/50 rounded-full h-3 mt-6 overflow-hidden">
                <div
                    className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    style={{ width: `${completionPercent}%` }}
                ></div>
            </div>
        </div>
    );
}
