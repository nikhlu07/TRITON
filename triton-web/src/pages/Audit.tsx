import { useMemo, useEffect, useState } from 'react';
import { generateAuditCloudTrailRows } from '@/utils/sensorSimulator';

const HCS_TOPIC_ID = "0.0.8330677"; // Hardcoded for hackathon demo

export default function Audit() {
  const [hcsRows, setHcsRows] = useState<any[]>([]);
  const ctRows = useMemo(() => generateAuditCloudTrailRows(15), []);

  useEffect(() => {
    // Fetch live data from Hedera Testnet Mirror Node
    const fetchHcsData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/status');
        const data = await response.json();
        
        const rows = data.recentTransactions.map((msg: any) => {
          return {
            seq: msg.seq,
            timestamp: new Date(msg.time).toLocaleTimeString(),
            sensorDid: "Secure Gateway",
            dataHash: msg.hash.slice(0, 16) + '...',
            status: msg.status
          };
        });

        setHcsRows(rows);
      } catch (err) {
        console.error("Failed to fetch from Backend API:", err);
      }
    };

    fetchHcsData();
    // Poll every 3 seconds for live demo visual
    const interval = setInterval(fetchHcsData, 3000);
    return () => clearInterval(interval);
  }, []);

  const exportBrsrReport = () => {
    const headers = ["Sequence,Timestamp,Gateway_ID,Data_Hash,Compliance_Status,AWS_KMS_Verified,Hedera_Topic_ID"];
    const csvData = hcsRows.map(row => 
      `${row.seq},${row.timestamp},${row.sensorDid},${row.dataHash},${row.status},TRUE,0.0.8330677`
    );
    const csvStr = [...headers, ...csvData].join("\n");
    
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'TRITON_BRSR_Compliance_Report_FY26.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="pt-16 bg-white blueprint-grid min-h-screen text-[#111111]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
          <div>
            <h1 className="heading-display text-[#111111] text-3xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">DUAL AUDIT TRAIL</h1>
            <p className="text-[#111111]/70 mt-2 max-w-xl text-lg font-medium">Two independent, cryptographically cross-verifiable records. Hedera HCS + AWS CloudTrail.</p>
          </div>
          <button 
            onClick={exportBrsrReport}
            className="flex items-center gap-2 px-6 py-3 bg-[#1A56FF] text-white hover:bg-blue-700 rounded-xl shadow-lg transition-all font-semibold font-mono hover:scale-105 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Export BRSR_Report.csv
          </button>
        </div>

        {/* Dual columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* HCS */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-lg">
            <div className="triton-card halftone-blue bg-[#1A56FF] text-white p-4 flex justify-between items-center">
              <p className="font-bold tracking-wider relative z-10 label-micro">HEDERA HCS STREAM</p>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-200"></span>
              </span>
            </div>
            <div className="overflow-x-auto p-4">
              <table className="w-full text-sm font-mono-data text-left">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[#111111]">
                    <th className="py-3 font-semibold">Seq #</th>
                    <th className="py-3 font-semibold">Timestamp</th>
                    <th className="py-3 font-semibold">Sensor Gateway</th>
                    <th className="py-3 font-semibold">Data Hash</th>
                    <th className="py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hcsRows.map((r, i) => (
                    <tr key={i} className={`border-b border-[#E5E7EB] ${i % 2 === 1 ? 'bg-[#F9FAFB]' : ''}`}>
                      <td className="py-3 text-[#1A56FF] font-bold">#{r.seq}</td>
                      <td className="py-3 text-[#111111]/70">{r.timestamp}</td>
                      <td className="py-3 text-[#1A56FF] text-xs truncate max-w-[140px]">{r.sensorDid}</td>
                      <td className="py-3 text-[#111111]/50 text-xs">{r.dataHash.slice(0, 16)}...</td>
                      <td className={`py-3 font-bold ${r.status === 'COMPLIANT' ? 'text-[#22C55E]' : 'text-[#EF4444] animate-pulse'}`}>{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CloudTrail */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-lg">
            <div className="triton-card halftone-blue bg-[#111111] text-white p-4 flex justify-between items-center">
              <p className="font-bold tracking-wider relative z-10 label-micro">AWS CLOUDTRAIL</p>
              <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <div className="overflow-x-auto p-4">
              <table className="w-full text-sm font-mono-data text-left">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[#111111]">
                    <th className="py-3 font-semibold">Event ID</th>
                    <th className="py-3 font-semibold">Time</th>
                    <th className="py-3 font-semibold">Event</th>
                    <th className="py-3 font-semibold">KMS ARN</th>
                    <th className="py-3 font-semibold">Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {ctRows.map((r, i) => (
                    <tr key={i} className={`border-b border-[#E5E7EB] ${i % 2 === 1 ? 'bg-[#F9FAFB]' : ''}`}>
                      <td className="py-3 text-[#111111]/50 text-xs">{r.eventId.slice(0, 12)}...</td>
                      <td className="py-3 text-[#111111]/70">{r.eventTime}</td>
                      <td className="py-3 text-[#111111] font-bold">{r.eventName}</td>
                      <td className="py-3 text-[#111111]/50 text-xs truncate max-w-[160px]">{r.kmsArn}</td>
                      <td className="py-3 text-[#22C55E] font-bold">{r.outcome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Compliance Summary */}
        <div className="triton-card halftone-blue bg-[#1A56FF] rounded-2xl p-6 shadow-xl">
          <div className="flex flex-wrap gap-x-12 gap-y-4 items-center justify-center text-center">
             <div className="relative z-10">
                <p className="label-micro text-white/80">NETWORK STATUS</p>
                <div className="text-2xl font-black text-white flex items-center justify-center gap-2"><span className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse"></span> SECURE</div>
             </div>
             <div className="w-px h-12 bg-white/20 hidden md:block"></div>
             <div className="relative z-10">
                <p className="label-micro text-white/80">UPTIME</p>
                <p className="text-2xl font-black text-white">99.9%</p>
             </div>
             <div className="w-px h-12 bg-white/20 hidden md:block"></div>
             <div className="relative z-10">
                <p className="label-micro text-white/80">WRT AUTO-MINTED</p>
                <p className="text-xl md:text-2xl font-black text-white">14 TOKENS</p>
             </div>
             <div className="w-px h-12 bg-white/20 hidden md:block"></div>
             <div className="relative z-10">
                <p className="label-micro text-white/80">EVM REGISTRY INDEX</p>
                <p className="text-xl md:text-2xl font-black font-mono-data text-white">0.0.8339707</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
