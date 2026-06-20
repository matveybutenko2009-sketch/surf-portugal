import type {
  MarineResponse,
  ForecastResponse,
  HourlyPoint,
  SpotForecast,
} from '../types';
import type { Spot } from '../types';

const MARINE_URL = 'https://marine-api.open-meteo.com/v1/marine';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

const MARINE_PARAMS = [
  'wave_height',
  'wave_direction',
  'wave_period',
  'swell_wave_height',
  'swell_wave_direction',
  'swell_wave_period',
  'wind_wave_height',
  'sea_surface_temperature',
].join(',');

const FORECAST_PARAMS = [
  'wind_speed_10m',
  'wind_gusts_10m',
  'wind_direction_10m',
  'temperature_2m',
  'weather_code',
  'uv_index',
  'precipitation',
].join(',');

function buildUrl(base: string, lat: number, lng: number, hourly: string): string {
  return (
    `${base}?latitude=${lat}&longitude=${lng}` +
    `&hourly=${hourly}&forecast_days=7&timezone=auto`
  );
}

export async function fetchSpotForecast(spot: Spot): Promise<SpotForecast> {
  const [marineRes, forecastRes] = await Promise.all([
    fetch(buildUrl(MARINE_URL, spot.lat, spot.lng, MARINE_PARAMS)),
    fetch(buildUrl(FORECAST_URL, spot.lat, spot.lng, FORECAST_PARAMS)),
  ]);

  if (!marineRes.ok) throw new Error(`Marine API error: ${marineRes.status}`);
  if (!forecastRes.ok) throw new Error(`Forecast API error: ${forecastRes.status}`);

  const marine: MarineResponse = await marineRes.json();
  const forecast: ForecastResponse = await forecastRes.json();

  const mh = marine.hourly;
  const fh = forecast.hourly;

  const hourly: HourlyPoint[] = mh.time.map((time, i) => ({
    time,
    waveHeight: mh.wave_height[i] ?? 0,
    wavePeriod: mh.wave_period[i] ?? 0,
    waveDirection: mh.wave_direction[i] ?? 0,
    swellHeight: mh.swell_wave_height[i] ?? 0,
    swellPeriod: mh.swell_wave_period[i] ?? 0,
    swellDirection: mh.swell_wave_direction[i] ?? 0,
    windWaveHeight: mh.wind_wave_height[i] ?? 0,
    seaSurfaceTemp: mh.sea_surface_temperature[i] ?? 0,
    windSpeed: fh.wind_speed_10m[i] ?? 0,
    windGusts: fh.wind_gusts_10m[i] ?? 0,
    windDirection: fh.wind_direction_10m[i] ?? 0,
    airTemp: fh.temperature_2m[i] ?? 0,
    weatherCode: fh.weather_code[i] ?? 0,
    uvIndex: fh.uv_index[i] ?? 0,
    precipitation: fh.precipitation[i] ?? 0,
  }));

  return { spot, hourly, fetchedAt: Date.now() };
}
