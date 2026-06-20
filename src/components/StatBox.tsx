interface Props {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  accent?: boolean;
}

export function StatBox({ label, value, unit, sub, accent }: Props) {
  return (
    <div className={`rounded-xl p-4 flex flex-col gap-1 ${accent ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-slate-800/60 border border-slate-700/40'}`}>
      <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
      <div className="flex items-end gap-1">
        <span className={`text-2xl font-bold ${accent ? 'text-cyan-300' : 'text-white'}`}>{value}</span>
        {unit && <span className="text-sm text-slate-400 mb-0.5">{unit}</span>}
      </div>
      {sub && <span className="text-xs text-slate-500">{sub}</span>}
    </div>
  );
}
