import { useState } from 'react';
import type { HourlyPoint } from '../types';
import { calcSurfScore } from '../utils/surfScore';
import { degToCompass } from '../utils/wind';
import { weatherIcon } from '../utils/weatherIcon';

interface Props {
  hourly: HourlyPoint[];
  offshoreWindDir: number;
  hours?: number; // how many hours to show, default 48
}

function fmtDay(iso: string) {
  return new Date(iso).toLocaleDateString('pt', { weekday: 'short', day: 'numeric' });
}

function fmtHour(iso: string) {
  return new Date(iso).toLocaleTimeString('pt', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function isSameDayAs(iso: string, prev: string | null): boolean {
  if (!prev) return false;
  return new Date(iso).toDateString() === new Date(prev).toDateString();
}

const SCORE_STYLES: Record<string, string> = {
  Epic: 'bg-emerald-400/20 text-emerald-300 border-emerald-500/30',
  Good: 'bg-cyan-400/20 text-cyan-300 border-cyan-500/30',
  Fair: 'bg-yellow-400/20 text-yellow-300 border-yellow-500/30',
  Poor: 'bg-orange-400/20 text-orange-300 border-orange-500/30',
  Flat: 'bg-slate-700/30 text-slate-500 border-slate-600/20',
};

export function HourlyTable({ hourly, offshoreWindDir, hours = 48 }: Props) {
  const [expanded, setExpanded] = useState(false);
  const displayHours = expanded ? Math.min(hours, hourly.length) : 24;
  const rows = hourly.slice(0, displayHours);

  let prevDay: string | null = null;

  return (
    <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/40">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex-1">
          Hourly Forecast
        </h3>
        <span className="text-xs text-slate-500">{displayHours} h</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-slate-700/40">
              <th className="text-left px-4 py-2 font-medium w-24">Time</th>
              <th className="text-center px-2 py-2 font-medium">Sky</th>
              <th className="text-right px-2 py-2 font-medium">Wave</th>
              <th className="text-right px-2 py-2 font-medium">Per.</th>
              <th className="text-center px-2 py-2 font-medium hidden sm:table-cell">Swell</th>
              <th className="text-right px-2 py-2 font-medium">Wind</th>
              <th className="text-center px-2 py-2 font-medium hidden sm:table-cell">Dir.</th>
              <th className="text-center px-3 py-2 font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((pt) => {
              const score = calcSurfScore(pt, offshoreWindDir);
              const hasWave = pt.waveHeight > 0 || pt.swellHeight > 0;
              const showDayHeader = !isSameDayAs(pt.time, prevDay);
              prevDay = pt.time;
              const isGoodHour = score.score >= 6 && hasWave;

              return (
                <>
                  {showDayHeader && (
                    <tr key={`day-${pt.time}`} className="bg-slate-900/60">
                      <td colSpan={8} className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {fmtDay(pt.time)}
                      </td>
                    </tr>
                  )}
                  <tr
                    key={pt.time}
                    className={`border-b border-slate-700/20 transition-colors ${
                      isGoodHour ? 'bg-cyan-500/5 hover:bg-cyan-500/10' : 'hover:bg-slate-700/20'
                    }`}
                  >
                    <td className={`px-4 py-2 font-mono ${isGoodHour ? 'text-cyan-300 font-semibold' : 'text-slate-400'}`}>
                      {fmtHour(pt.time)}
                    </td>
                    <td className="px-2 py-2 text-center text-base leading-none">
                      {weatherIcon(pt.weatherCode)}
                    </td>
                    <td className="px-2 py-2 text-right text-slate-200 font-medium">
                      {hasWave ? `${pt.waveHeight.toFixed(1)}m` : '—'}
                    </td>
                    <td className="px-2 py-2 text-right text-slate-400">
                      {hasWave ? `${pt.wavePeriod.toFixed(0)}s` : '—'}
                    </td>
                    <td className="px-2 py-2 text-center text-slate-400 hidden sm:table-cell">
                      {hasWave ? `${pt.swellHeight.toFixed(1)}m ${degToCompass(pt.swellDirection)}` : '—'}
                    </td>
                    <td className="px-2 py-2 text-right text-slate-300">
                      {pt.windSpeed.toFixed(0)}
                      <span className="text-slate-500"> km/h</span>
                    </td>
                    <td className="px-2 py-2 text-center text-slate-500 hidden sm:table-cell">
                      {degToCompass(pt.windDirection)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {hasWave ? (
                        <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-bold ${SCORE_STYLES[score.label] ?? SCORE_STYLES.Flat}`}>
                          {score.score.toFixed(0)} {score.label}
                        </span>
                      ) : (
                        <span className="text-slate-700 text-[10px]">—</span>
                      )}
                    </td>
                  </tr>
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Show more / less */}
      {hourly.length > 24 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-700/30 transition-colors border-t border-slate-700/40"
        >
          {expanded ? '↑ Show less' : `↓ Show ${Math.min(hours, hourly.length) - 24} more hours`}
        </button>
      )}
    </div>
  );
}
