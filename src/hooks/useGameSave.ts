import { useCallback } from 'react';
import { saveGame, loadGame, clearSavedGame, hasSavedGame, buildSavedState } from '../lib/gameStorage';
import type { SavedGameState } from '../lib/gameStorage';

export interface UseGameSaveReturn {
  hasSavedGame: boolean;
  save: (state: Omit<SavedGameState, 'startedAt' | 'lastMoveAt'>) => void;
  load: () => SavedGameState | null;
  clear: () => void;
}

export function useGameSave(): UseGameSaveReturn {
  const saveState = useCallback((state: Omit<SavedGameState, 'startedAt' | 'lastMoveAt'>) => {
    const fullState = buildSavedState(state);
    saveGame(fullState);
  }, []);

  const loadState = useCallback(() => {
    return loadGame();
  }, []);

  const clearState = useCallback(() => {
    clearSavedGame();
  }, []);

  return {
    hasSavedGame: hasSavedGame(),
    save: saveState,
    load: loadState,
    clear: clearState,
  };
}
