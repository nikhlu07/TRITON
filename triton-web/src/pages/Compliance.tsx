import { useEffect, useRef, useState } from 'react';
import MetricCard from '@/components/triton/MetricCard';

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.15 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return { ref, v };
}

const guardianRules = [
  { action: 'Accumulate', trigger: 'Each compliant 10-second reading', outcome: 'Buffer reading toward 24-hour compliance window', highlight: false },
  { action: 'Mint WRT', trigger: '24 consecutive hours of all readings within CPCB thresholds', outcome: 'Auto-mint 1 WRT fungible token to factory wallet', highlight: true },
  { action: 'Freeze Badge', trigger: 'Any single reading breaches CPCB IS:2490 thresholds', outcome: 'Freeze soulbound VGB NFT immediately', highlight: false },
  { action: 'Emit Breach VC', trigger: 'Breach event detected by Guardian policy', outcome: 'Issue Verifiable Credential documenting breach details', highlight: false },
  { action: 'Unfreeze Badge', trigger: '72 consecutive compliant hours after freeze', outcome: 'Restore VGB badge to ACTIVE status', highlight: false },
];

const roadmap = [
  { phase: 'MVP', time: 'Hackathon', desc: 'Core pipeline: IoT → KMS → HCS → Guardian → HTS. Simulated sensor data. Working token minting.', current: true },
  { phase: 'Pilot', time: 'Q3 2026', desc: 'Deploy 10 physical sensors across 3 factories in Maharashtra. Real CPCB data integration.', current: false },
  { phase: 'Scale', time: 'Q1 2027', desc: '100+ factories. Multi-state regulatory integration. DEX listing for WRT tokens.', current: false },
  { phase: 'Platform', time: '2028', desc: 'Open API for third-party compliance tools. Air and soil monitoring. Carbon credit bridging.', current: false },
];

export default function Compliance() {
  return (
    <div className="pt-16 bg-white blueprint-grid min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="heading-display text-[#111111] text-3xl md:text-4xl">COMPLIANCE & TOKENOMICS</h1>
          <p className="text-[#111111]/50 mt-2 max-w-xl">How TRITON crystallizes verified water data into tradeable, regulator-ready assets.</p>
        </div>

        {/* Guardian Policy */}
        <GuardianTable />

        {/* Token Cards */}
        <TokenCards />

        {/* Business Model */}
        <BusinessModel />

        {/* Roadmap */}
        <Roadmap />
      </div>
    </div>
  );
}

function GuardianTable() {
  const { ref, v } = useReveal();
  return (
    <section ref={ref} className={`mb-16 ${v ? 'reveal-up' : 'opacity-0'}`}>
      <p className="label-micro text-[#1A56FF] mb-3">WATER STEWARDSHIP POLICY — GUARDIAN ACTIONS</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              <th className="text-left py-3 font-semibold text-[#111111]">Action</th>
              <th className="text-left py-3 font-semibold text-[#111111]">Trigger Condition</th>
              <th className="text-left py-3 font-semibold text-[#111111]">Outcome</th>
            </tr>
          </thead>
          <tbody>
            {guardianRules.map((r, i) => (
              <tr key={i} className={`border-b border-[#E5E7EB] ${r.highlight ? 'bg-[#1A56FF]/5' : ''}`}>
                <td className={`py-3 font-semibold ${r.highlight ? 'text-[#1A56FF]' : 'text-[#111111]'}`}>{r.action}</td>
                <td className="py-3 text-[#111111]/70">{r.trigger}</td>
                <td className="py-3 text-[#111111]/70">{r.outcome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TokenCards() {
  const { ref, v } = useReveal();
  return (
    <section ref={ref} className={`mb-16 grid grid-cols-1 md:grid-cols-2 gap-6 ${v ? 'reveal-up' : 'opacity-0'}`}>
      {/* WRT */}
      <div className="triton-card halftone-blue bg-[#1A56FF] text-white card-hover">
        <div className="relative z-10">
          <p className="label-micro text-white/60 mb-2">FUNGIBLE TOKEN</p>
          <h3 className="text-2xl font-extrabold mb-2">WRT — Water Restoration Token</h3>
          <p className="text-white/70 text-sm leading-relaxed mb-4">1 WRT = 1 verified clean-water day. Fungible HTS token auto-minted by Guardian policy on 24-hour compliance windows.</p>
          <div className="space-y-1 font-mono-data text-xs text-white/50">
            <p>Token ID: 0.0.4821043</p>
            <p>Supply: 14 (today)</p>
          </div>
          <span className="inline-block mt-3 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">Tradeable on Hedera DEXes</span>
        </div>
      </div>

      {/* VGB */}
      <div className="triton-card halftone-dark bg-[#1C1C1C] text-white card-hover">
        <div className="relative z-10">
          <p className="label-micro text-white/60 mb-2">SOULBOUND NFT</p>
          <h3 className="text-2xl font-extrabold mb-2">VGB — VORTEX Green Badge</h3>
          <p className="text-white/70 text-sm leading-relaxed mb-4">Non-transferable compliance certificate. Auto-freezes on any CPCB threshold breach. Unfreezes after 72 consecutive compliant hours.</p>
          <div className="space-y-1 font-mono-data text-xs text-white/50">
            <p>Token ID: 0.0.4821044</p>
            <p>Status: <span className="text-[#22C55E] font-semibold">ACTIVE</span></p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BusinessModel() {
  const { ref, v } = useReveal();
  return (
    <section ref={ref} className={`mb-16 ${v ? 'reveal-up' : 'opacity-0'}`}>
      <p className="label-micro text-[#1A56FF] mb-3">ECONOMICS</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        <MetricCard value="$0.05" label="PER VERIFICATION" />
        <MetricCard value="8,640" label="VERIFICATIONS/SENSOR/DAY" />
        <MetricCard value="~$47,000" label="ARR PER FACTORY" />
      </div>
      <p className="text-sm text-[#111111]/50 text-center">vs. ₹15–50 lakh for a Big 4 manual audit — once a year.</p>
    </section>
  );
}

function Roadmap() {
  const { ref, v } = useReveal();
  return (
    <section ref={ref} className={`${v ? 'reveal-up' : 'opacity-0'}`}>
      <p className="label-micro text-[#1A56FF] mb-3">ROADMAP</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roadmap.map((r, i) => (
          <div key={i} className={`triton-card card-hover ${r.current ? 'bg-[#1A56FF] text-white halftone-blue phase-current' : 'bg-[#1C1C1C] text-white halftone-dark'}`}>
            <div className="relative z-10">
              <p className="label-micro text-white/60 mb-1">{r.time}</p>
              <h3 className="font-extrabold text-xl mb-2">{r.phase}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{r.desc}</p>
              {r.current && <span className="inline-block mt-3 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-semibold label-micro">CURRENT</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
