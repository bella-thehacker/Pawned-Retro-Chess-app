import { useState, useEffect, useRef } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

export default function CRTEffect() {
  const { crtEffect, crtStrength } = useSettingsStore();
  const [glitching, setGlitching] = useState(false);
  const scanlinesRef = useRef<HTMLDivElement>(null);

  // Occasional glitch effect
  useEffect(() => {
    if (!crtEffect) return;

    const scheduleGlitch = () => {
      const delay = 8000 + Math.random() * 7000; // 8–15s
      const timer = setTimeout(() => {
        setGlitching(true);
        setTimeout(() => setGlitching(false), 50);
        scheduleGlitch();
      }, delay);
      return timer;
    };

    const timer = scheduleGlitch();
    return () => clearTimeout(timer);
  }, [crtEffect]);

  if (!crtEffect) return null;

  const scanlineOpacity = Math.max(0.01, crtStrength / 200);
  const vignetteOpacity = Math.max(0.05, crtStrength / 300);
  const glowOpacity = Math.max(0.005, crtStrength / 2000);

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none">
      {/* Scanlines layer */}
      <div
        ref={scanlinesRef}
        className="absolute inset-0 animate-crt-flicker"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 2px,
            rgba(74, 44, 29, ${scanlineOpacity}) 2px,
            rgba(74, 44, 29, ${scanlineOpacity}) 3px
          )`,
          transform: glitching ? 'translateX(2px)' : 'translateX(0)',
          transition: glitching ? 'none' : 'transform 0.05s',
        }}
      />

      {/* Vignette layer */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: `inset 0 0 200px rgba(42, 27, 21, ${vignetteOpacity})`,
        }}
      />

      {/* Subtle screen tint */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, rgba(200, 160, 74, ${glowOpacity}) 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}
