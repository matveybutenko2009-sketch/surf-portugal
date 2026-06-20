import { Radio } from 'lucide-react';

// TODO: integrate IPMA buoy data (https://www.ipma.pt/en/maritima/index.jsp)
// or Puertos del Estado JSON feed when a clean endpoint is found.
export function BuoyStub() {
  return (
    <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 flex items-center gap-3">
      <Radio size={18} className="text-slate-500 shrink-0" />
      <div>
        <p className="text-sm text-slate-400 font-medium">Buoy readings — coming soon</p>
        <p className="text-xs text-slate-600">
          TODO: IPMA / Puertos del Estado live buoy feed
        </p>
      </div>
    </div>
  );
}
