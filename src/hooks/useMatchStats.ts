import { useState, useCallback, useRef } from 'react';
import type { ChessMove } from '../types';

export interface MatchStatistics {
  totalMoves: number;
  gameDuration: number; // seconds
  piecesCaptured: { white: number; black: number };
  openingPlayed: string | null;
  result: 'white-win' | 'black-win' | 'draw' | null;
  resultReason: 'checkmate' | 'stalemate' | 'insufficient-material' | 'threefold-repetition' | 'fifty-move-rule' | 'timeout' | 'resignation' | 'agreement' | null;
  fastestMove: number; // seconds
  longestThink: number; // seconds
  whiteMaterial: number;
  blackMaterial: number;
}

export interface UseMatchStatsReturn {
  stats: MatchStatistics;
  startTracking: () => void;
  stopTracking: () => void;
  recordMove: (move: ChessMove) => void;
  setOpening: (opening: string | null) => void;
  setResult: (result: MatchStatistics['result'], reason: MatchStatistics['resultReason']) => void;
  getDuration: () => number;
}

export function useMatchStats(): UseMatchStatsReturn {
  const [stats, setStats] = useState<MatchStatistics>({
    totalMoves: 0,
    gameDuration: 0,
    piecesCaptured: { white: 0, black: 0 },
    openingPlayed: null,
    result: null,
    resultReason: null,
    fastestMove: Infinity,
    longestThink: 0,
    whiteMaterial: 39,
    blackMaterial: 39,
  });

  const startTimeRef = useRef<number>(0);
  const lastMoveTimeRef = useRef<number>(0);
  const isTrackingRef = useRef(false);

  const startTracking = useCallback(() => {
    startTimeRef.current = Date.now();
    lastMoveTimeRef.current = Date.now();
    isTrackingRef.current = true;
  }, []);

  const stopTracking = useCallback(() => {
    isTrackingRef.current = false;
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setStats((prev) => ({ ...prev, gameDuration: duration }));
  }, []);

  const recordMove = useCallback((move: ChessMove) => {
    if (!isTrackingRef.current) return;

    const now = Date.now();
    const thinkTime = (now - lastMoveTimeRef.current) / 1000;
    lastMoveTimeRef.current = now;

    setStats((prev) => {
      const newCaptured = { ...prev.piecesCaptured };
      if (move.captured) {
        if (move.color === 'w') {
          newCaptured.white = prev.piecesCaptured.white + 1;
        } else {
          newCaptured.black = prev.piecesCaptured.black + 1;
        }
      }

      // Update material
      const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
      let newWhiteMaterial = prev.whiteMaterial;
      let newBlackMaterial = prev.blackMaterial;
      if (move.captured) {
        const val = pieceValues[move.captured] || 0;
        if (move.color === 'w') {
          newBlackMaterial -= val;
        } else {
          newWhiteMaterial -= val;
        }
      }

      return {
        ...prev,
        totalMoves: prev.totalMoves + 1,
        piecesCaptured: newCaptured,
        fastestMove: Math.min(prev.fastestMove, thinkTime),
        longestThink: Math.max(prev.longestThink, thinkTime),
        whiteMaterial: newWhiteMaterial,
        blackMaterial: newBlackMaterial,
      };
    });
  }, []);

  const setOpening = useCallback((opening: string | null) => {
    setStats((prev) => ({ ...prev, openingPlayed: opening }));
  }, []);

  const setResult = useCallback(
    (result: MatchStatistics['result'], reason: MatchStatistics['resultReason']) => {
      setStats((prev) => ({
        ...prev,
        result,
        resultReason: reason,
        gameDuration: Math.floor((Date.now() - startTimeRef.current) / 1000),
      }));
    },
    []
  );

  const getDuration = useCallback(() => {
    if (!isTrackingRef.current) return stats.gameDuration;
    return Math.floor((Date.now() - startTimeRef.current) / 1000);
  }, [stats.gameDuration]);

  return {
    stats,
    startTracking,
    stopTracking,
    recordMove,
    setOpening,
    setResult,
    getDuration,
  };
}
