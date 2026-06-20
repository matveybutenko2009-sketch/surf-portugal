interface Props {
  direction: number; // degrees, 0 = N, 90 = E
  size?: number;
  className?: string;
}

export function CompassArrow({ direction, size = 48, className = '' }: Props) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Compass ring */}
      <div
        className="absolute inset-0 rounded-full border border-slate-600"
        style={{ width: size, height: size }}
      />
      {/* Cardinal labels */}
      <span className="absolute top-0.5 text-[9px] text-slate-500 font-mono leading-none" style={{ left: '50%', transform: 'translateX(-50%)' }}>N</span>
      <span className="absolute bottom-0.5 text-[9px] text-slate-500 font-mono leading-none" style={{ left: '50%', transform: 'translateX(-50%)' }}>S</span>
      <span className="absolute left-0.5 text-[9px] text-slate-500 font-mono leading-none" style={{ top: '50%', transform: 'translateY(-50%)' }}>W</span>
      <span className="absolute right-0.5 text-[9px] text-slate-500 font-mono leading-none" style={{ top: '50%', transform: 'translateY(-50%)' }}>E</span>
      {/* Arrow */}
      <div
        style={{ transform: `rotate(${direction}deg)` }}
        className="absolute inset-0 flex items-center justify-center transition-transform duration-500"
      >
        <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 20 20" fill="none">
          {/* Arrow pointing up = toward direction */}
          <path d="M10 2 L13 14 L10 12 L7 14 Z" fill="#22d3ee" />
          <path d="M10 18 L7 6 L10 8 L13 6 Z" fill="#475569" />
        </svg>
      </div>
    </div>
  );
}
