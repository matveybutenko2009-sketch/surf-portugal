import type { HourlyPoint, SurfScore } from '../types';

// Angular difference between two compass headings (0–180)
function angleDiff(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

// Score 0–10 for a single hourly point given spot's offshore wind direction
export function calcSurfScore(point: HourlyPoint, offshoreWindDir: number): SurfScore {
  let score = 0;

  // Swell height: ideal 1–2.5 m
  const h = point.swellHeight;
  if (h >= 0.5 && h < 1) score += 2;
  else if (h >= 1 && h <= 2.5) score += 4;
  else if (h > 2.5 && h <= 4) score += 3;
  else if (h > 4) score += 1;

  // Swell period: >10 s = good
  const p = point.swellPeriod;
  if (p >= 14) score += 3;
  else if (p >= 10) score += 2;
  else if (p >= 7) score += 1;

  // Wind: offshore ± 45° and not too strong
  const diff = angleDiff(point.windDirection, offshoreWindDir);
  const spd = point.windSpeed;
  if (diff <= 45 && spd <= 15) score += 3;
  else if (diff <= 45 && spd <= 25) score += 2;
  else if (diff <= 90 && spd <= 10) score += 1;
  else if (diff > 135) score -= 1; // onshore penalty

  const clamped = Math.min(10, Math.max(0, score));

  let label: string;
  let color: string;
  if (clamped >= 8) { label = 'Epic'; color = 'bg-emerald-400 text-slate-950'; }
  else if (clamped >= 6) { label = 'Good'; color = 'bg-cyan-400 text-slate-950'; }
  else if (clamped >= 4) { label = 'Fair'; color = 'bg-yellow-400 text-slate-950'; }
  else if (clamped >= 2) { label = 'Poor'; color = 'bg-orange-400 text-slate-950'; }
  else { label = 'Flat'; color = 'bg-slate-600 text-slate-300'; }

  return { score: clamped, label, color };
}

// Best score for the next 24 h (or first 24 points)
export function bestScoreToday(
  hourly: HourlyPoint[],
  offshoreWindDir: number
): SurfScore {
  const slice = hourly.slice(0, 24);
  if (slice.length === 0) return { score: 0, label: 'No data', color: 'bg-slate-600 text-slate-300' };
  const scores = slice.map((pt) => calcSurfScore(pt, offshoreWindDir));
  return scores.reduce((best, s) => (s.score > best.score ? s : best));
}
