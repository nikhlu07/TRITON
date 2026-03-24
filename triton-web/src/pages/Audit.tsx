import { useMemo, useEffect, useState } from 'react';
import { generateAuditCloudTrailRows } from '@/utils/sensorSimulator';
import { verifySensorIntegrity, calculateTrustScore } from '@/utils/verifier';

export default function Audit() {
  const [hcsRows, setHcsRows] = useState<any[]>([]);
  const [tokenCount, setTokenCount] = useState(14);
  const [trustScore, setTrustScore] = useState(100);
  const ctRows = useMemo(() => generateAuditCloudTrailRows(15), []);

  useEffect(() => {
    const fetchHcsData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/status');
        const data = await response.json();
        
        setTokenCount(data.totalWrtTokensMinted);

        const rows = await Promise.all(data.recentTransactions.map(async (msg: any) => {
          // LIVE CRYPTOGRAPHIC VERIFICATION
          const isValid = await verifySensorIntegrity(
            msg.metrics, 
            { hash: msg.hash, kmsSignatureHex: msg.kmsSignature || '0x...' },
            'KMS_PUBLIC_KEY' 
          );

          return {
            seq: msg.seq,
            timestamp: new Date(msg.time).toLocaleTimeString(),
            sensorDid: "Edge_Gateway_01",
            dataHash: msg.hash.slice(0, 16) + '...',
            status: msg.status,
            verified: isValid
          };
        }));

        setHcsRows(rows);
        setTrustScore(calculateTrustScore(rows.map(r => ({ hmac: r.verified ? 'KMS Validated' : 'Unverified' }))));
      } catch (err) {
        console.error("Failed to fetch from Backend API:", err);
      }
    };

    fetchHcsData();
    const interval = setInterval(fetchHcsData, 3000);
    return () => clearInterval(interval);
  }, []);

  const exportBrsrReport = () => {
    const headers = ["Sequence,Timestamp,Gateway_ID,Data_Hash,Compliance_Status,AWS_KMS_Verified,Trust_Score"];
    const csvData = hcsRows.map(row => 
      `${row.seq},${row.timestamp},${row.sensorDid},${row.dataHash},${row.status},${row.verified.toString().toUpperCase()},${trustScore}%`
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
            <p className="text-[#111111]/70 mt-2 max-w-xl text-lg font-medium">AWS KMS Signatures verified in real-time by the Auditor browser.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="label-micro text-[#111111]/40">SESSION TRUST SCORE</p>
              <p className={`text-2xl font-black ${trustScore > 90 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>{trustScore}%</p>
            </div>
            <button 
              onClick={exportBrsrReport}
              className="flex items-center gap-2 px-6 py-3 bg-[#1A56FF] text-white hover:bg-blue-700 rounded-xl shadow-lg transition-all font-semibold font-mono hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Export BRSR_Report.csv
            </button>
          </div>
        </div>

        {/* Dual columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* HCS Feed - Larger */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-lg">
            <div className="triton-card halftone-blue bg-[#1A56FF] text-white p-4 flex justify-between items-center">
              <p className="font-bold tracking-wider relative z-10 label-micro">HEDERA HCS STREAM + CRYPTO-VERIFICATION</p>
              <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap">TOPIC: 0.0.8330677</span>
            </div>
            <div className="overflow-x-auto p-4">
              <table className="w-full text-sm font-mono-data text-left">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[#111111]">
                    <th className="py-3 font-semibold">Seq #</th>
                    <th className="py-3 font-semibold">Hash Proof</th>
                    <th className="py-3 font-semibold">Status</th>
                    <th className="py-3 font-semibold">AWS KMS</th>
                  </tr>
                </thead>
                <tbody>
                  {hcsRows.map((r, i) => (
                    <tr key={i} className={`border-b border-[#E5E7EB] ${i % 2 === 1 ? 'bg-[#F9FAFB]' : ''}`}>
                      <td className="py-3 text-[#1A56FF] font-bold">#{r.seq}</td>
                      <td className="py-3 text-[#111111]/50 text-xs font-mono">{r.dataHash}</td>
                      <td className={`py-3 font-bold ${r.status === 'COMPLIANT' ? 'text-[#22C55E]' : 'text-[#EF4444] animate-pulse'}`}>{r.status}</td>
                      <td className="py-3">
                        {r.verified ? (
                          <span className="text-[#22C55E] flex items-center gap-1 font-bold text-[11px]">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                            KMS_VALID
                          </span>
                        ) : (
                          <span className="text-[#EF4444] font-bold text-[11px]">UNVERIFIED</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CloudTrail - Smaller Sidebar */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-lg">
            <div className="triton-card halftone-blue bg-[#111111] text-white p-4 flex justify-between items-center">
              <p className="font-bold tracking-wider relative z-10 label-micro">IAM ACCESS LOGS</p>
            </div>
            <div className="p-4">
               {ctRows.slice(0, 8).map((r, i) => (
                 <div key={i} className="mb-4 pb-4 border-b border-[#F3F4F6] last:border-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs">{r.eventName}</span>
                      <span className="text-[10px] text-[#22C55E]">GRANTED</span>
                    </div>
                    <p className="text-[10px] text-[#111111]/40 font-mono truncate">{r.kmsArn}</p>
                 </div>
               ))}
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
                <p className="text-xl md:text-2xl font-black text-white">{tokenCount} TOKENS</p>
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

