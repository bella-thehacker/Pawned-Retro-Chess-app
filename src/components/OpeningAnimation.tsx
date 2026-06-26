import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StaticDot {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function OpeningAnimation() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<'scanlines' | 'static' | 'glow' | 'exit'>('scanlines');
  const [staticDots, setStaticDots] = useState<StaticDot[]>([]);

  useEffect(() => {
    // Check if already played this session
    const hasPlayed = sessionStorage.getItem('pawned-opening-played');
    if (!hasPlayed) {
      setVisible(true);
    }
  }, []);

  // Phase transitions
  useEffect(() => {
    if (!visible) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setPhase('static'), 500));
    timers.push(setTimeout(() => setPhase('glow'), 1200));
    timers.push(setTimeout(() => setPhase('exit'), 2500));
    timers.push(
      setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem('pawned-opening-played', 'true');
      }, 3500)
    );

    return () => timers.forEach(clearTimeout);
  }, [visible]);

  // Static flicker effect
  useEffect(() => {
    if (phase !== 'static') {
      setStaticDots([]);
      return;
    }

    const interval = setInterval(() => {
      const dots: StaticDot[] = Array.from({ length: 3 + Math.floor(Math.random() * 3) }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        width: 2 + Math.random() * 4,
        height: 2 + Math.random() * 4,
      }));
      setStaticDots(dots);
    }, 80);

    const clearTimer = setTimeout(() => setStaticDots([]), 700);

    return () => {
      clearInterval(interval);
      clearTimeout(clearTimer);
    };
  }, [phase]);

  const handleComplete = useCallback(() => {
    setVisible(false);
    sessionStorage.setItem('pawned-opening-played', 'true');
  }, []);

  if (!visible) return null;

  return (
    <AnimatePresence onExitComplete={handleComplete}>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999]"
          style={{ backgroundColor: '#0a0a0a' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          {/* Phase 1: Scanlines fade in */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase !== 'scanlines' ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            {Array.from({ length: 150 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute left-0 right-0"
                style={{
                  top: `${(i / 150) * 100}%`,
                  height: '2px',
                  backgroundColor: 'rgba(200, 160, 74, 0.02)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.003, duration: 0.1 }}
              />
            ))}
          </motion.div>

          {/* Phase 2: Static flicker */}
          {staticDots.map((dot) => (
            <motion.div
              key={dot.id}
              className="absolute bg-white"
              style={{
                left: `${dot.x}%`,
                top: `${dot.y}%`,
                width: `${dot.width}px`,
                height: `${dot.height}px`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 0.1 }}
            />
          ))}

          {/* Phase 3: Warm glow emergence */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at center, rgba(200, 160, 74, 0.15) 0%, transparent 70%)',
            }}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{
              scale: phase === 'glow' || phase === 'exit' ? 1.5 : 0.3,
              opacity: phase === 'glow' || phase === 'exit' ? 1 : 0,
            }}
            transition={{ duration: 1.3, ease: 'easeOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
