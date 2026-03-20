interface SensorCardProps {
  name: string;
  value: number;
  unit: string;
  thresholdLabel: string;
  sensorDid: string;
  inBreach: boolean;
}

export default function SensorCard({ name, value, unit, thresholdLabel, sensorDid, inBreach }: SensorCardProps) {
  return (
    <div
      className={`triton-card halftone-blue bg-[#1A56FF] text-white transition-all duration-400 ease ${
        inBreach ? 'ring-2 ring-[#EF4444] ring-offset-2 ring-offset-[#111111]' : ''
      }`}
    >
      <div className="relative z-10">
        <p className="label-micro text-white/60 mb-3">{name}</p>
        <p className="font-mono-data text-5xl font-extrabold mb-1 transition-all duration-400">
          {typeof value === 'number' ? (Number.isInteger(value) ? value.toLocaleString() : value.toFixed(2)) : value}
          <span className="text-lg font-normal ml-2 opacity-70">{unit}</span>
        </p>
        <p className="text-xs text-white/50 mt-3 font-mono-data">{thresholdLabel}</p>
        <p className="text-[10px] text-white/30 mt-1 font-mono-data truncate">{sensorDid}</p>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-[20px] ${inBreach ? 'bg-[#EF4444]' : 'bg-[#22C55E]'}`} />
    </div>
  );
}
