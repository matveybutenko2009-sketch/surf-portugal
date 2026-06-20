const DIRS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

export function degToCompass(deg: number): string {
  const idx = Math.round(deg / 22.5) % 16;
  return DIRS[idx];
}

export function degToArrow(deg: number): string {
  // Returns a rotation style value (CSS transform: rotate)
  return `${deg}deg`;
}
