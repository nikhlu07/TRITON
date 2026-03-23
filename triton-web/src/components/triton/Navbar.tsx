import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/audit', label: 'Audit Trail' },
  { to: '/compliance', label: 'Compliance' },
  { to: '/docs', label: 'Docs' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const { accountId, isConnecting, connect, disconnect } = useWallet();

  const handleWalletConnect = () => {
    if (accountId) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="transition-transform duration-200 group-hover:scale-105">
            <polygon points="16,2 29,9 29,23 16,30 3,23 3,9" fill="none" stroke="#1A56FF" strokeWidth="2" />
            <polygon points="16,7 24,11.5 24,20.5 16,25 8,20.5 8,11.5" fill="#1A56FF" opacity="0.2" />
            <circle cx="16" cy="16" r="3" fill="#1A56FF" />
          </svg>
          <span className="text-[#111111] font-extrabold text-lg tracking-tight">TRITON</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-1">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === l.to
                    ? 'text-[#1A56FF] border-b-2 border-[#1A56FF]'
                    : 'text-[#111111]/60 hover:text-[#111111]'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
          
          {/* Wallet Connect Button */}
          <button 
            onClick={handleWalletConnect}
            disabled={isConnecting}
            className={`px-4 py-2 rounded-lg font-mono text-sm font-semibold transition-all flex items-center gap-2 ${
              accountId 
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-[#1A56FF] text-white hover:bg-blue-700 shadow-md'
            }`}
          >
            {!accountId && !isConnecting && (
               <>
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                 Connect HashPack
               </>
            )}
            {isConnecting && (
               <>
                 <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                 Connecting...
               </>
            )}
            {accountId && (
               <>
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                 {accountId.slice(0, 8)}...
               </>
            )}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-[#111111] p-2" aria-label="Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-white border-t border-[#E5E7EB] px-4 pb-4">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`block py-3 text-sm font-medium ${pathname === l.to ? 'text-[#1A56FF]' : 'text-[#111111]/60'}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
