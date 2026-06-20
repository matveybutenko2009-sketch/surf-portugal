// WorldTides API v3 — https://www.worldtides.info/api
// Add VITE_TIDE_API_KEY=<your_key> to .env

export interface TideHeight {
  dt: number;   // unix timestamp
  date: string; // ISO
  height: number;
}

export interface TideExtreme {
  dt: number;
  date: string;
  height: number;
  type: 'High' | 'Low';
}

export interface TideData {
  heights: TideHeight[];
  extremes: TideExtreme[];
  fetchedAt: number;
}

const CACHE: Record<string, TideData> = {};
const CACHE_TTL = 60 * 60 * 1000; // 1 h (tide data changes slowly)

export async function fetchTides(lat: number, lng: number): Promise<TideData> {
  const key = import.meta.env.VITE_TIDE_API_KEY as string | undefined;
  if (!key) throw new Error('NO_KEY');

  const cacheKey = `${lat},${lng}`;
  const cached = CACHE[cacheKey];
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) return cached;

  const params = new URLSearchParams({
    heights: '',
    extremes: '',
    lat: String(lat),
    lon: String(lng),
    days: '2',
    key,
  });

  const res = await fetch(`https://www.worldtides.info/api/v3?${params}`);
  if (!res.ok) throw new Error(`WorldTides ${res.status}: ${res.statusText}`);

  const json = await res.json();

  if (json.status !== 200) {
    throw new Error(json.error ?? `WorldTides error ${json.status}`);
  }

  const data: TideData = {
    heights: (json.heights ?? []) as TideHeight[],
    extremes: (json.extremes ?? []) as TideExtreme[],
    fetchedAt: Date.now(),
  };

  CACHE[cacheKey] = data;
  return data;
}
