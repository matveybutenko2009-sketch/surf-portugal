import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { Waves, AlertCircle } from 'lucide-react';
import { useTides } from '../hooks/useTides';
import type { TideExtreme } from '../api/tides';

interface Props {
  lat: number;
  lng: number;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function fmtLabel(iso: string) {
  const d = new Date(iso);
  const h = d.getHours();
  if (h === 0) return d.toLocaleDateString('en', { weekday: 'short', day: 'numeric' });
  if (h % 6 === 0) return `${h}:00`;
  return '';
}

function ExtremeTag({ ex }: { ex: TideExtreme }) {
  const isHigh = ex.type === 'High';
  return (
    <div className={`flex flex-col items-center px-3 py-2 rounded-lg border ${
      isHigh ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-700/30 border-slate-600/30'
    }`}>
      <span className={`text-xs font-semibold uppercase tracking-wide ${isHigh ? 'text-cyan-400' : 'text-slate-400'}`}>
        {ex.type}
      </span>
      <span className="text-white font-bold text-lg">{ex.height.toFixed(2)}<span className="text-slate-400 text-xs font-normal"> m</span></span>
      <span className="text-slate-500 text-xs">{fmtTime(ex.date)}</span>
    </div>
  );
}

export function TideSection({ lat, lng }: Props) {
  const state = useTides(lat, lng);

  if (state.status === 'no_key') {
    return (
      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 flex items-center gap-3">
        <Waves size={18} className="text-slate-500 shrink-0" />
        <div>
          <p className="text-sm text-slate-400 font-medium">Tide data not available</p>
          <p className="text-xs text-slate-600">
            Add{' '}
            <code className="bg-slate-700 px-1 rounded text-slate-300">VITE_TIDE_API_KEY=…</code>{' '}
            to <code className="bg-slate-700 px-1 rounded text-slate-300">.env</code>{' '}
            (WorldTides free tier — 100 calls/day)
          </p>
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="flex items-center gap-2 bg-red-900/20 border border-red-700/30 rounded-xl px-4 py-3 text-red-300 text-sm">
        <AlertCircle size={16} className="shrink-0" />
        Tides: {state.message}
      </div>
    );
  }

  if (state.status === 'loading') {
    return (
      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 animate-pulse h-40" />
    );
  }

  const { data } = state;

  // Next 4 extremes from now
  const now = Date.now() / 1000;
  const upcoming = data.extremes
    .filter((e) => e.dt >= now)
    .slice(0, 4);

  const chartData = data.heights.map((h) => ({
    time: h.date,
    label: fmtLabel(h.date),
    height: Number(h.height.toFixed(2)),
  }));

  const nowLine = new Date().toISOString();

  return (
    <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Waves size={14} className="text-cyan-400" />
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Tides</h3>
        <span className="ml-auto text-xs text-slate-600">WorldTides</span>
      </div>

      {/* Next extremes */}
      {upcoming.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {upcoming.map((ex) => (
            <ExtremeTag key={ex.dt} ex={ex} />
          ))}
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tideGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: '#1e293b' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              unit="m"
            />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(v: unknown) => [`${Number(v).toFixed(2)} m`, 'Height']}
              labelFormatter={(_l, payload) =>
                payload?.[0] ? fmtTime(payload[0].payload.time) : _l
              }
            />
            <ReferenceLine
              x={nowLine}
              stroke="#f59e0b"
              strokeDasharray="3 3"
              label={{ value: 'now', fill: '#f59e0b', fontSize: 10 }}
            />
            <Area
              type="monotone"
              dataKey="height"
              stroke="#22d3ee"
              strokeWidth={2}
              fill="url(#tideGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
