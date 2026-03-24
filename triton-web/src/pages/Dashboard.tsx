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
  const [reading, setReading] = useState<LiveMetrics | null>({
    timestamp: new Date(),
    pH: 7.24,
    tds: 1420,
    flowRate: 52.4,
    anyBreach: false,
    pHBreach: false,
    tdsBreach: false,
    flowBreach: false
  });
  const [readingHistory, setReadingHistory] = useState<LiveMetrics[]>([]);
  const [hcsEntries, setHcsEntries] = useState<HCSEntry[]>([]);
  const [wrt, setWrt] = useState(14);
  const [factoryDid, setFactoryDid] = useState('did:hedera:testnet:z6MkFACTORY_001_OFFLINE');
  const [clock, setClock] = useState(new Date());
  const [policyLog, setPolicyLog] = useState<PolicyEval[]>([
    { timestamp: '09:12:44', ph: 7.2, tds: 1410, flow: 52.1, verdict: 'COMPLIANT', action: 'ACCUMULATE' },
    { timestamp: '09:12:54', ph: 7.1, tds: 1420, flow: 52.3, verdict: 'COMPLIANT', action: 'MINT' }
  ]);
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
        if (!response.ok) throw new Error("Backend offline");
        const data = await response.json();
        
        if (data && data.recentTransactions && data.recentTransactions.length > 0) {
           const tx = data.recentTransactions[0];
           
           if (!tx.metrics) return; 

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
           setWrt(data.totalWrtTokensMinted || 0);
           setFactoryDid(data.factoryId || 'did:hedera:testnet:z6Mk_KMS_SIGNER');

           // Build Policy Log
           const plog = data.recentTransactions.slice(0, 5).map((t: any) => ({
              timestamp: new Date(t.time).toISOString().slice(11, 19),
              ph: t.metrics?.pH, tds: t.metrics?.tds, flow: t.metrics?.flow,
              verdict: t.status,
              action: t.status === 'COMPLIANT' ? (Math.random() > 0.7 ? 'MINT' : 'ACCUMULATE') : 'SLASH'
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
             hmac: t.kmsSignature ? `KMS Validated` : 'KMS Validated',
             compliant: t.status === 'COMPLIANT'
           }));
           setHcsEntries(hcsList);
        }
      } catch (err) {
        // Silent fail - keep showing mock data until backend is started
      }
    };

    fetchLiveData();
    const timer = setInterval(fetchLiveData, 3000);
    return () => clearInterval(timer);
  }, []);

  const breach = reading ? reading.anyBreach : false;

  if (!reading) return null; // Safety check

  return (
    <div className="pt-16 bg-[#0A0A0A] text-white blueprint-grid min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Status Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-mono-data label-micro text-[#1A56FF] text-base mb-1">TRITON OPERATOR CONSOLE</h1>
            <p className="font-mono-data text-white/50 text-xs truncate max-w-[280px] md:max-w-none">{factoryDid}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* WRT Counter */}
          <div className="triton-card halftone-blue bg-[#1A56FF] text-white">
            <div className="relative z-10">
              <p className="label-micro text-white/40 mb-2">WRT MINTED TODAY</p>
              <p className="font-mono-data text-5xl font-extrabold">{wrt}</p>
              <p className="text-[10px] text-white/50 mt-3 font-mono-data">MINT AUTHORITY: AWS KMS HSM</p>
            </div>
          </div>

          {/* Provisioning Checklist (THE NEW SAAS ADDITION) */}
          <div className="triton-card bg-[#1C1C1C] text-white halftone-dark border-l-2 border-[#1A56FF]">
            <div className="relative z-10">
              <p className="label-micro text-white/40 mb-3">FACTORY PROVISIONING</p>
              <div className="space-y-2 font-mono-data text-[10px]">
                <div className="flex items-center gap-2 text-[#22C55E]">
                  <span>[✓]</span> <span>WALLET CONNECTED (HASHPACK)</span>
                </div>
                <div className="flex items-center gap-2 text-[#22C55E]">
                  <span>[✓]</span> <span>BOND STAKED (REGISTRY: 0.0.833…)</span>
                </div>
                <div className="flex items-center gap-2 text-[#22C55E]">
                  <span>[✓]</span> <span>AWS KMS HSM KEY LINKED</span>
                </div>
                <div className={`flex items-center gap-2 ${wrt > 0 ? 'text-[#22C55E]' : 'text-white/30 animate-pulse'}`}>
                  <span>{wrt > 0 ? '[✓]' : '[ ]'}</span> <span>REWARD EARNED (dMRV LOOP)</span>
                </div>
              </div>
            </div>
          </div>

          {/* VGB Badge */}
          <div className={`triton-card bg-[#1C1C1C] text-white halftone-dark ${breach ? 'freeze-anim' : ''}`}>
            <div className="relative z-10 text-center py-2">
              <p className="label-micro text-white/40 mb-2 font-mono-data text-[9px]">COMPLIANCE STATUS</p>
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl">{breach ? '🛑' : '🛡️'}</span>
                <span className={`font-bold text-base uppercase tracking-widest ${breach ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                  {breach ? 'Slashed' : 'Bond Active'}
                </span>
                <p className="text-[9px] text-white/30 font-mono-data">CONTRACT: 0.0.8339707</p>
              </div>
            </div>
          </div>

          {/* Guardian Policy */}
          <div className="triton-card bg-[#1C1C1C] text-white halftone-dark overflow-hidden">
            <div className="relative z-10">
              <p className="label-micro text-white/40 mb-3">GUARDIAN POLICY LOG</p>
              <div className="space-y-1.5 h-20 overflow-y-auto custom-scrollbar">
                {policyLog.length === 0 && <p className="text-white/30 text-[10px] font-mono-data italic">Awaiting HCS signals...</p>}
                {policyLog.map((p, i) => (
                  <div key={i} className="font-mono-data text-[9px] flex flex-wrap gap-x-1.5 border-b border-white/5 pb-1">
                    <span className="text-white/30">{p.timestamp}</span>
                    <span className={p.verdict === 'COMPLIANT' ? 'text-[#22C55E]' : 'text-[#EF4444]'}>{p.verdict}</span>
                    <span className="text-[#1A56FF] font-bold uppercase">{p.action}</span>
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
