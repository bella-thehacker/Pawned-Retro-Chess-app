import { cn } from '../lib/utils';

interface RetroToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function RetroToggle({ checked, onChange, disabled = false }: RetroToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={cn(
        'relative w-[44px] h-[24px] rounded-full transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-[#C8A04A] focus:ring-offset-2 focus:ring-offset-[#E7DFC9]',
        checked ? 'bg-[#6E7B4F]' : 'bg-[#8B6B4A]',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      <span
        className={cn(
          'absolute top-[2px] left-[2px] w-[20px] h-[20px] rounded-full',
          'bg-[#E7DFC9] shadow-sm transition-transform duration-200'
        )}
        style={{
          transform: checked ? 'translateX(20px)' : 'translateX(0)',
        }}
      />
    </button>
  );
}
