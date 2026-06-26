import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FloatingPieces from '../components/FloatingPieces';
import ArcadeSymbols from '../components/ArcadeSymbols';
import RetroButton from '../components/RetroButton';
import TypewriterText from '../components/TypewriterText';
import { useSettingsStore } from '../stores/settingsStore';
import { hasSavedGame } from '../lib/gameStorage';
import {
  Cpu,
  Users,
  Play,
  Settings,
  HelpCircle,
} from 'lucide-react';

const menuButtons = [
  { label: 'PLAY VS ROBOT', path: '/robot', icon: Cpu },
  { label: 'PLAY WITH FRIEND', path: '/friend', icon: Users },
  { label: 'CONTINUE GAME', path: '/game', icon: Play },
  { label: 'SETTINGS', path: '/settings', icon: Settings },
  { label: 'HOW TO PLAY', path: '/how-to-play', icon: HelpCircle },
];

export default function Home() {
  const navigate = useNavigate();
  const getAnimationDuration = useSettingsStore((s) => s.getAnimationDuration);
  const [showMenu, setShowMenu] = useState(false);
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    setCanContinue(hasSavedGame());
  }, []);

  const handleTypewriterComplete = useCallback(() => {
    setShowMenu(true);
  }, []);

  const dur = getAnimationDuration(1);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Floating background */}
      <FloatingPieces />
      <ArcadeSymbols />

      {/* CRT scanline interior overlay */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(74, 44, 29, 0.015) 3px, rgba(74, 44, 29, 0.015) 4px)',
        }}
      />

      {/* Subtle vignette */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{ boxShadow: 'inset 0 0 150px rgba(42, 27, 21, 0.12)' }}
      />

      {/* Logo */}
      <motion.div
        className="relative z-[2] text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: getAnimationDuration(1.2),
          ease: [0.25, 0.1, 0.25, 1],
          delay: getAnimationDuration(0.3),
        }}
      >
        <motion.h1
          className="font-display font-bold text-[clamp(48px,10vw,96px)] mt-12 text-[#2A1B15] tracking-[0.15em]"
          style={{
            textShadow: '0 0 40px rgba(200, 160, 74, 0.3), 0 0 80px rgba(200, 160, 74, 0.15)',
          }}
          animate={{
            opacity: [1, 0.9, 1, 0.95, 1],
          }}
          transition={{
            duration: 0.2,
            delay: getAnimationDuration(2),
            repeat: Infinity,
            repeatDelay: 3 + Math.random() * 2,
          }}
        >
          PAWNED
        </motion.h1>

        {/* Typewriter subheading */}
        <div className="mt-6">
          <TypewriterText
            text="NO TIME TO LOSE."
            speed={60}
            delay={800 + (dur > 0 ? 300 : 0)}
            onComplete={handleTypewriterComplete}
            className="font-mono text-[clamp(14px,2vw,18px)] text-[#6B5B4A] tracking-[0.3em]"
          />
        </div>
      </motion.div>

      {/* Main Menu Buttons */}
      <motion.div
        className="relative z-[2] mt-16 flex flex-col gap-4 items-center"
        initial="hidden"
        animate={showMenu ? 'visible' : 'hidden'}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: getAnimationDuration(0.15),
            },
          },
        }}
      >
        {menuButtons.map((button) => {
          // Continue Game button
          if (button.label === 'CONTINUE GAME') {
            if (!canContinue) {
              return (
                <motion.div
                  key={button.label}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: getAnimationDuration(0.3), ease: 'easeOut' }}
                >
                  <RetroButton
                    variant="secondary"
                    size="lg"
                    icon={button.icon}
                    onClick={() => {}}
                    disabled
                    className="w-[min(320px,80vw)] opacity-40 cursor-not-allowed"
                  >
                    {button.label}
                  </RetroButton>
                </motion.div>
              );
            }
            return (
              <motion.div
                key={button.label}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: getAnimationDuration(0.3), ease: 'easeOut' }}
              >
                <RetroButton
                  variant="accent"
                  size="lg"
                  icon={button.icon}
                  onClick={() => navigate(button.path!)}
                  className="w-[min(320px,80vw)] animate-pulse"
                >
                  {button.label}
                </RetroButton>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={button.label}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: getAnimationDuration(0.3), ease: 'easeOut' }}
            >
              <RetroButton
                variant={button.label === 'PLAY VS ROBOT' ? 'primary' : 'secondary'}
                size="lg"
                icon={button.icon}
                onClick={() => navigate(button.path!)}
                className="w-[min(320px,80vw)]"
              >
                {button.label}
              </RetroButton>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Home Footer */}
      <motion.div
        className="relative z-[2] mt-auto pt-10 pb-6 text-center flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: getAnimationDuration(2), duration: getAnimationDuration(1) }}
      >
        <p className="font-mono text-[11px] text-[#6B5B4A] tracking-[0.2em]">
          DESIGNED & DEVELOPED BY
        </p>
        <p className="font-display text-[16px] font-semibold text-[#2A1B15] tracking-[0.1em]">
          CTRL CODE SOLUTIONS&trade;
        </p>
        <a
          href="https://ctrlcodesolutions.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 mt-1 rounded-md border border-[#8B6B4A] bg-[rgba(139,107,74,0.05)] hover:bg-[rgba(200,160,74,0.1)] hover:border-[#C8A04A] transition-all duration-200 group"
        >
          <span className="font-mono text-[10px] text-[#6B5B4A] group-hover:text-[#C8A04A] tracking-wider uppercase transition-colors">
            Visit CTRL CODE SOLUTIONS
          </span>
        </a>
      </motion.div>
    </div>
  );
}
