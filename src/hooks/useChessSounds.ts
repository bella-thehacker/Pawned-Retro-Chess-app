import { useCallback, useRef } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

type SoundType = 'move' | 'capture' | 'check' | 'checkmate' | 'ui-click' | 'game-start';

// Web Audio API based sound synthesis for retro chess sounds
export function useChessSounds() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const { sfxVolume, moveSounds, captureSounds, checkmateSounds, buttonClicks, masterVolume } =
    useSettingsStore();

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);

  const volume = ((sfxVolume / 100) * (masterVolume / 100));

  const playSound = useCallback(
    (type: SoundType) => {
      // Check if sound is enabled
      if (type === 'move' && !moveSounds) return;
      if (type === 'capture' && !captureSounds) return;
      if ((type === 'check' || type === 'checkmate') && !checkmateSounds) return;
      if (type === 'ui-click' && !buttonClicks) return;

      try {
        const ctx = getCtx();
        const now = ctx.currentTime;
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(volume * 0.3, now);

        switch (type) {
          case 'move': {
            // Wooden tap - filtered noise burst
            const bufferSize = ctx.sampleRate * 0.05;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
              data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
            }
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, now);
            source.connect(filter);
            filter.connect(gain);
            source.start(now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            break;
          }

          case 'capture': {
            // Heavier wooden impact
            const bufferSize = ctx.sampleRate * 0.1;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
              data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
            }
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(400, now);
            source.connect(filter);
            filter.connect(gain);
            gain.gain.setValueAtTime(volume * 0.5, now);
            source.start(now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            break;
          }

          case 'check': {
            // Vintage warning bell
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.exponentialRampToValueAtTime(660, now + 0.15);
            osc.connect(gain);
            osc.start(now);
            osc.stop(now + 0.2);
            gain.gain.setValueAtTime(volume * 0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            break;
          }

          case 'checkmate': {
            // Deep orchestral chime - descending tones
            [440, 330, 220].forEach((freq, i) => {
              const osc = ctx.createOscillator();
              osc.type = 'sine';
              const g = ctx.createGain();
              g.connect(ctx.destination);
              osc.connect(g);
              osc.frequency.setValueAtTime(freq, now + i * 0.2);
              g.gain.setValueAtTime(volume * 0.2, now + i * 0.2);
              g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 1);
              osc.start(now + i * 0.2);
              osc.stop(now + i * 0.2 + 1);
            });
            break;
          }

          case 'ui-click': {
            // Mechanical button click
            const osc = ctx.createOscillator();
            osc.type = 'square';
            osc.frequency.setValueAtTime(2000, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.03);
            osc.connect(gain);
            osc.start(now);
            osc.stop(now + 0.05);
            gain.gain.setValueAtTime(volume * 0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            break;
          }

          case 'game-start': {
            // Short ascending tones
            [330, 440, 550].forEach((freq, i) => {
              const osc = ctx.createOscillator();
              osc.type = 'sine';
              const g = ctx.createGain();
              g.connect(ctx.destination);
              osc.connect(g);
              osc.frequency.setValueAtTime(freq, now + i * 0.08);
              g.gain.setValueAtTime(volume * 0.15, now + i * 0.08);
              g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.2);
              osc.start(now + i * 0.08);
              osc.stop(now + i * 0.08 + 0.2);
            });
            break;
          }
        }
      } catch {
        // Audio context not available
      }
    },
    [getCtx, volume, moveSounds, captureSounds, checkmateSounds, buttonClicks]
  );

  return { playSound };
}
