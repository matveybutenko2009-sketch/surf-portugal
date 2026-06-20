import { useState, useEffect } from 'react';
import type { TideData } from '../api/tides';
import { fetchTides } from '../api/tides';

export type TideState =
  | { status: 'no_key' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ok'; data: TideData };

export function useTides(lat: number, lng: number): TideState {
  const hasKey = !!import.meta.env.VITE_TIDE_API_KEY;
  const [state, setState] = useState<TideState>(
    hasKey ? { status: 'loading' } : { status: 'no_key' }
  );

  useEffect(() => {
    if (!hasKey) {
      setState({ status: 'no_key' });
      return;
    }

    let cancelled = false;
    setState({ status: 'loading' });

    fetchTides(lat, lng)
      .then((data) => {
        if (!cancelled) setState({ status: 'ok', data });
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ status: 'error', message: err.message });
      });

    return () => { cancelled = true; };
  }, [lat, lng, hasKey]);

  return state;
}
