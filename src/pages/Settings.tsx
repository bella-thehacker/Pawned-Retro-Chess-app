import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import CRTPanel from '../components/CRTPanel';
import RetroButton from '../components/RetroButton';
import RetroSlider from '../components/RetroSlider';
import RetroToggle from '../components/RetroToggle';
import RetroSelect from '../components/RetroSelect';
import SettingRow from '../components/SettingRow';
import { useSettingsStore } from '../stores/settingsStore';
import {
  Volume2,
  Eye,
  Grid3x3,
  Layout,
  Accessibility,
  RotateCcw,
  Info,
  ExternalLink,
} from 'lucide-react';

const tabs = [
  { id: 'audio', label: 'Audio', icon: Volume2 },
  { id: 'visual', label: 'Visual', icon: Eye },
  { id: 'board', label: 'Board', icon: Grid3x3 },
  { id: 'interface', label: 'Interface', icon: Layout },
  { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
  { id: 'about', label: 'About', icon: Info },
] as const;

type TabId = (typeof tabs)[number]['id'];

const animationSpeedOptions = [
  { value: 'slow', label: 'Slow' },
  { value: 'normal', label: 'Normal' },
  { value: 'fast', label: 'Fast' },
];

const boardThemeOptions = [
  { value: 'walnut', label: 'Walnut' },
  { value: 'oak', label: 'Oak' },
  { value: 'mahogany', label: 'Mahogany' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
];

const pieceThemeOptions = [
  { value: 'retro', label: 'Retro Wood' },
  { value: 'silhouette', label: 'Ink Silhouette' },
  { value: 'classic', label: 'Tournament Classic' },
];

const highlightStyleOptions = [
  { value: 'warm', label: 'Warm' },
  { value: 'cool', label: 'Cool' },
  { value: 'subtle', label: 'Subtle' },
  { value: 'bold', label: 'Bold' },
];

const fontSizeOptions = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const menuAnimationOptions = [
  { value: 'none', label: 'None' },
  { value: 'reduced', label: 'Reduced' },
  { value: 'full', label: 'Full' },
];

const colorBlindOptions = [
  { value: 'none', label: 'None' },
  { value: 'deuteranopia', label: 'Deuteranopia' },
  { value: 'protanopia', label: 'Protanopia' },
  { value: 'tritanopia', label: 'Tritanopia' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabId>('audio');
  const store = useSettingsStore();
  const getAnimationDuration = store.getAnimationDuration;

  const set = store.setSetting;

  const renderAudioSettings = () => (
    <div>
      <h3 className="font-mono text-xs text-[#C8A04A] tracking-[0.2em] uppercase mb-2">SOUND</h3>
      <SettingRow label="Master Volume" description="Overall game volume">
        <RetroSlider value={store.masterVolume} onChange={(v) => set('masterVolume', v)} />
      </SettingRow>
      <SettingRow label="Music Volume" description="Background music">
        <RetroSlider value={store.musicVolume} onChange={(v) => set('musicVolume', v)} />
      </SettingRow>
      <SettingRow label="SFX Volume" description="Sound effects">
        <RetroSlider value={store.sfxVolume} onChange={(v) => set('sfxVolume', v)} />
      </SettingRow>
      <SettingRow label="Ambient Hum" description="Vintage computer hum sound">
        <RetroToggle checked={store.ambientHum} onChange={(v) => set('ambientHum', v)} />
      </SettingRow>
      <SettingRow label="Button Clicks" description="Click sounds on UI buttons">
        <RetroToggle checked={store.buttonClicks} onChange={(v) => set('buttonClicks', v)} />
      </SettingRow>
      <SettingRow label="Move Sounds" description="Audio feedback for piece moves">
        <RetroToggle checked={store.moveSounds} onChange={(v) => set('moveSounds', v)} />
      </SettingRow>
      <SettingRow label="Capture Sounds" description="Sound when piece is captured">
        <RetroToggle checked={store.captureSounds} onChange={(v) => set('captureSounds', v)} />
      </SettingRow>
      <SettingRow label="Checkmate Sounds" description="Dramatic sound on checkmate">
        <RetroToggle checked={store.checkmateSounds} onChange={(v) => set('checkmateSounds', v)} />
      </SettingRow>
    </div>
  );

  const renderVisualSettings = () => (
    <div>
      <h3 className="font-mono text-xs text-[#C8A04A] tracking-[0.2em] uppercase mb-2">VISUAL EFFECTS</h3>
      <SettingRow label="CRT Effect" description="Scanline overlay">
        <RetroToggle checked={store.crtEffect} onChange={(v) => set('crtEffect', v)} />
      </SettingRow>
      <SettingRow label="CRT Strength" description="Intensity of scanlines">
        <RetroSlider value={store.crtStrength} onChange={(v) => set('crtStrength', v)} />
      </SettingRow>
      <SettingRow label="Film Grain" description="Vintage film grain noise">
        <RetroToggle checked={store.filmGrain} onChange={(v) => set('filmGrain', v)} />
      </SettingRow>
      <SettingRow label="Grain Strength" description="Intensity of grain">
        <RetroSlider value={store.grainStrength} onChange={(v) => set('grainStrength', v)} />
      </SettingRow>
      <SettingRow label="Screen Glow" description="Warm amber glow effect">
        <RetroToggle checked={store.screenGlow} onChange={(v) => set('screenGlow', v)} />
      </SettingRow>
      <SettingRow label="Glow Strength" description="Intensity of glow">
        <RetroSlider value={store.glowStrength} onChange={(v) => set('glowStrength', v)} />
      </SettingRow>
      <SettingRow label="Animation Speed" description="Global animation speed">
        <RetroSelect
          value={store.animationSpeed}
          options={animationSpeedOptions}
          onChange={(v) => set('animationSpeed', v as 'slow' | 'normal' | 'fast')}
        />
      </SettingRow>
    </div>
  );

  const renderBoardSettings = () => (
    <div>
      <h3 className="font-mono text-xs text-[#C8A04A] tracking-[0.2em] uppercase mb-2">BOARD APPEARANCE</h3>
      <SettingRow label="Board Theme" description="Wood/material of board">
        <RetroSelect
          value={store.boardTheme}
          options={boardThemeOptions}
          onChange={(v) => set('boardTheme', v as 'walnut' | 'oak' | 'mahogany' | 'green' | 'blue')}
        />
      </SettingRow>
      <SettingRow label="Piece Theme" description="Visual style of pieces">
        <RetroSelect
          value={store.pieceTheme}
          options={pieceThemeOptions}
          onChange={(v) => set('pieceTheme', v as 'retro' | 'silhouette' | 'classic')}
        />
      </SettingRow>
      <SettingRow label="Coordinate Display" description="Show rank/file labels">
        <RetroToggle checked={store.coordinateDisplay} onChange={(v) => set('coordinateDisplay', v)} />
      </SettingRow>
      <SettingRow label="Highlight Style" description="Move highlight color">
        <RetroSelect
          value={store.highlightStyle}
          options={highlightStyleOptions}
          onChange={(v) => set('highlightStyle', v as 'warm' | 'cool' | 'subtle' | 'bold')}
        />
      </SettingRow>
      <SettingRow label="Show Last Move" description="Highlight previous move">
        <RetroToggle checked={store.showLastMove} onChange={(v) => set('showLastMove', v)} />
      </SettingRow>
      <SettingRow label="Show Legal Moves" description="Dots for valid destinations">
        <RetroToggle checked={store.showLegalMoves} onChange={(v) => set('showLegalMoves', v)} />
      </SettingRow>
    </div>
  );

  const renderInterfaceSettings = () => (
    <div>
      <h3 className="font-mono text-xs text-[#C8A04A] tracking-[0.2em] uppercase mb-2">INTERFACE</h3>
      <SettingRow label="Font Size" description="UI text size">
        <RetroSelect
          value={store.fontSize}
          options={fontSizeOptions}
          onChange={(v) => set('fontSize', v as 'small' | 'medium' | 'large')}
        />
      </SettingRow>
      <SettingRow label="UI Scale" description="Overall interface scaling">
        <RetroSlider value={store.uiScale} min={75} max={125} onChange={(v) => set('uiScale', v)} />
      </SettingRow>
      <SettingRow label="Menu Animation" description="Animation level">
        <RetroSelect
          value={store.menuAnimation}
          options={menuAnimationOptions}
          onChange={(v) => set('menuAnimation', v as 'none' | 'reduced' | 'full')}
        />
      </SettingRow>
      <SettingRow label="Sound on Hover" description="Audio preview on hover">
        <RetroToggle checked={store.soundOnHover} onChange={(v) => set('soundOnHover', v)} />
      </SettingRow>
      <SettingRow label="Show Hints" description="Display move suggestions">
        <RetroToggle checked={store.showHints} onChange={(v) => set('showHints', v)} />
      </SettingRow>
    </div>
  );

  const renderAccessibilitySettings = () => (
    <div>
      <h3 className="font-mono text-xs text-[#C8A04A] tracking-[0.2em] uppercase mb-2">ACCESSIBILITY</h3>
      <SettingRow label="High Contrast" description="Increase contrast for visibility">
        <RetroToggle checked={store.highContrast} onChange={(v) => set('highContrast', v)} />
      </SettingRow>
      <SettingRow label="Reduce Motion" description="Minimize animations">
        <RetroToggle checked={store.reduceMotion} onChange={(v) => set('reduceMotion', v)} />
      </SettingRow>
      <SettingRow label="Screen Reader" description="Enhanced ARIA + sound subtitles">
        <RetroToggle checked={store.screenReader} onChange={(v) => set('screenReader', v)} />
      </SettingRow>
      <SettingRow label="Sound Subtitles" description="Visual captions for game sounds">
        <RetroToggle checked={store.soundSubtitles} onChange={(v) => set('soundSubtitles', v)} />
      </SettingRow>
      <SettingRow label="Large Pieces" description="Increase piece size by 25%">
        <RetroToggle checked={store.largePieces} onChange={(v) => set('largePieces', v)} />
      </SettingRow>
      <SettingRow label="Color Blind Mode" description="Adjust colors for color blindness">
        <RetroSelect
          value={store.colorBlindMode}
          options={colorBlindOptions}
          onChange={(v) => set('colorBlindMode', v as 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia')}
        />
      </SettingRow>
    </div>
  );

  const renderAboutSettings = () => (
    <div>
      <h3 className="font-mono text-xs text-[#C8A04A] tracking-[0.2em] uppercase mb-2">ABOUT PAWNED</h3>
      <div className="space-y-4 font-mono text-[13px] text-[#6B5B4A] leading-relaxed">
        <p>
          Pawned is a premium retro-inspired chess experience, built with love and nostalgia for the golden era of chess computers, wooden tournament boards, and vintage arcade aesthetics.
        </p>
        <p>
          Every detail — from the warm walnut palette to the CRT scanlines — is designed to transport you back to a time when chess was played with character and craftsmanship.
        </p>

        <div className="h-px bg-[#8B6B4A]/20 my-4" />

        <h4 className="font-mono text-[11px] text-[#2A1B15] tracking-wider uppercase font-semibold">
          Designed & Developed By
        </h4>
        <p className="font-display text-[18px] font-semibold text-[#2A1B15]">
          CTRL CODE SOLUTIONS&trade;
        </p>
        <a
          href="https://ctrl-blue.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[#C8A04A] hover:text-[#8B6B4A] transition-colors"
        >
          <ExternalLink size={12} />
          <span className="text-[11px] tracking-wider">ctrlcodesolutions.com</span>
        </a>

        <div className="h-px bg-[#8B6B4A]/20 my-4" />

        <h4 className="font-mono text-[11px] text-[#2A1B15] tracking-wider uppercase font-semibold">
          Third-Party Assets & Credits
        </h4>
        <div className="space-y-2 text-[11px]">
          <p>
            <span className="text-[#2A1B15] font-semibold">Pixel Chess Pieces:</span> Custom retro-styled chess piece assets designed for Pawned.
          </p>
          <p>
            <span className="text-[#2A1B15] font-semibold">Typography:</span>{' '}
            <em>Cormorant Garamond</em> by Christian Thalmann (OFL),{' '}
            <em>IBM Plex Mono</em> by IBM (OFL),{' '}
            <em>Press Start 2P</em> by CodeMan38 (OFL).
          </p>
          <p>
            <span className="text-[#2A1B15] font-semibold">Icons:</span> Lucide React (ISC License).
          </p>
          <p>
            <span className="text-[#2A1B15] font-semibold">Chess Engine:</span> chess.js by Jeff Hlywa (BSD-2-Clause).
          </p>
          <p>
            <span className="text-[#2A1B15] font-semibold">Sound Generation:</span> Web Audio API — synthesized retro sound effects.
          </p>
        </div>

        <div className="h-px bg-[#8B6B4A]/20 my-4" />

        <p className="text-[10px] text-[#8B6B4A]">
          Pawned &copy; {new Date().getFullYear()} Ctrl Code Solutions&trade;. All rights reserved.
        </p>
        <p className="text-[10px] text-[#8B6B4A]">
          Built with React, TypeScript, Tailwind CSS, and Framer Motion.
        </p>
      </div>
    </div>
  );

  const tabContent: Record<TabId, React.ReactNode> = {
    audio: renderAudioSettings(),
    visual: renderVisualSettings(),
    board: renderBoardSettings(),
    interface: renderInterfaceSettings(),
    accessibility: renderAccessibilitySettings(),
    about: renderAboutSettings(),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader
        title="SETTINGS"
        subtitle="Customize your Pawned experience."
      />

      <div className="max-w-[960px] mx-auto px-4 md:px-6 pb-16 w-full flex-1">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Tab Navigation */}
          <nav className="md:w-[240px] flex-shrink-0">
            {/* Desktop: vertical tabs */}
            <div className="hidden md:flex flex-col gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 font-mono text-sm transition-all duration-200 text-left rounded-r-md border-l-[3px] ${
                      isActive
                        ? 'text-[#C8A04A] border-[#C8A04A] bg-[rgba(200,160,74,0.05)]'
                        : 'text-[#6B5B4A] border-transparent hover:text-[#2A1B15]'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Mobile: horizontal scrollable tabs */}
            <div className="flex md:hidden gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 font-mono text-xs whitespace-nowrap transition-all duration-200 rounded-md border ${
                      isActive
                        ? 'text-[#C8A04A] border-[#C8A04A] bg-[rgba(200,160,74,0.05)]'
                        : 'text-[#6B5B4A] border-[#8B6B4A] hover:text-[#2A1B15]'
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <CRTPanel>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: getAnimationDuration(0.2) }}
                >
                  {tabContent[activeTab]}
                </motion.div>
              </AnimatePresence>
            </CRTPanel>

            {/* Reset Button */}
            <div className="mt-6 flex justify-end">
              <RetroButton
                variant="secondary"
                size="sm"
                icon={RotateCcw}
                onClick={() => store.resetSettings()}
              >
                Reset to Defaults
              </RetroButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
