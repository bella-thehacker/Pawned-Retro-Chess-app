import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/settingsStore';

interface MoveHistoryProps {
  history: { moveNumber: number; white: string; black?: string }[];
}

export default function MoveHistory({ history }: MoveHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  // Auto-scroll to bottom on new moves
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history.length]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-mono text-[11px] text-[#C8A04A] tracking-[0.2em] uppercase">
          MOVE HISTORY
        </h3>
        <span className="font-mono text-[10px] text-[#6B5B4A]">
          {history.length > 0 ? `${history.length} moves` : '—'}
        </span>
      </div>

      {/* Score sheet */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-1 font-mono text-[13px] leading-[1.8]
                   border border-[#8B6B4A]/30 rounded bg-[#F5EFE3]/50
                   max-h-[200px] md:max-h-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(139, 107, 74, 0.06) 23px, rgba(139, 107, 74, 0.06) 24px)',
          backgroundAttachment: 'local',
        }}
      >
        {history.length === 0 ? (
          <p className="text-[#6B5B4A]/50 text-[11px] p-3 italic">
            Game started. White to move.
          </p>
        ) : (
          <div className="p-2">
            {history.map((entry, i) => (
              <motion.div
                key={entry.moveNumber}
                initial={reduceMotion ? {} : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                className="flex gap-3"
              >
                <span className="text-[#6B5B4A]/60 w-8 text-right flex-shrink-0">
                  {entry.moveNumber}.
                </span>
                <span
                  className={`flex-1 ${
                    i === history.length - 1 && !entry.black
                      ? 'text-[#2A1B15] font-semibold'
                      : 'text-[#2A1B15]'
                  }`}
                >
                  {entry.white}
                </span>
                {entry.black && (
                  <span
                    className={`flex-1 ${
                      i === history.length - 1 && entry.black
                        ? 'text-[#2A1B15] font-semibold'
                        : 'text-[#2A1B15]'
                    }`}
                  >
                    {entry.black}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
