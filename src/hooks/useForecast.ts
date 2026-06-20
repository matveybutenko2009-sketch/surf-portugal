import { useState, useEffect } from 'react';
import type { Spot, SpotForecast } from '../types';
import { fetchSpotForecast } from '../api/openMeteo';

const CACHE_TTL = 30 * 60 * 1000; // 30 min

const cache: Record<string, SpotForecast> = {};

export function useForecast(spot: Spot | null, refreshToken = 0) {
  const [data, setData] = useState<SpotForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!spot) return;

    const cacheKey = spot.id;
    const cached = cache[cacheKey];

    // Skip cache when refresh was explicitly requested
    if (refreshToken === 0 && cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      setData(cached);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchSpotForecast(spot)
      .then((result) => {
        if (!cancelled) {
          cache[cacheKey] = result;
          setData(result);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [spot?.id, refreshToken]);

  return { data, loading, error };
}
