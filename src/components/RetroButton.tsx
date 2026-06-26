import { cn } from '../lib/utils';
import type { LucideIcon } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface RetroButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: LucideIcon;
  className?: string;
  type?: 'button' | 'submit';
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-walnut text-[#E7DFC9] border-walnut hover:shadow-glow',
  secondary: 'bg-transparent text-[#2A1B15] border-[#8B6B4A] hover:border-[#C8A04A]',
  accent: 'bg-[#6E7B4F] text-[#E7DFC9] border-[#6E7B4F] hover:shadow-[0_0_20px_rgba(110,123,79,0.4)]',
  danger: 'bg-[#8C3A3A] text-[#E7DFC9] border-[#8C3A3A] hover:shadow-[0_0_20px_rgba(140,58,58,0.4)]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-4 text-base min-h-[56px]',
};

export default function RetroButton({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  icon: Icon,
  className,
  type = 'button',
}: RetroButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-mono font-semibold uppercase tracking-widest',
        'border-2 rounded-[8px] cursor-pointer transition-all duration-150 ease-out',
        'relative overflow-hidden',
        'before:absolute before:inset-0 before:rounded-[inherit]',
        'before:border-t before:border-b',
        'before:border-t-white/15 before:border-b-black/20',
        'hover:-translate-y-0.5 hover:shadow-md',
        'active:translate-y-px active:shadow-inset',
        'focus:outline-none focus:ring-2 focus:ring-[#C8A04A] focus:ring-offset-2 focus:ring-offset-[#E7DFC9]',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:active:translate-y-0',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {Icon && <Icon size={size === 'lg' ? 20 : size === 'md' ? 16 : 14} strokeWidth={2} />}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
