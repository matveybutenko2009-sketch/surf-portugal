import { Waves } from 'lucide-react';

// TODO: integrate WorldTides or Stormglass with VITE_TIDE_API_KEY
// API key expected in import.meta.env.VITE_TIDE_API_KEY
export function TideStub() {
  const hasKey = !!import.meta.env.VITE_TIDE_API_KEY;

  if (hasKey) {
    // TODO: fetch and render tide data
    return null;
  }

  return (
    <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 flex items-center gap-3">
      <Waves size={18} className="text-slate-500 shrink-0" />
      <div>
        <p className="text-sm text-slate-400 font-medium">Tide data not available</p>
        <p className="text-xs text-slate-600">
          Add <code className="bg-slate-700 px-1 rounded text-slate-300">VITE_TIDE_API_KEY</code> to{' '}
          <code className="bg-slate-700 px-1 rounded text-slate-300">.env</code> (WorldTides / Stormglass)
        </p>
      </div>
    </div>
  );
}
