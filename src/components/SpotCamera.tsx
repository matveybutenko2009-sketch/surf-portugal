import { Camera } from 'lucide-react';
import type { Spot } from '../types';

interface Props {
  spot: Spot;
}

export function SpotCamera({ spot }: Props) {
  if (!spot.cameraUrl) return null;

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700/40 bg-slate-900">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 border-b border-slate-700/40">
        <Camera size={14} className="text-cyan-400" />
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Live Cam</span>
        <span className="ml-auto text-xs text-slate-500">beachcam.pt</span>
      </div>
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={spot.cameraUrl}
          title={`${spot.name} live camera`}
          className="absolute inset-0 w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
      <p className="text-[10px] text-slate-600 px-4 py-1.5">
        Embedded stream from beachcam.pt — third-party content, not an API.
      </p>
    </div>
  );
}
