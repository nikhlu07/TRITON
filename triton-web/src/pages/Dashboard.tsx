import { useEffect, useState, useRef } from 'react';
import SensorCard from '@/components/triton/SensorCard';
import HCSStreamPanel from '@/components/triton/HCSStreamPanel';
import HistoricalChart from '@/components/triton/HistoricalChart';
import StatusBadge from '@/components/triton/StatusBadge';
import { generateReading, getWrtCount, type SensorReading } from '@/utils/sensorSimulator';

function randomHex(n: number) {
  const c = '0123456789abcdef';
  let s = '';
  for (let i = 0; i < n; i++) s += c[Math.floor(Math.random() * 16)];
  return s;
}

interface HCSEntry {
  seq: number;
  timestamp: string;
  sensor: string;
  value: string;
  hmac: string;
  compliant: boolean;
}

function readingToEntries(r: SensorReading): HCSEntry[] {
  const ts = r.timestamp.toISOString().slice(11, 19);
  return [
    { seq: r.hcsSequence, timestamp: ts, sensor: 'pH_SENSOR_01', value: r.pH.toFixed(2), hmac: r.hmacHash.slice(0, 16), compliant: !r.pHBreach },
    { seq: r.hcsSequence + 1, timestamp: ts, sensor: 'TDS_SENSOR_01', value: `${r.tds} mg/L`, hmac: randomHex(16), compliant: !r.tdsBreach },
    { seq: r.hcsSequence + 2, timestamp: ts, sensor: 'FLOW_SENSOR_01', value: `${r.flowRate} m³/h`, hmac: randomHex(16), compliant: true },
  ];
}

interface PolicyEval {
  timestamp: string;
  ph: number;
  tds: number;
  flow: number;
  verdict: 'COMPLIANT' | 'BREACH';
  action: string;
}

export default function Dashboard() {
  const [reading, setReading] = useState<SensorReading>(generateReading());
  const [readingHistory, setReadingHistory] = useState<SensorReading[]>([reading]);
  const [hcsEntries, setHcsEntries] = useState<HCSEntry[]>(() => readingToEntries(reading));
  const [wrt, setWrt] = useState(14);
  const [clock, setClock] = useState(new Date());
  const [policyLog, setPolicyLog] = useState<PolicyEval[]>([]);
  const clockRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    clockRef.current = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(clockRef.current);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const r = generateReading();
      setReading(r);
      const newEntries = readingToEntries(r);
      setHcsEntries(prev => [...newEntries, ...prev].slice(0, 30));
      setReadingHistory(prev => [...prev.slice(-29), r]);
      setWrt(getWrtCount(r.anyBreach));
      setPolicyLog(prev => [{
        timestamp: r.timestamp.toISOString().slice(11, 19),
        ph: r.pH, tds: r.tds, flow: r.flowRate,
        verdict: (r.anyBreach ? 'BREACH' : 'COMPLIANT') as 'BREACH' | 'COMPLIANT',
        action: r.anyBreach ? 'FREEZE' : (Math.random() > 0.7 ? 'MINT' : 'ACCUMULATE'),
      }, ...prev].slice(0, 5));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const breach = reading.anyBreach;

  return (
    <div className="pt-16 bg-[#0A0A0A] text-white blueprint-grid min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Status Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-mono-data label-micro text-[#1A56FF] text-base mb-1">TRITON OPERATOR CONSOLE</h1>
            <p className="font-mono-data text-white/50 text-xs">did:hedera:testnet:z6MkFACTORY_001</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono-data text-white/50 text-sm">{clock.toISOString().slice(11, 19)} UTC</span>
            <StatusBadge status={breach ? 'breach' : 'compliant'} label={breach ? 'SYSTEM: BREACH DETECTED' : 'SYSTEM: COMPLIANT'} />
          </div>
        </div>

        {/* Sensor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <SensorCard name="pH LEVEL" value={reading.pH} unit="pH" thresholdLabel="Threshold: 6.5 – 8.5" sensorDid="did:hedera:testnet:z6MkpH_SENSOR_01" inBreach={reading.pHBreach} />
          <SensorCard name="TOTAL DISSOLVED SOLIDS" value={reading.tds} unit="mg/L" thresholdLabel="Threshold: ≤ 2,100 mg/L" sensorDid="did:hedera:testnet:z6MkTDS_SENSOR_01" inBreach={reading.tdsBreach} />
          <SensorCard name="FLOW RATE" value={reading.flowRate} unit="m³/h" thresholdLabel="Threshold: 42.0 – 58.0 m³/h" sensorDid="did:hedera:testnet:z6MkFLOW_SENSOR_01" inBreach={reading.flowBreach} />
        </div>

        {/* Historical Chart */}
        <div className="mb-6">
          <HistoricalChart data={readingHistory} />
        </div>

        {/* HCS Stream */}
        <div className="mb-6">
          <HCSStreamPanel entries={hcsEntries.slice(0, 10)} />
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* WRT Counter */}
          <div className="triton-card halftone-blue bg-[#1A56FF] text-white">
            <div className="relative z-10">
              <p className="label-micro text-white/60 mb-2">WRT MINTED TODAY</p>
              <p className="font-mono-data text-5xl font-extrabold">{wrt}</p>
              <p className="text-xs text-white/50 mt-3">1 WRT = 24 consecutive hours of verified clean-water output</p>
            </div>
          </div>

          {/* VGB Badge */}
          <div className={`triton-card bg-[#1C1C1C] text-white halftone-dark ${breach ? 'freeze-anim' : ''}`}>
            <div className="relative z-10">
              <p className="label-micro text-white/60 mb-2">VORTEX GREEN BADGE</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{breach ? '🛑' : '🛡️'}</span>
                <span className={`font-bold text-xl ${breach ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                  {breach ? 'FROZEN' : 'ACTIVE'}
                </span>
              </div>
              <p className="font-mono-data text-xs text-white/30">Token ID: 0.0.4821044</p>
              <p className="text-xs text-white/40 mt-2">Soulbound NFT — auto-freezes on breach</p>
            </div>
          </div>

          {/* Guardian Policy */}
          <div className="triton-card bg-[#1C1C1C] text-white halftone-dark">
            <div className="relative z-10">
              <p className="label-micro text-white/60 mb-3">GUARDIAN POLICY LOG</p>
              <div className="space-y-2">
                {policyLog.length === 0 && <p className="text-white/30 text-xs font-mono-data">Awaiting evaluations...</p>}
                {policyLog.map((p, i) => (
                  <div key={i} className="font-mono-data text-[11px] flex flex-wrap gap-x-2">
                    <span className="text-white/30">{p.timestamp}</span>
                    <span className="text-white/60">pH:{p.ph} TDS:{p.tds}</span>
                    <span className={p.verdict === 'COMPLIANT' ? 'text-[#22C55E]' : 'text-[#EF4444]'}>{p.verdict}</span>
                    <span className="text-[#1A56FF]">{p.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
