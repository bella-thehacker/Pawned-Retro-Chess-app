import { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface RetroSelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function RetroSelect({ value, options, onChange, disabled = false }: RetroSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={cn(
          'flex items-center justify-between gap-3',
          'font-mono text-sm font-semibold uppercase tracking-wider',
          'bg-transparent border-2 border-[#8B6B4A] rounded-[8px]',
          'px-3 py-2 min-w-[140px]',
          'hover:border-[#C8A04A] transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-[#C8A04A] focus:ring-offset-2 focus:ring-offset-[#E7DFC9]',
          disabled && 'opacity-40 cursor-not-allowed'
        )}
      >
        <span>{selectedLabel}</span>
        <ChevronDown
          size={14}
          className={cn('transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          className={cn(
            'absolute top-full left-0 mt-1 z-50',
            'bg-[#E7DFC9] border border-[#8B6B4A] rounded-[12px]',
            'shadow-lg overflow-hidden min-w-full'
          )}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                'block w-full text-left px-4 py-2',
                'font-mono text-sm',
                'hover:bg-[rgba(200,160,74,0.08)] transition-colors duration-100',
                option.value === value && 'text-[#C8A04A] font-semibold'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
