import { useState, useCallback, useRef } from 'react';
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
  moveHistory: {
    moveNumber: number;
    white: string;
    black?: string;
  }[];
  lastMove: {
    from: string;
    to: string;
  } | null;

  capturedByWhite: string[];
  capturedByBlack: string[];

  // Actions
  selectSquare: (square: string) => void;

  makeMove: (
    from: string,
    to: string,
    promotion?: string
  ) => boolean;

  undo: () => void;
  reset: () => void;

  // UI helpers
  getPieceAt: (
    square: string
  ) => {
    type: string;
    color: 'w' | 'b';
  } | null;

  isLegalMove: (
    from: string,
    to: string
  ) => boolean;

  getSquareHighlight: (
    square: string
  ) => SquareHighlight | undefined;
}

export function useChessGame(): UseChessGameReturn {
  const gameRef = useRef(new Chess());

  const [, setVersion] = useState(0);

  // Selection state
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<SquareHighlight[]>([]);

  // Force re-render helper
  const update = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  const game = gameRef.current;

  // ----------------------------------------
  // Derived game state
  // ----------------------------------------

  const fen = game.fen();
  const turn = game.turn() as 'w' | 'b';

  const isCheck = game.inCheck();
  const isCheckmate = game.isCheckmate();
  const isStalemate = game.isStalemate();
  const isDraw = game.isDraw();

  const status: GameState['status'] =
    isCheckmate
      ? 'checkmate'
      : isStalemate
      ? 'stalemate'
      : isDraw
      ? 'draw'
      : isCheck
      ? 'check'
      : 'playing';

  const winner: 'w' | 'b' | null = isCheckmate
    ? turn === 'w'
      ? 'b'
      : 'w'
    : null;

  // ----------------------------------------
  // Move history
  // ----------------------------------------

  const history = game.history({
    verbose: true,
  }) as ChessMove[];

  const lastMove =
    history.length > 0
      ? {
          from: history[history.length - 1].from,
          to: history[history.length - 1].to,
        }
      : null;

  // ----------------------------------------
  // Move history in pairs
  // ----------------------------------------

  const moveHistory = (() => {
    const entries: {
      moveNumber: number;
      white: string;
      black?: string;
    }[] = [];

    for (let i = 0; i < history.length; i += 2) {
      entries.push({
        moveNumber: Math.floor(i / 2) + 1,
        white: history[i].san,
        black: history[i + 1]?.san,
      });
    }

    return entries;
  })();

  // ----------------------------------------
  // Captured pieces
  // ----------------------------------------

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

    return {
      capturedByWhite: cw,
      capturedByBlack: cb,
    };
  })();

  // ----------------------------------------
  // Get piece at square
  // ----------------------------------------

  const getPieceAt = useCallback(
    (square: string) => {
      const piece = game.get(square as any);

      if (!piece) {
        return null;
      }

      return {
        type: piece.type,
        color: piece.color as 'w' | 'b',
      };
    },
    [game, fen]
  );

  // ----------------------------------------
  // Check if a move is legal
  // ----------------------------------------

  const isLegalMove = useCallback(
    (from: string, to: string) => {
      try {
        const moves = game.moves({
          square: from as any,
          verbose: true,
        });

        return moves.some(
          (move: any) => move.to === to
        );
      } catch {
        return false;
      }
    },
    [game, fen]
  );

  // ----------------------------------------
  // Get highlight for a square
  // ----------------------------------------

  const getSquareHighlight = useCallback(
    (square: string) => {
      return highlights.find(
        (highlight) => highlight.square === square
      );
    },
    [highlights]
  );

  // ----------------------------------------
  // Build last-move + check highlights
  // ----------------------------------------

  const buildBaseHighlights = useCallback(
    (): SquareHighlight[] => {
      const baseHighlights: SquareHighlight[] = [];

      // Highlight the previous move
      if (lastMove) {
        baseHighlights.push(
          {
            square: lastMove.from,
            type: 'last-move',
          },
          {
            square: lastMove.to,
            type: 'last-move',
          }
        );
      }

      // Highlight king in check
      if (isCheck) {
        const board = game.board();

        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const piece = board[r][c];

            if (
              piece &&
              piece.type === 'k' &&
              piece.color === turn
            ) {
              const file = String.fromCharCode(97 + c);
              const rank = 8 - r;

              baseHighlights.push({
                square: `${file}${rank}`,
                type: 'check',
              });
            }
          }
        }
      }

      return baseHighlights;
    },
    [game, lastMove, isCheck, turn]
  );

  // ----------------------------------------
  // Select square
  // ----------------------------------------

  // ----------------------------------------
// Select square
// ----------------------------------------

const selectSquare = useCallback(
  (square: string) => {
    const piece = game.get(square as any);

    // Clicking the selected piece again = deselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalMoves([]);
      setHighlights(buildBaseHighlights());
      return;
    }

    // If a piece is selected and this square is a
    // legal destination, make the move.
    if (selectedSquare && legalMoves.includes(square)) {
      makeMove(selectedSquare, square);
      return;
    }

    // Selecting one of the player's own pieces
    if (piece && piece.color === turn) {
      const moves = game.moves({
        square: square as any,
        verbose: true,
      });

      const destinations = moves.map(
        (move: any) => move.to
      );

      setSelectedSquare(square);
      setLegalMoves(destinations);

      // Start with last-move/check highlights
      const newHighlights: SquareHighlight[] = [
        ...buildBaseHighlights(),
        {
          square,
          type: 'selected',
        },
      ];

      // Add legal move/capture highlights
      destinations.forEach((destination: string) => {
        const targetPiece = game.get(destination as any);

        newHighlights.push({
          square: destination,
          type: targetPiece ? 'capture' : 'legal',
        });
      });

      setHighlights(newHighlights);
      return;
    }

    // Clicking an empty square or opponent's piece
    // without a valid move
    setSelectedSquare(null);
    setLegalMoves([]);
    setHighlights(buildBaseHighlights());
  },
  [
    game,
    selectedSquare,
    legalMoves,
    turn,
    buildBaseHighlights,
    
  ]
);

  // ----------------------------------------
  // Make move
  // ----------------------------------------

 // ----------------------------------------
// Make move
// ----------------------------------------

const makeMove = useCallback(
  (
    from: string,
    to: string,
    promotion?: string
  ): boolean => {
    try {
      const moveResult = game.move({
        from: from as any,
        to: to as any,
        promotion: promotion as any,
      });

      if (!moveResult) {
        return false;
      }

      // The move that was JUST played.
      // These two squares become the previous-move highlight.
      const newHighlights: SquareHighlight[] = [
        {
          square: moveResult.from,
          type: 'last-move',
        },
        {
          square: moveResult.to,
          type: 'last-move',
        },
      ];

      // Clear selection/legal move dots
      setSelectedSquare(null);
      setLegalMoves([]);

      // If the move puts the opponent in check,
      // also highlight their king.
      const nextTurn = game.turn() as 'w' | 'b';
      const nowCheck = game.inCheck();

      if (nowCheck) {
        const board = game.board();

        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const piece = board[r][c];

            if (
              piece &&
              piece.type === 'k' &&
              piece.color === nextTurn
            ) {
              const file = String.fromCharCode(97 + c);
              const rank = 8 - r;

              newHighlights.push({
                square: `${file}${rank}`,
                type: 'check',
              });
            }
          }
        }
      }

      // Apply the highlight for the move that just happened.
      setHighlights(newHighlights);

      // Force board/game state update
      update();

      return true;
    } catch {
      return false;
    }
  },
  [game, update]
);

  // ----------------------------------------
  // Undo
  // ----------------------------------------

  const undo = useCallback(() => {
    game.undo();

    setSelectedSquare(null);
    setLegalMoves([]);

    // Find the move that remains after undo
    const historyAfterUndo = game.history({
      verbose: true,
    }) as ChessMove[];

    const previousMove =
      historyAfterUndo.length > 0
        ? {
            from:
              historyAfterUndo[
                historyAfterUndo.length - 1
              ].from,
            to:
              historyAfterUndo[
                historyAfterUndo.length - 1
              ].to,
          }
        : null;

    const undoHighlights: SquareHighlight[] = [];

    if (previousMove) {
      undoHighlights.push(
        {
          square: previousMove.from,
          type: 'last-move',
        },
        {
          square: previousMove.to,
          type: 'last-move',
        }
      );
    }

    setHighlights(undoHighlights);

    update();
  }, [game, update]);

  // ----------------------------------------
  // Reset
  // ----------------------------------------

  const reset = useCallback(() => {
    gameRef.current = new Chess();

    setSelectedSquare(null);
    setLegalMoves([]);
    setHighlights([]);

    update();
  }, [update]);

  // ----------------------------------------
  // Return hook API
  // ----------------------------------------

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