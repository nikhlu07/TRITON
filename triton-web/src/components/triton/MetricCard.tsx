import { useEffect, useRef, useState } from 'react';

interface MetricCardProps {
  value: string;
  label: string;
  description?: string;
  variant?: 'blue' | 'dark' | 'white';
}

export default function MetricCard({ value, label, description, variant = 'blue' }: MetricCardProps) {
  const bgClass = variant === 'blue'
    ? 'bg-[#1A56FF] text-white halftone-blue'
    : variant === 'dark'
    ? 'bg-[#1C1C1C] text-white halftone-dark'
    : 'bg-white text-[#111111] blueprint-grid border border-[#E5E7EB]';

  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`triton-card card-hover ${bgClass} ${visible ? 'reveal-up' : 'opacity-0'}`}
    >
      <div className="relative z-10">
        <p className="font-mono-data text-3xl md:text-4xl font-extrabold mb-2">{value}</p>
        <p className="label-micro mb-1 opacity-80">{label}</p>
        {description && <p className="text-sm opacity-70">{description}</p>}
      </div>
    </div>
  );
}
