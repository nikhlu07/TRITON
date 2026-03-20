import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import MetricCard from '@/components/triton/MetricCard';

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

const heroStats = [
  { value: '8,640', label: 'verifications/sensor/day' },
  { value: '~3s', label: 'finality on Hedera' },
  { value: '₹40,000/yr', label: 'vs ₹50 lakh manual audit' },
];

const sebiDemands = [
  { demand: 'Continuous emissions monitoring', reality: 'Quarterly self-reported PDF', gap: true },
  { demand: 'Tamper-proof audit trail', reality: 'Excel files on shared drives', gap: true },
  { demand: 'Third-party verification', reality: 'Annual Big 4 spot check', gap: true },
  { demand: 'Real-time breach notification', reality: '45-day delayed disclosure', gap: true },
];

const layers = [
  { icon: '🔩', name: 'Edge Layer', sub: 'IoT & Hiero DID', desc: 'Hardened sensors with decentralized identities. Every device has a cryptographic fingerprint.' },
  { icon: '🔐', name: 'Security Layer', sub: 'AWS KMS', desc: 'FIPS 140-2 Level 3 HSMs sign every reading before it leaves the factory perimeter.' },
  { icon: '📡', name: 'Consensus Layer', sub: 'Hedera HCS', desc: 'Readings achieve Byzantine fault-tolerant consensus in ~3 seconds. Immutable forever.' },
  { icon: '🧠', name: 'Policy Layer', sub: 'Hedera Guardian', desc: 'dMRV policies evaluate compliance windows and trigger token actions automatically.' },
  { icon: '💧', name: 'Asset Layer', sub: 'Hedera HTS', desc: 'Clean water days become tradeable WRT tokens. Breaches freeze soulbound VGB badges.' },
];

export default function Landing() {
  return (
    <div className="pt-16">
      {/* HERO */}
      <section className="bg-white blueprint-grid min-h-[85vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-32">
          <h1 className="heading-display text-[#111111] text-4xl sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl" style={{ lineHeight: '1.05' }}>
            Where the Pipe Meets the Proof.
          </h1>
          <p className="text-[#111111]/50 text-base md:text-lg max-w-2xl mt-6 leading-relaxed">
            TRITON turns a factory's water pipe into an auditable, on-chain asset. SEBI BRSR Core compliant. Cryptographically inevitable.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/dashboard" className="btn-triton btn-triton-primary">View Live Dashboard</Link>
            <Link to="/docs" className="btn-triton btn-triton-primary" style={{ background: 'transparent', color: '#111111', border: '1.5px solid #E5E7EB' }}>Read the Docs</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
            {heroStats.map(s => (
              <div key={s.label} className="triton-card bg-[#F9FAFB] border border-[#E5E7EB]">
                <div className="relative z-10">
                  <p className="font-mono-data text-2xl font-extrabold text-[#111111]">{s.value}</p>
                  <p className="text-xs text-[#111111]/40 mt-1">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM STATEMENT */}
      <ProblemSection />

      {/* 5-LAYER ARCHITECTURE */}
      <ArchitectureSection />

      {/* KEY METRICS */}
      <section className="bg-[#0A0A0A] py-20 md:py-28 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard value="$47,000/yr" label="ARR PER FACTORY" description="Per 3-sensor factory deployment" />
            <MetricCard value="1 WRT" label="= 1 CLEAN WATER DAY" description="Cryptographically-proven compliance token" variant="dark" />
            <MetricCard value="2" label="INDEPENDENT AUDIT TRAILS" description="Hedera HCS + AWS CloudTrail" />
          </div>
        </div>
      </section>
    </div>
  );
}

function ProblemSection() {
  const { ref, visible } = useReveal();
  return (
    <section ref={ref} className="bg-[#0A0A0A] py-20 md:py-28 relative">
      <div className="absolute inset-0 blueprint-grid opacity-10 pointer-events-none" />
      <div className={`max-w-7xl mx-auto px-4 md:px-8 relative z-10 ${visible ? 'reveal-up' : 'opacity-0'}`}>
        <p className="label-micro text-[#1A56FF] mb-4">THE ₹48,000 CRORE TRUST GAP</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="heading-display text-white text-3xl md:text-4xl">
              Indian regulators demand continuous proof. Companies deliver annual promises.
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 font-semibold text-white">What SEBI demands</th>
                  <th className="text-left py-3 font-semibold text-white">What companies actually do</th>
                </tr>
              </thead>
              <tbody>
                {sebiDemands.map((r, i) => (
                  <tr key={i} className="border-b border-white/10">
                    <td className="py-3 text-white/90">{r.demand}</td>
                    <td className="py-3 text-white/50 flex items-center gap-2">
                      <span className="text-[#EF4444]">✗</span> {r.reality}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArchitectureSection() {
  const { ref, visible } = useReveal();
  return (
    <section ref={ref} className="bg-white py-20 md:py-28">
      <div className={`max-w-7xl mx-auto px-4 md:px-8 ${visible ? 'reveal-up' : 'opacity-0'}`}>
        <p className="label-micro text-[#1A56FF] mb-4">HOW IT WORKS</p>
        <h2 className="heading-display text-[#111111] text-3xl md:text-4xl mb-12">5-Layer Architecture</h2>
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          {layers.map((l, i) => (
            <div key={i} className="flex-1 flex flex-col md:flex-row items-stretch">
              <div className="triton-card bg-[#F9FAFB] border border-[#E5E7EB] card-hover flex-1">
                <div className="relative z-10">
                  <span className="text-3xl mb-3 block">{l.icon}</span>
                  <h3 className="text-[#111111] font-bold text-lg">{l.name}</h3>
                  <p className="label-micro text-[#1A56FF] mt-1 mb-3">{l.sub}</p>
                  <p className="text-[#111111]/50 text-sm leading-relaxed">{l.desc}</p>
                </div>
              </div>
              {i < layers.length - 1 && (
                <div className="hidden md:flex items-center px-1">
                  <div className="w-6 connector-line" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
