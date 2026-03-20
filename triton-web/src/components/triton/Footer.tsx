import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white text-[#111111]/50 py-16 border-t border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <polygon points="16,2 29,9 29,23 16,30 3,23 3,9" fill="none" stroke="#1A56FF" strokeWidth="2" />
                <circle cx="16" cy="16" r="3" fill="#1A56FF" />
              </svg>
              <span className="text-[#111111] font-extrabold text-lg tracking-tight">TRITON</span>
            </div>
            <p className="text-sm max-w-sm">Built on Hedera. Secured by AWS. Demanded by SEBI.</p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <Link to="/" className="hover:text-[#111111] transition-colors">Home</Link>
            <Link to="/dashboard" className="hover:text-[#111111] transition-colors">Dashboard</Link>
            <Link to="/audit" className="hover:text-[#111111] transition-colors">Audit Trail</Link>
            <Link to="/compliance" className="hover:text-[#111111] transition-colors">Compliance</Link>
            <Link to="/docs" className="hover:text-[#111111] transition-colors">Docs</Link>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-[#E5E7EB] text-xs text-[#111111]/30">
          © {new Date().getFullYear()} TRITON — Trustless Real-time Industrial Track-and-trace On-chain Network
        </div>
      </div>
    </footer>
  );
}
