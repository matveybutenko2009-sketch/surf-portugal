import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { HourlyPoint } from '../types';

interface Props {
  hourly: HourlyPoint[];
}

// Pick one point per 3 h, max 7 days = 56 points
function downsample(hourly: HourlyPoint[]): HourlyPoint[] {
  return hourly.filter((_, i) => i % 3 === 0).slice(0, 56);
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en', { weekday: 'short', day: 'numeric' }) + ' ' +
    d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function fmtLabel(iso: string) {
  const d = new Date(iso);
  if (d.getHours() === 0 || d.getHours() === 12) {
    return d.toLocaleDateString('en', { weekday: 'short', day: 'numeric' });
  }
  return d.getHours() + 'h';
}

export function WeatherChart({ hourly }: Props) {
  const data = downsample(hourly).map((pt) => ({
    time: pt.time,
    label: fmtLabel(pt.time),
    waveHeight: Number(pt.waveHeight.toFixed(2)),
    swellHeight: Number(pt.swellHeight.toFixed(2)),
    windSpeed: Number(pt.windSpeed.toFixed(1)),
    windGusts: Number(pt.windGusts.toFixed(1)),
  }));

  return (
    <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">7-Day Forecast</h3>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#64748b', fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: '#1e293b' }}
            interval={3}
          />
          <YAxis
            yAxisId="wave"
            tick={{ fill: '#64748b', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            unit="m"
            domain={[0, 'auto']}
          />
          <YAxis
            yAxisId="wind"
            orientation="right"
            tick={{ fill: '#64748b', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            unit=" km/h"
            domain={[0, 'auto']}
          />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#94a3b8' }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => {
              if (value === undefined || value === null) return ['—', String(name)];
              const labels: Record<string, string> = {
                waveHeight: 'Wave',
                swellHeight: 'Swell',
                windSpeed: 'Wind',
                windGusts: 'Gusts',
              };
              const units: Record<string, string> = {
                waveHeight: ' m',
                swellHeight: ' m',
                windSpeed: ' km/h',
                windGusts: ' km/h',
              };
              return [`${String(value)}${units[String(name)] ?? ''}`, labels[String(name)] ?? String(name)];
            }}
            labelFormatter={(_label, payload) => {
              if (payload?.[0]) return fmtTime(payload[0].payload.time);
              return _label;
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: '#64748b' }}
            formatter={(value) => {
              const map: Record<string, string> = {
                waveHeight: 'Wave height', swellHeight: 'Swell height',
                windSpeed: 'Wind', windGusts: 'Gusts',
              };
              return map[value] ?? value;
            }}
          />
          <Area
            yAxisId="wave"
            type="monotone"
            dataKey="swellHeight"
            fill="#0e7490"
            fillOpacity={0.3}
            stroke="#22d3ee"
            strokeWidth={2}
            dot={false}
          />
          <Area
            yAxisId="wave"
            type="monotone"
            dataKey="waveHeight"
            fill="#1e3a5f"
            fillOpacity={0.4}
            stroke="#3b82f6"
            strokeWidth={1.5}
            dot={false}
          />
          <Line
            yAxisId="wind"
            type="monotone"
            dataKey="windSpeed"
            stroke="#f59e0b"
            strokeWidth={1.5}
            dot={false}
          />
          <Line
            yAxisId="wind"
            type="monotone"
            dataKey="windGusts"
            stroke="#ef4444"
            strokeWidth={1}
            strokeDasharray="4 2"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
