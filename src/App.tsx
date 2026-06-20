import { useState, useEffect, useCallback } from 'react';
import { Waves, Menu, X } from 'lucide-react';
import { SPOTS } from './spots';
import type { Spot, SpotForecast } from './types';
import { useForecast } from './hooks/useForecast';
import { useFavorites } from './hooks/useFavorites';
import { usePrefetchScores } from './hooks/usePrefetchScores';
import { SpotList } from './components/SpotList';
import { SpotDetail } from './components/SpotDetail';
import { InstallBanner } from './components/InstallBanner';

const ACTIVE_SPOT_KEY = 'surf-pt-active-spot';

function loadActiveSpot(): Spot {
  try {
    const id = localStorage.getItem(ACTIVE_SPOT_KEY);
    return SPOTS.find((s) => s.id === id) ?? SPOTS[0];
  } catch {
    return SPOTS[0];
  }
}

// Only prefetch the hand-curated surf spots (first 19) — not all 183 OSM beaches.
// Prefetching 183 would hammer the API; scores for the full list load on demand.
const PREFETCH_SPOTS = SPOTS.slice(0, 19);

export default function App() {
  const [activeSpot, setActiveSpot] = useState<Spot>(loadActiveSpot);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const { favorites, toggle: toggleFavorite } = useFavorites();
  const { data: forecast, loading, error } = useForecast(activeSpot, refreshToken);
  const [forecastCache, setForecastCache] = useState<Record<string, SpotForecast>>({});

  // Merge active forecast into cache
  useEffect(() => {
    if (forecast) {
      setForecastCache((prev) => ({ ...prev, [activeSpot.id]: forecast }));
    }
  }, [forecast, activeSpot.id]);

  // Background prefetch for sidebar scores
  const handleBatch = useCallback((batch: Record<string, SpotForecast>) => {
    setForecastCache((prev) => ({ ...prev, ...batch }));
  }, []);

  usePrefetchScores(PREFETCH_SPOTS, handleBatch, activeSpot.id);

  function selectSpot(spot: Spot) {
    setActiveSpot(spot);
    localStorage.setItem(ACTIVE_SPOT_KEY, spot.id);
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <InstallBanner />

      {/* Top nav */}
      <header className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <button
          className="lg:hidden p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X size={20} className="text-slate-300" /> : <Menu size={20} className="text-slate-300" />}
        </button>
        <Waves size={22} className="text-cyan-400" />
        <span className="font-bold text-white tracking-tight text-lg">Surf Portugal</span>
        <span className="ml-auto text-xs text-slate-500 hidden sm:block">Open-Meteo · beachcam.pt</span>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        {/* Overlay (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-[53px] z-40 lg:z-auto
          h-[calc(100vh-53px)] w-64
          bg-slate-900 border-r border-slate-800 overflow-y-auto shrink-0
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="px-3 pt-3 pb-1">
            <h2 className="text-xs text-slate-500 uppercase tracking-wider font-semibold px-3">Spots</h2>
          </div>
          <SpotList
            spots={SPOTS}
            activeId={activeSpot.id}
            favorites={favorites}
            onSelect={selectSpot}
            onToggleFavorite={toggleFavorite}
            forecasts={forecastCache}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto lg:ml-0">
          <SpotDetail
            spot={activeSpot}
            forecast={forecast}
            loading={loading}
            error={error}
            isFavorite={favorites.has(activeSpot.id)}
            onToggleFavorite={() => toggleFavorite(activeSpot.id)}
            onRefresh={() => setRefreshToken((t) => t + 1)}
          />
        </main>
      </div>
    </div>
  );
}
