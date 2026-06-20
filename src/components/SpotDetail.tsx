import { Star, RefreshCw, AlertCircle, Waves } from 'lucide-react';
import type { Spot, SpotForecast } from '../types';
import { bestScoreToday, calcSurfScore } from '../utils/surfScore';
import { degToCompass } from '../utils/wind';
import { CompassArrow } from './CompassArrow';
import { StatBox } from './StatBox';
import { lazy, Suspense } from 'react';
const WeatherChart = lazy(() => import('./WeatherChart').then(m => ({ default: m.WeatherChart })));
import { HourlyTable } from './HourlyTable';
import { TideSection } from './TideSection';
import { BuoyStub } from './BuoyStub';
import { SpotCamera } from './SpotCamera';

interface Props {
  spot: Spot;
  forecast: SpotForecast | null;
  loading: boolean;
  error: string | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onRefresh: () => void;
}

export function SpotDetail({ spot, forecast, loading, error, isFavorite, onToggleFavorite, onRefresh }: Props) {
  // Use the first upcoming hour as "now"
  const now = forecast?.hourly[0] ?? null;

  // Lagoon / sheltered beaches may have no swell data (all zeros from Marine API)
  const hasWaveData = now !== null && (now.waveHeight > 0 || now.swellHeight > 0);

  const score = hasWaveData ? calcSurfScore(now!, spot.offshoreWindDir) : null;
  const bestScore = (forecast && hasWaveData) ? bestScoreToday(forecast.hourly, spot.offshoreWindDir) : null;

  return (
    <div className="flex flex-col gap-4 p-4 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{spot.name}</h1>
          <p className="text-sm text-slate-400">{spot.region}, Portugal</p>
        </div>
        <button
          onClick={onToggleFavorite}
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Toggle favourite"
        >
          <Star size={20} className={isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-slate-500'} />
        </button>
        <button
          onClick={onRefresh}
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Refresh"
          disabled={loading}
        >
          <RefreshCw size={20} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Score badge */}
      {score && (
        <div className="flex items-center gap-3">
          <span className={`text-4xl font-black ${score.color} px-4 py-2 rounded-2xl`}>
            {score.score.toFixed(0)}
          </span>
          <div>
            <p className="font-semibold text-white text-lg">{score.label}</p>
            {bestScore && bestScore.score > score.score && (
              <p className="text-xs text-slate-400">Best today: <span className={`font-bold ${bestScore.color} px-1.5 py-0.5 rounded`}>{bestScore.score.toFixed(0)} — {bestScore.label}</span></p>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/40 rounded-xl px-4 py-3 text-red-300 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !forecast && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-800/60" />
          ))}
        </div>
      )}

      {/* Stats grid */}
      {now && (
        <>
          {/* No wave data notice for lagoon / sheltered beaches */}
          {!hasWaveData && (
            <div className="flex items-center gap-2 bg-slate-800/40 border border-slate-700/30 rounded-xl px-4 py-3 text-slate-400 text-sm">
              <Waves size={16} className="shrink-0 text-slate-500" />
              Sem dados de ondas — praia abrigada ou lagoa (Ria Formosa, etc.)
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {hasWaveData && (
              <>
                <StatBox label="Wave Height" value={now.waveHeight.toFixed(1)} unit="m" accent />
                <StatBox label="Wave Period" value={now.wavePeriod.toFixed(0)} unit="s" accent />
                <StatBox label="Swell" value={now.swellHeight.toFixed(1)} unit="m" sub={`${now.swellPeriod.toFixed(0)} s · ${degToCompass(now.swellDirection)}`} />
              </>
            )}
            <StatBox label="Wind" value={now.windSpeed.toFixed(0)} unit="km/h" sub={`Gusts ${now.windGusts.toFixed(0)} km/h`} />
            <StatBox label="Water Temp" value={now.seaSurfaceTemp.toFixed(1)} unit="°C" />
            <StatBox label="Air Temp" value={now.airTemp.toFixed(1)} unit="°C" sub={`UV ${now.uvIndex.toFixed(0)}`} />
          </div>

          {/* Directions row */}
          <div className="flex gap-6 items-center bg-slate-800/40 border border-slate-700/30 rounded-xl p-4">
            <div className="flex flex-col items-center gap-1">
              <CompassArrow direction={now.swellDirection} size={64} />
              <span className="text-xs text-slate-400">Swell {degToCompass(now.swellDirection)}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <CompassArrow direction={now.windDirection} size={64} />
              <span className="text-xs text-slate-400">Wind {degToCompass(now.windDirection)}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <CompassArrow direction={now.waveDirection} size={64} />
              <span className="text-xs text-slate-400">Waves {degToCompass(now.waveDirection)}</span>
            </div>
          </div>
        </>
      )}

      {/* Chart */}
      {forecast && (
        <Suspense fallback={<div className="h-64 rounded-xl bg-slate-800/60 animate-pulse" />}>
          <WeatherChart hourly={forecast.hourly} />
        </Suspense>
      )}

      {/* Hourly table */}
      {forecast && (
        <HourlyTable hourly={forecast.hourly} offshoreWindDir={spot.offshoreWindDir} />
      )}

      {/* Camera */}
      <SpotCamera spot={spot} />

      {/* Tide + Buoy */}
      <TideSection lat={spot.lat} lng={spot.lng} />
      <BuoyStub />

      {forecast && (
        <p className="text-xs text-slate-600 text-center">
          Data from Open-Meteo · Updated {new Date(forecast.fetchedAt).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
