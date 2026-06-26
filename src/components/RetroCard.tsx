import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

interface RetroCardProps {
  children: React.ReactNode;
  className?: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export default function RetroCard({
  children,
  className,
  selected = false,
  onClick,
  disabled = false,
}: RetroCardProps) {
  return (
    <motion.div
      whileHover={disabled ? {} : { scale: 1.02, y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={disabled ? undefined : onClick}
      className={cn(
        'relative rounded-[12px] p-6 cursor-pointer transition-colors duration-200',
        'bg-[#E7DFC9] border-2',
        selected
          ? 'border-[#C8A04A] bg-[rgba(200,160,74,0.05)] shadow-glow shadow-lg'
          : 'border-[#8B6B4A] shadow-md hover:border-[#C8A04A] hover:shadow-lg',
        disabled && 'opacity-50 cursor-not-allowed border-dashed hover:border-[#8B6B4A] hover:shadow-md',
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
      
      {/* Selected badge */}
      {selected && (
        <div className="absolute top-2 right-2 z-20">
          <span
            className="font-mono text-[10px] font-semibold tracking-wider text-[#C8A04A] px-2 py-0.5 rounded"
            style={{ background: 'rgba(200, 160, 74, 0.12)' }}
          >
            SELECTED
          </span>
        </div>
      )}
      
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
