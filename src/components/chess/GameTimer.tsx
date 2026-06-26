import { cn } from '../../lib/utils';

interface GameTimerProps {
  whiteTime: number;
  blackTime: number;
  activeColor: 'w' | 'b' | null;
  isLowTime: (color: 'w' | 'b') => boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function SplitFlapDigit({ digit, isActive, isLow }: { digit: string; isActive: boolean; isLow: boolean }) {
  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        'w-[22px] h-[32px] md:w-[26px] md:h-[38px]',
        'bg-[#2A1B15] rounded-sm',
        'font-arcade text-[14px] md:text-[16px]',
        'border border-[#4A2C1D]',
        isActive
          ? isLow
            ? 'text-[#C66A35] shadow-[0_0_8px_rgba(198,106,53,0.5)]'
            : 'text-[#C8A04A] shadow-[0_0_8px_rgba(200,160,74,0.3)]'
          : 'text-[#8B6B4A]',
        'transition-all duration-300'
      )}
    >
      {/* Split line */}
      <div className="absolute left-0 right-0 top-1/2 h-px bg-[#1A0F0A] z-10" />
      {digit}
    </div>
  );
}

function TimerDisplay({
  time,
  label,
  isActive,
  isLow,
}: {
  time: number;
  label: string;
  isActive: boolean;
  isLow: boolean;
}) {
  const formatted = formatTime(time);
  const digits = formatted.split('');

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span
        className={cn(
          'font-mono text-[9px] tracking-[0.15em] uppercase',
          isActive ? 'text-[#C8A04A]' : 'text-[#6B5B4A]'
        )}
      >
        {label}
      </span>
      <div className="flex items-center gap-0.5">
        {digits.map((digit, i) => (
          <SplitFlapDigit
            key={i}
            digit={digit}
            isActive={isActive}
            isLow={isLow}
          />
        ))}
      </div>
      {/* Active pulse indicator */}
      {isActive && (
        <div
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            isLow ? 'bg-[#C66A35]' : 'bg-[#C8A04A]',
            'animate-pulse'
          )}
        />
      )}
    </div>
  );
}

export default function GameTimer({
  whiteTime,
  blackTime,
  activeColor,
  isLowTime,
}: GameTimerProps) {
  return (
    <div className="flex items-center justify-center gap-6 md:gap-8">
      <TimerDisplay
        time={whiteTime}
        label="White"
        isActive={activeColor === 'w'}
        isLow={isLowTime('w')}
      />

      {/* VS divider */}
      <div className="flex flex-col items-center gap-0.5">
        <div className="w-px h-4 bg-[#8B6B4A]/30" />
        <span className="font-arcade text-[8px] text-[#8B6B4A]">VS</span>
        <div className="w-px h-4 bg-[#8B6B4A]/30" />
      </div>

      <TimerDisplay
        time={blackTime}
        label="Black"
        isActive={activeColor === 'b'}
        isLow={isLowTime('b')}
      />
    </div>
  );
}
