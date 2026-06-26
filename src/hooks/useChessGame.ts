import { useState, useCallback, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import type { ChessMove, GameState, SquareHighlight } from '../types';

export interface UseChessGameReturn {
  // Board state
  game: Chess;
  fen: string;
  turn: 'w' | 'b';

  // Selection & moves
  selectedSquare: string | null;
  legalMoves: string[];
  highlights: SquareHighlight[];

  // Game status
  status: GameState['status'];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  winner: 'w' | 'b' | null;

  // Move tracking
  moves: ChessMove[];
  moveHistory: { moveNumber: number; white: string; black?: string }[];
  lastMove: { from: string; to: string } | null;
  capturedByWhite: string[];
  capturedByBlack: string[];

  // Actions
  selectSquare: (square: string) => void;
  makeMove: (from: string, to: string, promotion?: string) => boolean;
  undo: () => void;
  reset: () => void;

  // UI helpers
  getPieceAt: (square: string) => { type: string; color: 'w' | 'b' } | null;
  isLegalMove: (from: string, to: string) => boolean;
  getSquareHighlight: (square: string) => SquareHighlight | undefined;
}

export function useChessGame(): UseChessGameReturn {
  const gameRef = useRef(new Chess());
  const [version, setVersion] = useState(0);

  // Selection state
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<SquareHighlight[]>([]);

  // Force re-render helper
  const update = useCallback(() => setVersion((v) => v + 1), []);

  const game = gameRef.current;

  // Derived state
  const fen = game.fen();
  const turn = game.turn() as 'w' | 'b';
  const isCheck = game.inCheck();
  const isCheckmate = game.isCheckmate();
  const isStalemate = game.isStalemate();
  const isDraw = game.isDraw();
  // Note: isInsufficientMaterial and isThreefoldRepetition available via game API if needed

  const status: GameState['status'] = isCheckmate
    ? 'checkmate'
    : isStalemate
      ? 'stalemate'
      : isDraw
        ? 'draw'
        : isCheck
          ? 'check'
          : 'playing';

  const winner: 'w' | 'b' | null = isCheckmate ? (turn === 'w' ? 'b' : 'w') : null;

  // Move history
  const history = game.history({ verbose: true }) as ChessMove[];
  const lastMove = history.length > 0
    ? { from: history[history.length - 1].from, to: history[history.length - 1].to }
    : null;

  // Build move history in pairs
  const moveHistory = (() => {
    const entries: { moveNumber: number; white: string; black?: string }[] = [];
    for (let i = 0; i < history.length; i += 2) {
      entries.push({
        moveNumber: Math.floor(i / 2) + 1,
        white: history[i].san,
        black: history[i + 1]?.san,
      });
    }
    return entries;
  })();

  // Captured pieces tracking
  const { capturedByWhite, capturedByBlack } = (() => {
    const cw: string[] = [];
    const cb: string[] = [];
    history.forEach((move) => {
      if (move.captured) {
        if (move.color === 'w') {
          cw.push(move.captured);
        } else {
          cb.push(move.captured);
        }
      }
    });
    return { capturedByWhite: cw, capturedByBlack: cb };
  })();

  // Get piece at square
  const getPieceAt = useCallback(
    (square: string) => {
      const piece = game.get(square as any);
      if (!piece) return null;
      return { type: piece.type, color: piece.color as 'w' | 'b' };
    },
    [game, version]
  );

  // Check if a move is legal
  const isLegalMove = useCallback(
    (from: string, to: string) => {
      try {
        const moves = game.moves({ square: from as any, verbose: true });
        return moves.some((m: any) => m.to === to);
      } catch {
        return false;
      }
    },
    [game, version]
  );

  // Get highlight for a square
  const getSquareHighlight = useCallback(
    (square: string) => highlights.find((h) => h.square === square),
    [highlights]
  );

  // Select a square (shows legal moves)
  const selectSquare = useCallback(
    (square: string) => {
      const piece = game.get(square as any);

      // If clicking the already selected square, deselect
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalMoves([]);
        setHighlights([]);
        return;
      }

      // If a piece is already selected and the new square is a legal move, make the move
      if (selectedSquare && legalMoves.includes(square)) {
        makeMove(selectedSquare, square);
        return;
      }

      // If clicking own piece, select it and show legal moves
      if (piece && piece.color === turn) {
        setSelectedSquare(square);
        const moves = game.moves({ square: square as any, verbose: true });
        const destinations = moves.map((m: any) => m.to);
        setLegalMoves(destinations);

        // Build highlights
        const newHighlights: SquareHighlight[] = [
          { square, type: 'selected' },
          ...destinations.map((dest: string) => {
            const targetPiece = game.get(dest as any);
            return {
              square: dest,
              type: targetPiece ? ('capture' as const) : ('legal' as const),
            };
          }),
        ];

        // Add last move highlight
        if (lastMove) {
          newHighlights.push(
            { square: lastMove.from, type: 'last-move' },
            { square: lastMove.to, type: 'last-move' }
          );
        }

        // Add check highlight
        if (isCheck) {
          // Find the king
          const board = game.board();
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              const p = board[r][c];
              if (p && p.type === 'k' && p.color === turn) {
                const file = String.fromCharCode(97 + c);
                const rank = 8 - r;
                newHighlights.push({ square: `${file}${rank}`, type: 'check' });
              }
            }
          }
        }

        setHighlights(newHighlights);
        return;
      }

      // Clicking empty square or opponent's piece without selection
      setSelectedSquare(null);
      setLegalMoves([]);

      // Still show last move and check
      const baseHighlights: SquareHighlight[] = [];
      if (lastMove) {
        baseHighlights.push(
          { square: lastMove.from, type: 'last-move' },
          { square: lastMove.to, type: 'last-move' }
        );
      }
      if (isCheck) {
        const board = game.board();
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.type === 'k' && p.color === turn) {
              const file = String.fromCharCode(97 + c);
              const rank = 8 - r;
              baseHighlights.push({ square: `${file}${rank}`, type: 'check' });
            }
          }
        }
      }
      setHighlights(baseHighlights);
    },
    [game, selectedSquare, legalMoves, turn, lastMove, isCheck, version]
  );

  // Make a move
  const makeMove = useCallback(
    (from: string, to: string, promotion?: string): boolean => {
      try {
        const moveResult = game.move({
          from: from as any,
          to: to as any,
          promotion: promotion as any,
        });

        if (moveResult) {
          setSelectedSquare(null);
          setLegalMoves([]);

          // Build highlights for post-move state
          const newHighlights: SquareHighlight[] = [];
          if (lastMove) {
            newHighlights.push(
              { square: lastMove.from, type: 'last-move' },
              { square: lastMove.to, type: 'last-move' }
            );
          }

          const nextTurn = game.turn() as 'w' | 'b';
          const nowCheck = game.inCheck();
          if (nowCheck) {
            const board = game.board();
            for (let r = 0; r < 8; r++) {
              for (let c = 0; c < 8; c++) {
                const p = board[r][c];
                if (p && p.type === 'k' && p.color === nextTurn) {
                  const file = String.fromCharCode(97 + c);
                  const rank = 8 - r;
                  newHighlights.push({ square: `${file}${rank}`, type: 'check' });
                }
              }
            }
          }
          setHighlights(newHighlights);

          update();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [game, lastMove, update]
  );

  // Undo last move
  const undo = useCallback(() => {
    game.undo();
    setSelectedSquare(null);
    setLegalMoves([]);
    setHighlights([]);
    update();
  }, [game, update]);

  // Reset game
  const reset = useCallback(() => {
    gameRef.current = new Chess();
    setSelectedSquare(null);
    setLegalMoves([]);
    setHighlights([]);
    update();
  }, [update]);

  // Update highlights when version changes (for last-move and check)
  useEffect(() => {
    const newHighlights: SquareHighlight[] = [];
    if (lastMove) {
      newHighlights.push(
        { square: lastMove.from, type: 'last-move' },
        { square: lastMove.to, type: 'last-move' }
      );
    }
    if (isCheck) {
      const board = game.board();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = board[r][c];
          if (p && p.type === 'k' && p.color === turn) {
            const file = String.fromCharCode(97 + c);
            const rank = 8 - r;
            newHighlights.push({ square: `${file}${rank}`, type: 'check' });
          }
        }
      }
    }
    setHighlights(newHighlights);
  }, [version, isCheck, lastMove, game, turn]);

  return {
    game,
    fen,
    turn,
    selectedSquare,
    legalMoves,
    highlights,
    status,
    isCheck,
    isCheckmate,
    isStalemate,
    isDraw,
    winner,
    moves: history,
    moveHistory,
    lastMove,
    capturedByWhite,
    capturedByBlack,
    selectSquare,
    makeMove,
    undo,
    reset,
    getPieceAt,
    isLegalMove,
    getSquareHighlight,
  };
}
