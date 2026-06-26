import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import RetroCard from '../components/RetroCard';
import RetroButton from '../components/RetroButton';
import { useSettingsStore } from '../stores/settingsStore';
import {
  Bot,
  TimerOff,
  User,
  Users,
  Brain,
  Eye,
  Crown,
  Cpu,
  Sparkles,
  Shield,
} from 'lucide-react';

const difficulties = [
  { id: 1, title: 'Static Pawn', subtitle: 'Beginner', icon: Bot, description: 'Barely moves. Good for learning the basics.' },
  { id: 2, title: 'Broken Clock', subtitle: 'Beginner+', icon: TimerOff, description: 'Makes random moves with no strategy.' },
  { id: 3, title: 'Street Player', subtitle: 'Easy', icon: User, description: 'Knows the rules, plays simple openings.' },
  { id: 4, title: 'Club Player', subtitle: 'Easy+', icon: Users, description: 'Understands basic tactics and forks.' },
  { id: 5, title: 'Tactical Mind', subtitle: 'Medium', icon: Brain, description: 'Sees combinations and plans 2-3 moves ahead.' },
  { id: 6, title: 'Silent Bishop', subtitle: 'Medium+', icon: Eye, description: 'Patient positional player. Punishes mistakes.' },
  { id: 7, title: "Master's Shadow", subtitle: 'Hard', icon: Crown, description: 'Strong endgame knowledge. Few blunders.' },
  { id: 8, title: 'Endgame Engine', subtitle: 'Hard+', icon: Cpu, description: 'Near-perfect endgame play. Respects material.' },
  { id: 9, title: 'Grandmaster Echo', subtitle: 'Expert', icon: Sparkles, description: 'Tournament-level strategy. Deep calculations.' },
  { id: 10, title: 'The Arbiter', subtitle: 'Master', icon: Shield, description: 'The ultimate challenge. Flawless play.' },
];

export default function Robot() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const navigate = useNavigate();
  const getAnimationDuration = useSettingsStore((s) => s.getAnimationDuration);

  const handleStartGame = () => {
    if (selectedId !== null) {
      navigate(`/game?mode=robot&difficulty=${selectedId}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader
        title="SELECT DIFFICULTY"
        subtitle="Choose your opponent wisely."
      />

      <div className="max-w-[960px] mx-auto px-4 md:px-6 pb-16 w-full flex-1">
        {/* Difficulty Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {difficulties.map((diff, i) => {
            const Icon = diff.icon;
            return (
              <motion.div
                key={diff.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: getAnimationDuration(0.3),
                  delay: getAnimationDuration(i * 0.05),
                  ease: 'easeOut',
                }}
              >
                <RetroCard
                  selected={selectedId === diff.id}
                  onClick={() => setSelectedId(diff.id)}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-3">
                    <Icon size={32} className="text-[#C8A04A] flex-shrink-0" />
                    <span className="w-7 h-7 rounded-full bg-walnut text-[#E7DFC9] flex items-center justify-center font-mono text-xs font-bold">
                      {diff.id}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-[22px] font-bold text-[#2A1B15] mb-1">
                    {diff.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="font-mono text-[11px] text-[#C8A04A] tracking-[0.1em] uppercase mb-2">
                    {diff.subtitle}
                  </p>

                  {/* Divider */}
                  <div className="w-full h-px bg-[#8B6B4A] my-2" />

                  {/* Description */}
                  <p className="font-mono text-[13px] text-[#6B5B4A] leading-relaxed">
                    {diff.description}
                  </p>
                </RetroCard>
              </motion.div>
            );
          })}
        </div>

        {/* Start Game Button */}
        <AnimatePresence>
          {selectedId !== null && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: getAnimationDuration(0.3), ease: 'easeOut' }}
              className="flex justify-center mt-8"
            >
              <RetroButton
                variant="accent"
                size="lg"
                onClick={handleStartGame}
              >
                START GAME
              </RetroButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
