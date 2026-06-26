import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import CRTPanel from '../components/CRTPanel';
import RetroButton from '../components/RetroButton';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../stores/settingsStore';
import { ArrowLeft } from 'lucide-react';

export default function HowToPlay() {
  const navigate = useNavigate();
  const getAnimationDuration = useSettingsStore((s) => s.getAnimationDuration);

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader
        title="HOW TO PLAY"
        subtitle="Learn the ancient art of chess."
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: getAnimationDuration(0.3), ease: 'easeOut' }}
        className="max-w-[720px] mx-auto px-4 md:px-6 pb-16 w-full flex-1"
      >
        <CRTPanel>
          <h3 className="font-mono text-xs text-[#C8A04A] tracking-[0.2em] uppercase mb-4">
            COMING IN PHASE 2
          </h3>
          <p className="font-mono text-sm text-[#6B5B4A] leading-relaxed mb-4">
            A comprehensive chess tutorial will be added here, covering rules, strategies, and advanced tactics.
          </p>
          <p className="font-mono text-sm text-[#6B5B4A] leading-relaxed">
            For now, you can explore the difficulty levels in Play vs Robot mode or set up a Pass &amp; Play match with a friend.
          </p>
        </CRTPanel>

        <div className="mt-6 flex justify-center">
          <RetroButton
            variant="secondary"
            icon={ArrowLeft}
            onClick={() => navigate('/')}
          >
            BACK TO HOME
          </RetroButton>
        </div>
      </motion.div>
    </div>
  );
}
