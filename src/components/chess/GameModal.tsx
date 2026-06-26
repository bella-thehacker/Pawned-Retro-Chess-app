import { motion, AnimatePresence } from 'framer-motion';
import RetroButton from '../RetroButton';
import MatchStats from './MatchStats';
import type { GameStatus } from '../../types';
import type { MatchStatistics } from '../../hooks/useMatchStats';
import {
  RotateCcw,
  Home,
  Trophy,
  Skull,
  Shield,
  Clock,
  Infinity,
  Handshake,
} from 'lucide-react';

interface GameModalProps {
  isOpen: boolean;
  status: GameStatus;
  winner: 'w' | 'b' | null;
  stats: MatchStatistics;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

interface DrawConfig {
  title: string;
  subtitle: string;
  message: string;
  icon: typeof Skull;
  iconColor: string;
  bgGlow: string;
}

const DRAW_CONFIGS: Record<string, DrawConfig> = {
  stalemate: {
    title: 'STALEMATE',
    subtitle: 'No legal moves remain',
    message: 'The king is not in check, but has no safe squares. A noble deadlock.',
    icon: Shield,
    iconColor: '#8B6B4A',
    bgGlow: 'rgba(139, 107, 74, 0.1)',
  },
  'threefold-repetition': {
    title: 'DRAW BY REPETITION',
    subtitle: 'Position repeated three times',
    message: 'History echoes itself. The board has spoken — this path leads nowhere new.',
    icon: Infinity,
    iconColor: '#8B6B4A',
    bgGlow: 'rgba(139, 107, 74, 0.1)',
  },
  'insufficient-material': {
    title: 'INSUFFICIENT MATERIAL',
    subtitle: 'No force to deliver checkmate',
    message: 'The remaining warriors lack the strength to claim victory. A peaceful end.',
    icon: Shield,
    iconColor: '#8B6B4A',
    bgGlow: 'rgba(139, 107, 74, 0.1)',
  },
  'fifty-move-rule': {
    title: 'FIFTY-MOVE RULE',
    subtitle: '50 moves without capture or pawn advance',
    message: 'The battle has raged too long without progress. The arbiter calls it even.',
    icon: Clock,
    iconColor: '#8B6B4A',
    bgGlow: 'rgba(139, 107, 74, 0.1)',
  },
  agreement: {
    title: 'DRAW BY AGREEMENT',
    subtitle: 'Mutual consent',
    message: 'Both commanders have seen enough. Honor is preserved on both sides.',
    icon: Handshake,
    iconColor: '#8B6B4A',
    bgGlow: 'rgba(139, 107, 74, 0.1)',
  },
  draw: {
    title: 'DRAW',
    subtitle: 'Game ended in a draw',
    message: 'An equal contest. Neither side could break the deadlock.',
    icon: Shield,
    iconColor: '#8B6B4A',
    bgGlow: 'rgba(139, 107, 74, 0.1)',
  },
};

export default function GameModal({
  isOpen,
  status,
  winner,
  stats,
  onPlayAgain,
  onBackToMenu,
}: GameModalProps) {
  const getConfig = () => {
    switch (status) {
      case 'checkmate':
        return {
          title: winner === 'w' ? 'WHITE WINS' : 'BLACK WINS',
          subtitle: 'Checkmate',
          message: winner === 'w'
            ? 'The white army claims victory. The black king has fallen.'
            : 'The black army claims victory. The white king has fallen.',
          icon: Trophy,
          iconColor: '#C8A04A',
          bgGlow: 'rgba(200, 160, 74, 0.15)',
        };
      case 'stalemate':
        return DRAW_CONFIGS.stalemate;
      case 'draw': {
        // Determine draw reason from stats
        const reason = stats.resultReason;
        if (reason === 'threefold-repetition') return DRAW_CONFIGS['threefold-repetition'];
        if (reason === 'insufficient-material') return DRAW_CONFIGS['insufficient-material'];
        if (reason === 'fifty-move-rule') return DRAW_CONFIGS['fifty-move-rule'];
        if (reason === 'agreement') return DRAW_CONFIGS.agreement;
        return DRAW_CONFIGS.draw;
      }
      default:
        return null;
    }
  };

  const config = getConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Overlay with CRT flicker effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-[rgba(42,27,21,0.7)] backdrop-blur-sm"
            style={{
              animation: 'crtFlicker 3s infinite',
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative z-[10000] w-[90vw] max-w-[420px] max-h-[90vh] overflow-y-auto"
          >
            {/* CRT scanlines on modal */}
            <div
              className="absolute inset-0 pointer-events-none rounded-[20px] z-10 overflow-hidden"
              style={{
                background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(74, 44, 29, 0.02) 3px, rgba(74, 44, 29, 0.02) 4px)',
              }}
            />

            <div
              className="relative bg-[#E7DFC9] border-2 border-[#8B6B4A] rounded-[20px] shadow-lg p-6 md:p-8 text-center"
              style={{
                boxShadow: `0 0 60px ${config.bgGlow}, 0 8px 32px rgba(42, 27, 21, 0.3)`,
              }}
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="flex justify-center mb-4"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: config.bgGlow }}
                >
                  <Icon size={32} style={{ color: config.iconColor }} />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-arcade text-[14px] md:text-[16px] text-[#2A1B15] tracking-[0.1em] mb-1"
              >
                {config.title}
              </motion.h2>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="font-mono text-[11px] text-[#C8A04A] mb-2"
              >
                {config.subtitle}
              </motion.p>

              {/* Retro message */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="font-mono text-[11px] text-[#6B5B4A] mb-4 italic leading-relaxed"
              >
                {config.message}
              </motion.p>

              {/* Match Statistics */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mb-6"
              >
                <MatchStats stats={stats} winner={winner} />
              </motion.div>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="flex flex-col sm:flex-row gap-3 justify-center"
              >
                <RetroButton
                  variant="accent"
                  icon={RotateCcw}
                  onClick={onPlayAgain}
                >
                  PLAY AGAIN
                </RetroButton>
                <RetroButton
                  variant="secondary"
                  icon={Home}
                  onClick={onBackToMenu}
                >
                  BACK TO MENU
                </RetroButton>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
