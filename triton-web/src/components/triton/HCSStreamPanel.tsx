interface HCSEntry {
  seq: number;
  timestamp: string;
  sensor: string;
  value: string;
  hmac: string;
  compliant: boolean;
}

interface HCSStreamPanelProps {
  entries: HCSEntry[];
}

export default function HCSStreamPanel({ entries }: HCSStreamPanelProps) {
  return (
    <div className="triton-card bg-[#1C1C1C] text-white halftone-dark">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] pulse-dot" />
          <h3 className="label-micro text-white/70">HCS TRUTH STREAM</h3>
        </div>
        <div className="hcs-scroll overflow-y-auto max-h-[280px] space-y-1">
          {entries.map((e, i) => (
            <div
              key={`${e.seq}-${i}`}
              className={`font-mono-data text-xs py-1.5 px-2 rounded flex flex-wrap gap-x-3 ${
                i === 0 ? 'animate-slide-in-top bg-white/5' : ''
              }`}
            >
              <span className="text-[#1A56FF]">[{e.seq}]</span>
              <span className="text-white/40">{e.timestamp}</span>
              <span className="text-white/70">{e.sensor}</span>
              <span className="text-white font-semibold">{e.value}</span>
              <span className="text-white/30">{e.hmac}...</span>
              <span className={e.compliant ? 'text-[#22C55E]' : 'text-[#EF4444]'}>
                {e.compliant ? '✓ COMPLIANT' : '✗ BREACH'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
