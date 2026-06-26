import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SettingsState } from '../types';

const defaultSettings: SettingsState = {
  // Audio
  masterVolume: 80,
  musicVolume: 60,
  sfxVolume: 70,
  ambientHum: true,
  buttonClicks: true,
  moveSounds: true,
  checkmateSounds: true,
  captureSounds: true,

  // Visual
  crtEffect: true,
  crtStrength: 50,
  filmGrain: true,
  grainStrength: 30,
  screenGlow: true,
  glowStrength: 40,
  animationSpeed: 'normal',

  // Board
  boardTheme: 'walnut',
  pieceTheme: 'retro',
  coordinateDisplay: true,
  highlightStyle: 'warm',
  showLastMove: true,
  showLegalMoves: true,

  // Interface
  fontSize: 'medium',
  uiScale: 100,
  menuAnimation: 'full',
  soundOnHover: false,
  showHints: true,

  // Accessibility
  highContrast: false,
  reduceMotion: false,
  screenReader: false,
  largePieces: false,
  colorBlindMode: 'none',
  soundSubtitles: false,
};

interface SettingsStore extends SettingsState {
  setSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  resetSettings: () => void;
  getAnimationDuration: (base: number) => number;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setSetting: (key, value) => set({ [key]: value } as Partial<SettingsState>),

      resetSettings: () => set({ ...defaultSettings }),

      getAnimationDuration: (base: number) => {
        const state = get();
        if (state.reduceMotion) return 0;
        const speedMultipliers = { slow: 1.5, normal: 1, fast: 0.6 };
        return base * speedMultipliers[state.animationSpeed];
      },
    }),
    {
      name: 'pawned-settings',
    }
  )
);
