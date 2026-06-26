import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '../../stores/settingsStore';

interface SoundSubtitlesProps {
  lastSound: string | null;
}

const SOUND_LABELS: Record<string, string> = {
  move: 'MOVE',
  capture: 'CAPTURE',
  check: 'CHECK',
  checkmate: 'CHECKMATE',
  'game-start': 'GAME START',
  'ui-click': 'CLICK',
};

export default function SoundSubtitles({ lastSound }: SoundSubtitlesProps) {
  const screenReader = useSettingsStore((s) => s.screenReader);
  const [visible, setVisible] = useState(false);
  const [currentLabel, setCurrentLabel] = useState('');
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  useEffect(() => {
    if (!lastSound || !screenReader) return;

    const label = SOUND_LABELS[lastSound] || lastSound.toUpperCase();
    setCurrentLabel(label);
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [lastSound, screenReader]);

  if (!screenReader) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[10001] pointer-events-none"
        >
          <div className="px-3 py-1.5 rounded bg-[#2A1B15]/80 border border-[#C8A04A]/30">
            <span className="font-mono text-[10px] text-[#C8A04A] tracking-[0.2em]">
              [{currentLabel}]
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
