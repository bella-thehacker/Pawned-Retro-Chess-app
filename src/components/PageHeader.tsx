import { motion } from 'framer-motion';
import { useSettingsStore } from '../stores/settingsStore';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  const getAnimationDuration = useSettingsStore((s) => s.getAnimationDuration);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: getAnimationDuration(0.3), ease: 'easeOut' }}
      className="px-6 md:px-10 pt-[100px] pb-6 text-center"
    >
      <h1 className="font-display text-[clamp(28px,5vw,42px)] font-bold text-[#2A1B15]">
        {title}
      </h1>
      {subtitle && (
        <p className="font-mono text-sm text-[#6B5B4A] mt-2">{subtitle}</p>
      )}
    </motion.div>
  );
}
