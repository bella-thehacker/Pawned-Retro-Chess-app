import { useCallback, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import { getAIMove, getDifficultyName, AI_PERSONALITIES } from '../lib/chessAI';
import type { AIPersonality } from '../lib/chessAI';
import { useSettingsStore } from '../stores/settingsStore';

export interface UseChessAIReturn {
  isThinking: boolean;
  personality: AIPersonality | null;
  makeAIMove: (game: Chess) => Promise<string | null>;
  getDifficultyName: (level: number) => string;
}

export function useChessAI(difficulty: number): UseChessAIReturn {
  const isThinkingRef = useRef(false);
  const abortRef = useRef(false);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  const personality = AI_PERSONALITIES[difficulty] || null;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current = true;
    };
  }, []);

  const makeAIMove = useCallback(
    async (game: Chess): Promise<string | null> => {
      if (isThinkingRef.current) return null;
      if (game.isGameOver()) return null;
      if (game.turn() !== 'b') return null; // AI always plays black

      isThinkingRef.current = true;
      abortRef.current = false;

      // Simulate thinking time based on difficulty (more realistic)
      const baseDelay = reduceMotion ? 100 : 400;
      const difficultyDelay = difficulty * 150;
      const randomDelay = Math.random() * 300;
      const totalDelay = baseDelay + difficultyDelay + randomDelay;

      await new Promise((resolve) => setTimeout(resolve, totalDelay));

      if (abortRef.current) {
        isThinkingRef.current = false;
        return null;
      }

      const move = getAIMove(game, difficulty);
      isThinkingRef.current = false;

      return move ? move.san : null;
    },
    [difficulty, reduceMotion]
  );

  return {
    isThinking: isThinkingRef.current,
    personality,
    makeAIMove,
    getDifficultyName: getDifficultyName,
  };
}
