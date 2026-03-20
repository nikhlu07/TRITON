import { type SensorReading } from '@/utils/sensorSimulator';

interface HistoricalChartProps {
  data: SensorReading[];
}

export default function HistoricalChart({ data }: HistoricalChartProps) {
  // Chart dimensions
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Data ranges
  const minPH = 5.0;
  const maxPH = 10.0;
  const minTDS = 1000;
  const maxTDS = 3000;

  // Mapping functions
  const mapX = (index: number) => padding.left + (index / Math.max(1, data.length - 1)) * graphWidth;
  const mapY_pH = (val: number) => padding.top + graphHeight - ((val - minPH) / (maxPH - minPH)) * graphHeight;
  const mapY_TDS = (val: number) => padding.top + graphHeight - ((val - minTDS) / (maxTDS - minTDS)) * graphHeight;

  // Paths
  const phPoints = data.map((d, i) => `${mapX(i)},${mapY_pH(d.pH)}`).join(' ');
  const tdsPoints = data.map((d, i) => `${mapX(i)},${mapY_TDS(d.tds)}`).join(' ');

  return (
    <div className="triton-card bg-[#1C1C1C] text-white border border-[#E5E7EB]/10 w-full overflow-hidden">
      <div className="relative z-10 p-4">
        <h3 className="font-mono-data text-sm text-[#1A56FF] mb-4 tracking-wider">REAL-TIME SENSOR TELEMETRY (pH & TDS)</h3>
        
        <div className="w-full overflow-x-auto overflow-y-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[600px] h-auto" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(pct => {
              const y = padding.top + pct * graphHeight;
              return (
                <g key={pct}>
                  <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <text x={padding.left - 10} y={y + 4} fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="end" fontFamily="monospace">
                    {((1 - pct) * (maxPH - minPH) + minPH).toFixed(1)}
                  </text>
                  <text x={width - padding.right + 10} y={y + 4} fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="start" fontFamily="monospace">
                    {Math.round((1 - pct) * (maxTDS - minTDS) + minTDS)}
                  </text>
                </g>
              );
            })}

            {/* Threshold Lines */}
            <line x1={padding.left} y1={mapY_pH(8.5)} x2={width - padding.right} y2={mapY_pH(8.5)} stroke="#EF4444" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
            <line x1={padding.left} y1={mapY_pH(6.5)} x2={width - padding.right} y2={mapY_pH(6.5)} stroke="#EF4444" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
            <text x={padding.left + 5} y={mapY_pH(8.5) - 5} fill="#EF4444" fontSize="9" opacity="0.8">pH 8.5 Max</text>
            <text x={padding.left + 5} y={mapY_pH(6.5) + 12} fill="#EF4444" fontSize="9" opacity="0.8">pH 6.5 Min</text>

            <line x1={padding.left} y1={mapY_TDS(2100)} x2={width - padding.right} y2={mapY_TDS(2100)} stroke="#EAB308" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
            <text x={width - padding.right - 5} y={mapY_TDS(2100) - 5} fill="#EAB308" fontSize="9" opacity="0.8" textAnchor="end">TDS 2100 Max</text>

            {/* Data Lines */}
            {data.length > 1 && (
              <>
                <polyline points={phPoints} fill="none" stroke="#1A56FF" strokeWidth="2" strokeLinejoin="round" />
                <polyline points={tdsPoints} fill="none" stroke="#22C55E" strokeWidth="2" strokeLinejoin="round" />
              </>
            )}

            {/* Data Points */}
            {data.map((d, i) => (
              <g key={i}>
                <circle cx={mapX(i)} cy={mapY_pH(d.pH)} r="3" fill={d.pHBreach ? '#EF4444' : '#1A56FF'} />
                <circle cx={mapX(i)} cy={mapY_TDS(d.tds)} r="3" fill={d.tdsBreach ? '#EF4444' : '#22C55E'} />
              </g>
            ))}
          </svg>
        </div>
        
        {/* Legend */}
        <div className="flex gap-6 mt-4 justify-center text-xs font-mono-data opacity-80">
          <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#1A56FF] rounded-full inline-block"></span> pH Readout</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#22C55E] rounded-full inline-block"></span> TDS (mg/L) Readout</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#EF4444] rounded-full inline-block"></span> Breach Marker</div>
        </div>
      </div>
    </div>
  );
}
