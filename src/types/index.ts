export type AnimationSpeed = 'slow' | 'normal' | 'fast';
export type BoardTheme = 'walnut' | 'oak' | 'mahogany' | 'green' | 'blue';
export type PieceTheme = 'retro' | 'silhouette' | 'classic';
export type HighlightStyle = 'warm' | 'cool' | 'subtle' | 'bold';
export type FontSize = 'small' | 'medium' | 'large';
export type MenuAnimation = 'none' | 'reduced' | 'full';
export type ColorBlindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
export type DifficultyLevel = 'beginner' | 'beginner-plus' | 'easy' | 'easy-plus' | 'medium' | 'medium-plus' | 'hard' | 'hard-plus' | 'expert' | 'master';
export type GameMode = 'pass-and-play' | 'robot';
export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';

export interface DifficultyCard {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  level: DifficultyLevel;
}

export interface SettingsState {
  // Audio
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  ambientHum: boolean;
  buttonClicks: boolean;
  moveSounds: boolean;
  checkmateSounds: boolean;
  captureSounds: boolean;

  // Visual
  crtEffect: boolean;
  crtStrength: number;
  filmGrain: boolean;
  grainStrength: number;
  screenGlow: boolean;
  glowStrength: number;
  animationSpeed: AnimationSpeed;

  // Board
  boardTheme: BoardTheme;
  pieceTheme: PieceTheme;
  coordinateDisplay: boolean;
  highlightStyle: HighlightStyle;
  showLastMove: boolean;
  showLegalMoves: boolean;

  // Interface
  fontSize: FontSize;
  uiScale: number;
  menuAnimation: MenuAnimation;
  soundOnHover: boolean;
  showHints: boolean;

  // Accessibility
  highContrast: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
  largePieces: boolean;
  colorBlindMode: ColorBlindMode;
  soundSubtitles: boolean;
}

export interface ChessMove {
  color: 'w' | 'b';
  from: string;
  to: string;
  promotion?: string;
  san: string;
  piece: string;
  captured?: string;
  flags: string;
}

export interface MoveHistoryEntry {
  moveNumber: number;
  white: string;
  black?: string;
}

export interface TimerState {
  white: number;
  black: number;
  active: 'w' | 'b' | null;
  isRunning: boolean;
}

export interface GameState {
  fen: string;
  turn: 'w' | 'b';
  status: GameStatus;
  moves: ChessMove[];
  moveHistory: MoveHistoryEntry[];
  capturedByWhite: string[];
  capturedByBlack: string[];
  lastMove: { from: string; to: string } | null;
  halfMoves: number;
  fullMoves: number;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  inThreefold: boolean;
  insufficientMaterial: boolean;
}

export interface SquareHighlight {
  square: string;
  type: 'selected' | 'legal' | 'capture' | 'last-move' | 'check';
}
