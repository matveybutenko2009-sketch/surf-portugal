// WMO weather code → emoji icon
// https://open-meteo.com/en/docs#weathervariables
export function weatherIcon(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 2) return '🌤️';
  if (code === 3) return '☁️';
  if (code <= 49) return '🌫️'; // fog
  if (code <= 59) return '🌦️'; // drizzle
  if (code <= 69) return '🌧️'; // rain
  if (code <= 79) return '🌨️'; // snow
  if (code <= 82) return '🌧️'; // showers
  if (code <= 84) return '🌨️'; // snow showers
  if (code <= 99) return '⛈️'; // thunderstorm
  return '❓';
}
