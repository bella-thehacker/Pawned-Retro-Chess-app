import { cn } from '../lib/utils';

interface CRTPanelProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export default function CRTPanel({ children, className, glow = false }: CRTPanelProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[12px]',
        'bg-[#E7DFC9] border p-6',
        glow
          ? 'border-[#C8A04A] shadow-glow shadow-md'
          : 'border-[#8B6B4A] shadow-md',
        className
      )}
    >
      {/* Interior scanlines */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[inherit]"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(74, 44, 29, 0.015) 3px, rgba(74, 44, 29, 0.015) 4px)',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
