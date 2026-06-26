import { motion, AnimatePresence } from 'framer-motion';
import type { GameStatus as GameStatusType } from '../../types';
import { useSettingsStore } from '../../stores/settingsStore';

interface GameStatusProps {
  status: GameStatusType;
  turn: 'w' | 'b';
  winner: 'w' | 'b' | null;
}

export default function GameStatus({ status, turn, winner }: GameStatusProps) {
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  const getStatusConfig = () => {
    switch (status) {
      case 'check':
        return {
          text: 'CHECK',
          color: '#C8A04A',
          bgColor: 'rgba(200, 160, 74, 0.12)',
          subtext: `${turn === 'w' ? 'White' : 'Black'} King is under attack`,
        };
      case 'checkmate':
        return {
          text: winner === 'w' ? 'WHITE WINS' : 'BLACK WINS',
          color: '#6E7B4F',
          bgColor: 'rgba(110, 123, 79, 0.15)',
          subtext: 'Checkmate — Game Over',
        };
      case 'stalemate':
        return {
          text: 'STALEMATE',
          color: '#8B6B4A',
          bgColor: 'rgba(139, 107, 74, 0.12)',
          subtext: 'Draw — No legal moves',
        };
      case 'draw':
        return {
          text: 'DRAW',
          color: '#8B6B4A',
          bgColor: 'rgba(139, 107, 74, 0.12)',
          subtext: 'Game ended in a draw',
        };
      case 'playing':
      default:
        return {
          text: `${turn === 'w' ? "WHITE'S" : "BLACK'S"} TURN`,
          color: '#2A1B15',
          bgColor: 'transparent',
          subtext: null,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="h-16 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={status + turn}
          initial={reduceMotion ? {} : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center gap-1"
        >
          <div
            className="px-4 py-1.5 rounded-md"
            style={{
              backgroundColor: config.bgColor,
              border: status !== 'playing' ? `1px solid ${config.color}30` : 'none',
            }}
          >
            <span
              className="font-arcade text-[11px] md:text-[13px] tracking-[0.15em]"
              style={{ color: config.color }}
            >
              {config.text}
            </span>
          </div>
          {config.subtext && (
            <span className="font-mono text-[10px] text-[#6B5B4A]">
              {config.subtext}
            </span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
