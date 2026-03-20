import { useState, useEffect, useRef } from 'react';

const tocItems = [
  'Architecture Overview',
  'Edge Layer (IoT & Hiero DID)',
  'Security Layer (AWS KMS)',
  'Consensus Layer (Hedera HCS)',
  'Policy Layer (Hedera Guardian)',
  'Asset Layer (Hedera HTS)',
  'Quick Start',
  'Repository Structure',
];

const asciiArch = `┌─────────────────────────────────────────────────────────┐
│                    TRITON ARCHITECTURE                   │
│                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐   │
│  │ IoT Edge │───▶│ AWS KMS  │───▶│   Hedera HCS     │   │
│  │ Sensors  │    │ Signing  │    │   Consensus      │   │
│  │ Hiero DID│    │ FIPS 140 │    │   ~3s Finality   │   │
│  └──────────┘    └──────────┘    └────────┬─────────┘   │
│                                           │             │
│                                  ┌────────▼─────────┐   │
│                                  │ Hedera Guardian   │   │
│                                  │ dMRV Policy       │   │
│                                  │ Engine            │   │
│                                  └────────┬─────────┘   │
│                                           │             │
│                                  ┌────────▼─────────┐   │
│                                  │ Hedera HTS       │   │
│                                  │ WRT Tokens (FT)  │   │
│                                  │ VGB Badge (NFT)  │   │
│                                  └──────────────────┘   │
└─────────────────────────────────────────────────────────┘`;

const repoTree = `triton/
├── edge/
│   ├── sensor-simulator.ts    # IoT sensor data generation
│   ├── hiero-did.ts           # DID creation & management
│   └── kms-signer.ts          # AWS KMS integration
├── consensus/
│   ├── hcs-publisher.ts       # HCS topic publishing
│   └── mirror-listener.ts    # Mirror node subscription
├── guardian/
│   ├── policy-schema.json     # Water stewardship policy
│   └── policy-engine.ts       # dMRV evaluation logic
├── tokens/
│   ├── wrt-manager.ts         # WRT fungible token ops
│   └── vgb-manager.ts         # VGB soulbound NFT ops
├── api/
│   └── server.ts              # REST API endpoints
├── web/
│   └── src/                   # This React application
└── docs/
    └── README.md              # Full documentation`;

const layers = [
  {
    icon: '🔩', title: 'Edge Layer — IoT & Hiero DID',
    desc: 'Industrial-grade pH, TDS, and Flow Rate sensors are deployed at factory outfall points. Each sensor is provisioned with a Hiero DID (Decentralized Identifier) following the did:hedera:testnet method. This creates a cryptographic identity for every physical device, ensuring that each data point can be attributed to a specific, authenticated sensor.',
    specs: [
      ['Sensors', 'pH (IS:2490), TDS, Flow Rate'],
      ['DID Method', 'did:hedera:testnet:z6Mk...'],
      ['Sampling Rate', 'Every 10 seconds'],
      ['Protocol', 'MQTT → Edge Lambda'],
    ],
  },
  {
    icon: '🔐', title: 'Security Layer — AWS KMS',
    desc: 'Before any reading leaves the factory perimeter, it is signed using AWS KMS with FIPS 140-2 Level 3 HSMs. This creates a non-repudiable cryptographic proof that the data existed at a specific time and was produced by an authorized device. AWS CloudTrail independently logs every signing operation.',
    specs: [
      ['Key Type', 'ECC_NIST_P256'],
      ['HSM Level', 'FIPS 140-2 Level 3'],
      ['Audit Trail', 'AWS CloudTrail (independent)'],
      ['Region', 'ap-south-1 (Mumbai)'],
    ],
  },
  {
    icon: '📡', title: 'Consensus Layer — Hedera HCS',
    desc: 'Signed sensor readings are published to a Hedera Consensus Service topic. HCS provides Byzantine fault-tolerant ordering with ~3-second finality. Once a message achieves consensus, it is immutable and publicly verifiable through the Hedera Mirror Node.',
    specs: [
      ['Service', 'Hedera Consensus Service (HCS)'],
      ['Finality', '~3 seconds'],
      ['Throughput', '10,000+ TPS'],
      ['Mirror Node', 'mainnet-public.mirrornode.hedera.com'],
    ],
  },
  {
    icon: '🧠', title: 'Policy Layer — Hedera Guardian',
    desc: 'The Guardian dMRV (digital Measurement, Reporting, and Verification) policy engine evaluates incoming sensor readings against CPCB IS:2490 thresholds. It maintains a rolling 24-hour compliance window and triggers token actions: accumulating compliant readings, minting WRT tokens, or freezing VGB badges on breach.',
    specs: [
      ['Policy', 'Water Stewardship v1.0'],
      ['Compliance Window', '24 hours rolling'],
      ['Thresholds', 'CPCB IS:2490-Part-I'],
      ['Actions', 'Accumulate / Mint / Freeze / Unfreeze'],
    ],
  },
  {
    icon: '💧', title: 'Asset Layer — Hedera HTS',
    desc: 'Two token types represent compliance outcomes on Hedera Token Service. WRT (Water Restoration Token) is a fungible token minted for each 24-hour compliant window — tradeable and representing verified environmental impact. VGB (VORTEX Green Badge) is a soulbound NFT that serves as a living compliance certificate, automatically frozen on breach.',
    specs: [
      ['WRT', 'Fungible HTS Token (Token ID: 0.0.4821043)'],
      ['VGB', 'Non-Fungible Soulbound (Token ID: 0.0.4821044)'],
      ['Mint Trigger', '24h compliant window'],
      ['Freeze Trigger', 'Any single CPCB breach'],
    ],
  },
];

const quickStartSteps = [
  { title: 'Clone the repository', cmd: 'git clone https://github.com/triton-network/triton.git\ncd triton' },
  { title: 'Install dependencies', cmd: 'npm install' },
  { title: 'Configure environment', cmd: 'cp .env.example .env\n# Edit .env with your Hedera testnet credentials and AWS KMS key ARN' },
  { title: 'Start the sensor simulator', cmd: 'npm run simulator' },
  { title: 'Launch the Guardian policy engine', cmd: 'npm run guardian' },
  { title: 'Open the web dashboard', cmd: 'npm run dev\n# Open http://localhost:5173' },
];

export default function Docs() {
  const [active, setActive] = useState('Architecture Overview');
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollTo = (id: string) => {
    setActive(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.getAttribute('data-section') || '');
        }
      },
      { rootMargin: '-80px 0px -60% 0px' }
    );
    Object.values(sectionRefs.current).forEach(el => { if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="pt-16 bg-white blueprint-grid min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24 space-y-1">
            <p className="label-micro text-[#1A56FF] mb-3">DOCUMENTATION</p>
            {tocItems.map(item => (
              <button
                key={item}
                onClick={() => scrollTo(item)}
                className={`block w-full text-left text-sm py-1.5 px-3 rounded-lg transition-colors ${
                  active === item ? 'bg-[#1A56FF]/10 text-[#1A56FF] font-semibold' : 'text-[#111111]/50 hover:text-[#111111]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {/* Architecture Overview */}
          <div ref={el => { sectionRefs.current['Architecture Overview'] = el; }} data-section="Architecture Overview" className="mb-16">
            <h1 className="heading-display text-[#111111] text-3xl md:text-4xl mb-4">Architecture Overview</h1>
            <p className="text-[#111111]/60 mb-6 leading-relaxed">TRITON implements a 5-layer cryptographic pipeline that transforms raw industrial water sensor readings into auditable, on-chain compliance assets. Each layer adds a trust guarantee that cannot be removed or forged.</p>
            <pre className="bg-[#111111] text-[#1A56FF] p-6 rounded-2xl overflow-x-auto text-xs leading-relaxed font-mono-data">{asciiArch}</pre>
          </div>

          {/* Layers */}
          {layers.map((l, i) => (
            <div key={i} ref={el => { sectionRefs.current[tocItems[i + 1]] = el; }} data-section={tocItems[i + 1]} className="mb-16">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{l.icon}</span>
                <h2 className="heading-display text-[#111111] text-2xl">{l.title}</h2>
              </div>
              <p className="text-[#111111]/60 leading-relaxed mb-6">{l.desc}</p>
              <table className="w-full text-sm">
                <tbody>
                  {l.specs.map(([k, v], j) => (
                    <tr key={j} className="border-b border-[#E5E7EB]">
                      <td className="py-2 font-semibold text-[#111111] w-40">{k}</td>
                      <td className="py-2 text-[#111111]/60 font-mono-data">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {/* Quick Start */}
          <div ref={el => { sectionRefs.current['Quick Start'] = el; }} data-section="Quick Start" className="mb-16">
            <h2 className="heading-display text-[#111111] text-2xl mb-6">Quick Start</h2>
            <div className="space-y-4">
              {quickStartSteps.map((s, i) => (
                <div key={i}>
                  <p className="text-sm font-semibold text-[#111111] mb-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#1A56FF] text-white text-xs font-bold mr-2">{i + 1}</span>
                    {s.title}
                  </p>
                  <pre className="bg-[#111111] text-[#1A56FF] p-4 rounded-xl overflow-x-auto text-xs font-mono-data">{s.cmd}</pre>
                </div>
              ))}
            </div>
          </div>

          {/* Repo Structure */}
          <div ref={el => { sectionRefs.current['Repository Structure'] = el; }} data-section="Repository Structure" className="mb-16">
            <h2 className="heading-display text-[#111111] text-2xl mb-6">Repository Structure</h2>
            <pre className="bg-[#111111] text-[#1A56FF] p-6 rounded-2xl overflow-x-auto text-xs leading-relaxed font-mono-data">{repoTree}</pre>
          </div>
        </main>
      </div>
    </div>
  );
}
