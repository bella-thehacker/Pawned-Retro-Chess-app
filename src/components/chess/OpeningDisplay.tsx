import { motion, AnimatePresence } from 'framer-motion';
import type { OpeningInfo } from '../../lib/openingDetection';
import { useSettingsStore } from '../../stores/settingsStore';
import { BookOpen } from 'lucide-react';

interface OpeningDisplayProps {
  opening: OpeningInfo | null;
}

export default function OpeningDisplay({ opening }: OpeningDisplayProps) {
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  if (!opening) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={opening.ecoCode}
        initial={reduceMotion ? {} : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[rgba(200,160,74,0.08)] border border-[#C8A04A]/20"
      >
        <BookOpen size={12} className="text-[#C8A04A] flex-shrink-0" />
        <span className="font-mono text-[10px] text-[#6B5B4A] tracking-wider">
          {opening.ecoCode}
        </span>
        <span className="font-mono text-[11px] text-[#2A1B15] font-semibold truncate">
          {opening.name}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
