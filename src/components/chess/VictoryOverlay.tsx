import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '../../stores/settingsStore';

interface VictoryOverlayProps {
  isActive: boolean;
  winner: 'w' | 'b' | null;
}

export default function VictoryOverlay({ isActive, winner }: VictoryOverlayProps) {
  const [showOverlay, setShowOverlay] = useState(false);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  useEffect(() => {
    if (isActive && !reduceMotion) {
      const timer = setTimeout(() => setShowOverlay(true), 800);
      return () => clearTimeout(timer);
    } else {
      setShowOverlay(false);
    }
  }, [isActive, reduceMotion]);

  if (!isActive) return null;

  const isWin = winner === 'w';
  const winColor = isWin ? 'rgba(200, 160, 74, 0.08)' : 'rgba(140, 58, 58, 0.06)';

  return (
    <AnimatePresence>
      {showOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0 z-20 pointer-events-none rounded-lg overflow-hidden"
          style={{
            background: `radial-gradient(ellipse at center, ${winColor} 0%, transparent 70%)`,
            animation: reduceMotion ? 'none' : 'crtFlicker 2s infinite',
          }}
        >
          {/* Subtle scanline overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(74, 44, 29, 0.01) 3px, rgba(74, 44, 29, 0.01) 4px)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
