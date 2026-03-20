interface StatusBadgeProps {
  status: 'compliant' | 'breach' | 'warning' | 'minting';
  label: string;
}

const colorMap = {
  compliant: { bg: 'bg-compliant', text: 'text-white' },
  breach: { bg: 'bg-breach', text: 'text-white' },
  warning: { bg: 'bg-warning', text: 'text-white' },
  minting: { bg: 'bg-minting', text: 'text-white' },
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const c = colorMap[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${c.bg} ${c.text}`}>
      <span className={`w-2 h-2 rounded-full bg-white/80 ${status === 'compliant' ? 'pulse-dot' : ''}`} />
      {label}
    </span>
  );
}
