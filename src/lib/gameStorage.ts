/**
 * Game Save/Restore System
 * Automatically saves game state after every move
 * Allows restoring a game after browser close/reopen
 */

import type { MoveHistoryEntry } from '../types';

export interface SavedGameState {
  fen: string;
  moveHistory: MoveHistoryEntry[];
  moves: string[]; // SAN moves for opening detection
  whiteTime: number;
  blackTime: number;
  activeColor: 'w' | 'b';
  isRunning: boolean;
  capturedByWhite: string[];
  capturedByBlack: string[];
  mode: 'pass-and-play' | 'robot';
  difficulty?: number;
  startedAt: number; // timestamp
  lastMoveAt: number; // timestamp
  status: 'playing' | 'checkmate' | 'stalemate' | 'draw';
}

const STORAGE_KEY = 'pawned-saved-game';

/**
 * Save the current game state to localStorage
 */
export function saveGame(state: SavedGameState): void {
  try {
    const data = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, data);
  } catch {
    // Storage might be full or unavailable
    console.warn('Failed to save game state');
  }
}

/**
 * Load a saved game from localStorage
 */
export function loadGame(): SavedGameState | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as SavedGameState;
  } catch {
    return null;
  }
}

/**
 * Check if there's a saved game in progress
 */
export function hasSavedGame(): boolean {
  const saved = loadGame();
  if (!saved) return false;
  return saved.status === 'playing';
}

/**
 * Clear the saved game
 */
export function clearSavedGame(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Build a SavedGameState from game data
 */
export function buildSavedState(params: {
  fen: string;
  moveHistory: MoveHistoryEntry[];
  moves: string[];
  whiteTime: number;
  blackTime: number;
  activeColor: 'w' | 'b';
  isRunning: boolean;
  capturedByWhite: string[];
  capturedByBlack: string[];
  mode: 'pass-and-play' | 'robot';
  difficulty?: number;
  status: 'playing' | 'checkmate' | 'stalemate' | 'draw';
}): SavedGameState {
  return {
    ...params,
    startedAt: loadGame()?.startedAt || Date.now(),
    lastMoveAt: Date.now(),
  };
}
