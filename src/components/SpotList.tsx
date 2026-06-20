import { useState, useMemo } from 'react';
import { Star, Waves, Search, ChevronDown, ChevronRight } from 'lucide-react';
import type { Spot, SpotForecast } from '../types';
import { bestScoreToday } from '../utils/surfScore';

interface Props {
  spots: Spot[];
  activeId: string | null;
  favorites: Set<string>;
  onSelect: (spot: Spot) => void;
  onToggleFavorite: (id: string) => void;
  forecasts: Record<string, SpotForecast>;
}

// Strip diacritics for search
function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// ── Spot row ────────────────────────────────────────────────────────────────

interface SpotRowProps {
  spot: Spot;
  isActive: boolean;
  isFavorite: boolean;
  score: ReturnType<typeof bestScoreToday> | null;
  onSelect: () => void;
  onToggleFavorite: () => void;
}

function SpotRow({ spot, isActive, isFavorite, score, onSelect, onToggleFavorite }: SpotRowProps) {
  return (
    <button
      onClick={onSelect}
      className={`
        w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all
        ${isActive
          ? 'bg-cyan-500/20 border border-cyan-500/40 text-white'
          : 'hover:bg-slate-800 border border-transparent text-slate-300'}
      `}
    >
      <Waves size={13} className={`shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-600'}`} />
      <span className="flex-1 min-w-0 text-sm truncate">{spot.name}</span>
      {score && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${score.color} shrink-0`}>
          {score.score.toFixed(0)}
        </span>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
        className="shrink-0 p-0.5 rounded hover:scale-110 transition-transform"
        aria-label="Toggle favourite"
      >
        <Star size={11} className={isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-slate-700'} />
      </button>
    </button>
  );
}

// ── Collapsible section ─────────────────────────────────────────────────────

interface SectionProps {
  label: string;
  count: number;
  defaultOpen?: boolean;
  indent?: boolean;
  children: React.ReactNode;
}

function Section({ label, count, defaultOpen = true, indent = false, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={indent ? 'ml-3' : ''}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-800/50 rounded-lg transition-colors group"
      >
        {open
          ? <ChevronDown size={11} className="text-slate-500 shrink-0" />
          : <ChevronRight size={11} className="text-slate-500 shrink-0" />
        }
        <span className={`text-[10px] uppercase tracking-widest font-semibold ${indent ? 'text-slate-600' : 'text-slate-500'}`}>
          {label}
        </span>
        <span className="ml-auto text-[10px] text-slate-700">{count}</span>
      </button>
      {open && <div className="flex flex-col gap-0.5 mb-1">{children}</div>}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export function SpotList({ spots, activeId, favorites, onSelect, onToggleFavorite, forecasts }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return spots;
    const q = normalize(query.trim());
    return spots.filter((s) =>
      normalize(s.name).includes(q) ||
      normalize(s.region).includes(q) ||
      (s.subregion && normalize(s.subregion).includes(q))
    );
  }, [spots, query]);

  const isSearching = !!query.trim();
  const favSpots = filtered.filter((s) => favorites.has(s.id));
  const nonFav   = filtered.filter((s) => !favorites.has(s.id));

  // Build region → (subregion → spots[]) tree
  const tree = useMemo(() => {
    const regions = new Map<string, Map<string, Spot[]>>();
    for (const s of nonFav) {
      if (!regions.has(s.region)) regions.set(s.region, new Map());
      const subKey = s.subregion ?? '__none__';
      const subMap = regions.get(s.region)!;
      if (!subMap.has(subKey)) subMap.set(subKey, []);
      subMap.get(subKey)!.push(s);
    }
    return regions;
  }, [nonFav]);

  function renderSpot(spot: Spot) {
    const fc = forecasts[spot.id];
    const score = fc ? bestScoreToday(fc.hourly, spot.offshoreWindDir) : null;
    return (
      <SpotRow
        key={spot.id}
        spot={spot}
        isActive={spot.id === activeId}
        isFavorite={favorites.has(spot.id)}
        score={score}
        onSelect={() => onSelect(spot)}
        onToggleFavorite={() => onToggleFavorite(spot.id)}
      />
    );
  }

  // Ordered municipality display within Algarve (west coast N→S, then south coast W→E)
  const ALGARVE_ORDER = ['Aljezur', 'Vila do Bispo', 'Lagos', 'Portimão', 'Lagoa',
    'Albufeira', 'Loulé', 'Faro', 'Olhão', 'Tavira', 'VRSA'];

  function sortedSubregions(subMap: Map<string, Spot[]>, region: string): [string, Spot[]][] {
    const entries = [...subMap.entries()];
    if (region === 'Algarve') {
      entries.sort(([a], [b]) => {
        const ai = ALGARVE_ORDER.indexOf(a);
        const bi = ALGARVE_ORDER.indexOf(b);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
    }
    return entries;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-3 pb-2 pt-1">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar praia…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-7 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-600 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>
        {isSearching && (
          <p className="text-[10px] text-slate-600 mt-1 px-1">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* List */}
      <nav className="flex-1 overflow-y-auto px-2 pb-6">
        {/* Favourites */}
        {favSpots.length > 0 && (
          <Section label="★ Favoritos" count={favSpots.length} defaultOpen>
            {favSpots.map(renderSpot)}
          </Section>
        )}

        {/* Region groups */}
        {[...tree.entries()].map(([region, subMap]) => {
          const hasSubregions = subMap.size > 1 || !subMap.has('__none__');
          const totalInRegion = [...subMap.values()].reduce((n, arr) => n + arr.length, 0);
          const defaultOpenRegion = region !== 'Algarve' || isSearching;

          return (
            <Section
              key={region}
              label={region}
              count={totalInRegion}
              defaultOpen={defaultOpenRegion}
            >
              {hasSubregions && !isSearching
                ? sortedSubregions(subMap, region).map(([sub, subSpots]) => (
                    <Section
                      key={sub}
                      label={sub === '__none__' ? region : sub}
                      count={subSpots.length}
                      defaultOpen={subSpots.length <= 8}
                      indent
                    >
                      {subSpots.map(renderSpot)}
                    </Section>
                  ))
                : [...subMap.values()].flat().map(renderSpot)
              }
            </Section>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-sm text-slate-600 text-center py-8">Nenhuma praia encontrada</p>
        )}
      </nav>
    </div>
  );
}
