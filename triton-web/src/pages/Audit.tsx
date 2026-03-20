import { useMemo } from 'react';
import { generateAuditHcsRows, generateAuditCloudTrailRows } from '@/utils/sensorSimulator';

export default function Audit() {
  const hcsRows = useMemo(() => generateAuditHcsRows(15), []);
  const ctRows = useMemo(() => generateAuditCloudTrailRows(15), []);

  return (
    <div className="pt-16 bg-white blueprint-grid min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
          <div>
            <h1 className="heading-display text-[#111111] text-3xl md:text-4xl">DUAL AUDIT TRAIL</h1>
            <p className="text-[#111111]/50 mt-2 max-w-xl">Two independent, cryptographically cross-verifiable records. Hedera HCS + AWS CloudTrail.</p>
          </div>
          <button className="btn-triton btn-triton-primary">Export BRSR Report</button>
        </div>

        {/* Dual columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* HCS */}
          <div>
            <div className="triton-card halftone-blue bg-[#1A56FF] text-white mb-4">
              <p className="relative z-10 label-micro">HEDERA HCS</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono-data">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    <th className="text-left py-2 font-semibold text-[#111111]">Seq #</th>
                    <th className="text-left py-2 font-semibold text-[#111111]">Timestamp</th>
                    <th className="text-left py-2 font-semibold text-[#111111]">Sensor DID</th>
                    <th className="text-left py-2 font-semibold text-[#111111]">Data Hash</th>
                    <th className="text-left py-2 font-semibold text-[#111111]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hcsRows.map((r, i) => (
                    <tr key={i} className={`border-b border-[#E5E7EB] ${i % 2 === 1 ? 'bg-[#F9FAFB]' : ''}`}>
                      <td className="py-2 text-[#1A56FF]">{r.seq}</td>
                      <td className="py-2 text-[#111111]/60">{r.timestamp}</td>
                      <td className="py-2 text-[#111111]/60 truncate max-w-[140px]">{r.sensorDid}</td>
                      <td className="py-2 text-[#111111]/40">{r.dataHash.slice(0, 16)}...</td>
                      <td className={`py-2 font-semibold ${r.status === 'COMPLIANT' ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CloudTrail */}
          <div>
            <div className="triton-card halftone-blue bg-[#1A56FF] text-white mb-4">
              <p className="relative z-10 label-micro">AWS CLOUDTRAIL</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono-data">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    <th className="text-left py-2 font-semibold text-[#111111]">Event ID</th>
                    <th className="text-left py-2 font-semibold text-[#111111]">Time</th>
                    <th className="text-left py-2 font-semibold text-[#111111]">Event</th>
                    <th className="text-left py-2 font-semibold text-[#111111]">KMS Key ARN</th>
                    <th className="text-left py-2 font-semibold text-[#111111]">Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {ctRows.map((r, i) => (
                    <tr key={i} className={`border-b border-[#E5E7EB] ${i % 2 === 1 ? 'bg-[#F9FAFB]' : ''}`}>
                      <td className="py-2 text-[#111111]/40">{r.eventId.slice(0, 12)}...</td>
                      <td className="py-2 text-[#111111]/60">{r.eventTime}</td>
                      <td className="py-2 text-[#1A56FF]">{r.eventName}</td>
                      <td className="py-2 text-[#111111]/40 truncate max-w-[160px]">{r.kmsArn}</td>
                      <td className="py-2 text-[#22C55E] font-semibold">{r.outcome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Compliance Summary */}
        <div className="triton-card halftone-blue bg-[#1A56FF] text-white">
          <div className="relative z-10 flex flex-wrap gap-x-8 gap-y-2 items-center">
            <span className="font-bold">24-Hour Compliance Window</span>
            <span className="text-white/70">99.1% uptime</span>
            <span className="text-white/70">2 Breaches Detected</span>
            <span className="text-white/70">14 WRT Tokens Auto-Minted</span>
            <span className="text-white/70">Audit Period: Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}
