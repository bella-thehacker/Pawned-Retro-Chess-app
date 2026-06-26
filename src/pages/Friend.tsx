import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import RetroCard from '../components/RetroCard';
import CRTPanel from '../components/CRTPanel';
import RetroButton from '../components/RetroButton';
import { useSettingsStore } from '../stores/settingsStore';
import { Smartphone, Globe } from 'lucide-react';

export default function Friend() {
  const navigate = useNavigate();
  const getAnimationDuration = useSettingsStore((s) => s.getAnimationDuration);

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader
        title="PLAY WITH FRIEND"
        subtitle="Share the board. Pass the device."
      />

      <div className="max-w-[720px] mx-auto px-4 md:px-6 pb-16 w-full flex-1 flex flex-col gap-6">
        {/* Pass & Play Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: getAnimationDuration(0.3), ease: 'easeOut' }}
        >
          <RetroCard className="border-[#6E7B4F]">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Icon */}
              <div className="flex-shrink-0">
                <Smartphone size={64} className="text-[#6E7B4F]" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="font-display text-[28px] font-bold text-[#2A1B15]">
                  PASS &amp; PLAY
                </h3>
                <p className="font-mono text-sm text-[#6B5B4A] mt-2 leading-relaxed">
                  Sit across from your opponent and pass the device after each move. Perfect for face-to-face matches.
                </p>
                <div className="mt-4">
                  <RetroButton
                    variant="accent"
                    onClick={() => navigate('/game?mode=pass-and-play')}
                  >
                    START MATCH
                  </RetroButton>
                </div>
              </div>
            </div>
          </RetroCard>
        </motion.div>

        {/* Online Play Card (Coming Soon) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: getAnimationDuration(0.3), delay: getAnimationDuration(0.1), ease: 'easeOut' }}
        >
          <div className="opacity-60">
            <RetroCard disabled className="border-dashed">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <Globe size={64} className="text-[#6B5B4A]" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-display text-[28px] font-bold text-[#2A1B15]">
                    ONLINE PLAY
                  </h3>
                  <p className="font-mono text-sm text-[#6B5B4A] mt-2 leading-relaxed">
                    Challenge friends online. Real-time matches with synchronized boards.
                  </p>
                  <div className="mt-4">
                    <span
                      className="inline-block font-arcade text-[10px] text-[#C66A35] px-3 py-2 rounded"
                      style={{ background: 'rgba(198, 106, 53, 0.1)' }}
                    >
                      COMING SOON
                    </span>
                  </div>
                </div>
              </div>
            </RetroCard>
          </div>
        </motion.div>

        {/* Retro Info Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: getAnimationDuration(0.3), delay: getAnimationDuration(0.2), ease: 'easeOut' }}
          className="mt-4"
        >
          <CRTPanel>
            <h4 className="font-mono text-xs text-[#C8A04A] tracking-[0.2em] uppercase mb-4">
              HOW IT WORKS
            </h4>
            <div className="space-y-4 font-mono text-[13px] text-[#6B5B4A] leading-[1.7]">
              <p>
                Pass &amp; Play is the classic way to enjoy chess with a friend. Set up the board, choose your colors, and take turns making moves on the same device.
              </p>
              <p>
                The game keeps track of whose turn it is and displays the captured pieces for each player. All standard chess rules apply including castling, en passant, and promotion.
              </p>
              <p>
                A move timer tracks each player&apos;s remaining time. The game ends on checkmate, stalemate, or draw.
              </p>
            </div>
          </CRTPanel>
        </motion.div>
      </div>
    </div>
  );
}
