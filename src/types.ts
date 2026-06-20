export interface Spot {
  id: string;
  name: string;
  region: string;
  subregion?: string; // municipality within region (e.g. 'Lagos' within 'Algarve')
  lat: number;
  lng: number;
  cameraUrl?: string;
  offshoreWindDir: number;
}

export interface MarineHourly {
  time: string[];
  wave_height: number[];
  wave_direction: number[];
  wave_period: number[];
  swell_wave_height: number[];
  swell_wave_direction: number[];
  swell_wave_period: number[];
  wind_wave_height: number[];
  sea_surface_temperature: number[];
}

export interface ForecastHourly {
  time: string[];
  wind_speed_10m: number[];
  wind_gusts_10m: number[];
  wind_direction_10m: number[];
  temperature_2m: number[];
  weather_code: number[];
  uv_index: number[];
  precipitation: number[];
}

export interface MarineResponse {
  hourly: MarineHourly;
  hourly_units: Record<string, string>;
}

export interface ForecastResponse {
  hourly: ForecastHourly;
  hourly_units: Record<string, string>;
}

export interface HourlyPoint {
  time: string;
  waveHeight: number;
  wavePeriod: number;
  waveDirection: number;
  swellHeight: number;
  swellPeriod: number;
  swellDirection: number;
  windWaveHeight: number;
  seaSurfaceTemp: number;
  windSpeed: number;
  windGusts: number;
  windDirection: number;
  airTemp: number;
  weatherCode: number;
  uvIndex: number;
  precipitation: number;
}

export interface SpotForecast {
  spot: Spot;
  hourly: HourlyPoint[];
  fetchedAt: number;
}

export interface SurfScore {
  score: number;       // 0–10
  label: string;
  color: string;
}
