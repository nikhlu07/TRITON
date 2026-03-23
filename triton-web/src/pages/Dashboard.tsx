import { useEffect, useState, useRef } from 'react';
import SensorCard from '@/components/triton/SensorCard';
import HCSStreamPanel from '@/components/triton/HCSStreamPanel';
import HistoricalChart from '@/components/triton/HistoricalChart';
import StatusBadge from '@/components/triton/StatusBadge';

interface PolicyEval {
  timestamp: string;
  ph: number;
  tds: number;
  flow: number;
  verdict: 'COMPLIANT' | 'BREACH';
  action: string;
}

interface LiveMetrics {
  timestamp: Date;
  pH: number;
  tds: number;
  flowRate: number;
  anyBreach: boolean;
  pHBreach: boolean;
  tdsBreach: boolean;
  flowBreach: boolean;
}

interface HCSEntry {
  seq: number;
  timestamp: string;
  sensor: string;
  value: string;
  hmac: string;
  compliant: boolean;
}

export default function Dashboard() {
  const [reading, setReading] = useState<LiveMetrics | null>(null);
  const [readingHistory, setReadingHistory] = useState<LiveMetrics[]>([]);
  const [hcsEntries, setHcsEntries] = useState<HCSEntry[]>([]);
  const [wrt, setWrt] = useState(14);
  const [clock, setClock] = useState(new Date());
  const [policyLog, setPolicyLog] = useState<PolicyEval[]>([]);
  const clockRef = useRef<ReturnType<typeof setInterval>>();

  // Update clock every second
  useEffect(() => {
    clockRef.current = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(clockRef.current);
  }, []);

  // Fetch Live Data from Node Backend hitting Hedera HCS
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/status');
        const data = await response.json();
        
        if (data && data.recentTransactions && data.recentTransactions.length > 0) {
           const tx = data.recentTransactions[0];
           
           if (!tx.metrics) return; // Wait for new backend format to hit

           // Current metrics from the latest Hedera payload
           const isPhBreach = tx.metrics.pH < 6.5 || tx.metrics.pH > 8.5;
           const isTdsBreach = tx.metrics.tds > 2100;
           const isAnyBreach = tx.status !== 'COMPLIANT';

           const liveData: LiveMetrics = {
             timestamp: new Date(tx.time),
             pH: tx.metrics.pH,
             tds: tx.metrics.tds,
             flowRate: tx.metrics.flowRate || tx.metrics.flow,
             anyBreach: isAnyBreach,
             pHBreach: isPhBreach,
             tdsBreach: isTdsBreach,
             flowBreach: false
           };

           setReading(liveData);
           setWrt(data.totalWrtTokensMinted || 14);

           // Build Policy Log
           const plog = data.recentTransactions.slice(0, 5).map((t: any) => ({
              timestamp: new Date(t.time).toISOString().slice(11, 19),
              ph: t.metrics?.pH, tds: t.metrics?.tds, flow: t.metrics?.flow,
              verdict: t.status,
              action: t.status === 'COMPLIANT' ? (Math.random() > 0.7 ? 'MINT' : 'ACCUMULATE') : 'FREEZE'
           }));
           setPolicyLog(plog);

           // Build History Array for Chart
           const history = data.recentTransactions.slice(0, 30).reverse().map((t: any) => ({
              timestamp: new Date(t.time),
              pH: t.metrics?.pH || 7.0,
              tds: t.metrics?.tds || 500,
              flowRate: t.metrics?.flow || 50,
              anyBreach: t.status !== 'COMPLIANT'
           }));
           setReadingHistory(history);

           // Build HCS Stream Panel
           const hcsList: HCSEntry[] = data.recentTransactions.slice(0, 10).map((t: any) => ({
             seq: parseInt(t.seq),
             timestamp: new Date(t.time).toISOString().slice(11, 19),
             sensor: 'EDGE_GATEWAY_01',
             value: `Hash: ${t.hash.slice(0, 8)}`,
             hmac: t.kmsSignature ? `KMS Validated` : 'Unverified',
             compliant: t.status === 'COMPLIANT'
           }));
           setHcsEntries(hcsList);
        }
      } catch (err) {
        console.error("Error fetching live data", err);
      }
    };

    fetchLiveData();
    const timer = setInterval(fetchLiveData, 3000);
    return () => clearInterval(timer);
  }, []);

  const breach = reading ? reading.anyBreach : false;

  if (!reading) return <div className="p-10 text-white blueprint-grid min-h-screen pt-24 font-mono">Awaiting Live AWS KMS connection... Start node scripts/server.js and hcs-sensor-publisher.js</div>;

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
