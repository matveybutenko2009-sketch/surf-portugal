import { useEffect } from 'react';
import type { Spot, SpotForecast } from '../types';
import { fetchSpotForecast } from '../api/openMeteo';

// Module-level cache shared with useForecast
// We import it indirectly via the same cache object in openMeteo — but since
// useForecast has its own in-memory cache, we write directly into that same
// module cache by re-exporting it here.
const PREFETCH_CACHE: Record<string, SpotForecast> = {};

// Batch size and delay between batches (ms) — gentle on the API
const BATCH_SIZE = 4;
const BATCH_DELAY = 2000;

export function usePrefetchScores(
  spots: Spot[],
  onBatchDone: (results: Record<string, SpotForecast>) => void,
  skip?: string // skip the active spot (already fetched)
) {
  useEffect(() => {
    if (spots.length === 0) return;

    // Only prefetch spots not yet in cache
    const toFetch = spots.filter(
      (s) => s.id !== skip && !PREFETCH_CACHE[s.id]
    );

    if (toFetch.length === 0) return;

    let cancelled = false;

    async function run() {
      for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
        if (cancelled) break;
        const batch = toFetch.slice(i, i + BATCH_SIZE);

        const results = await Promise.allSettled(
          batch.map((s) => fetchSpotForecast(s))
        );

        if (cancelled) break;

        const batch_cache: Record<string, SpotForecast> = {};
        results.forEach((r, idx) => {
          if (r.status === 'fulfilled') {
            PREFETCH_CACHE[batch[idx].id] = r.value;
            batch_cache[batch[idx].id] = r.value;
          }
        });

        onBatchDone({ ...PREFETCH_CACHE, ...batch_cache });

        if (i + BATCH_SIZE < toFetch.length) {
          await new Promise((res) => setTimeout(res, BATCH_DELAY));
        }
      }
    }

    run();
    return () => { cancelled = true; };
  // Only run once on mount (spots list is stable)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export { PREFETCH_CACHE };
