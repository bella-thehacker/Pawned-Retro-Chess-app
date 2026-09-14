import { useMemo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import ChessSquare from './ChessSquare';
import ChessPiece from './ChessPiece';

import type { UseChessGameReturn } from '../../hooks/useChessGame';
import { useSettingsStore } from '../../stores/settingsStore';

interface ChessBoardProps {
  chessGame: UseChessGameReturn;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

const PROMOTION_PIECES = [
  { type: 'q' as const, label: 'QUEEN' },
  { type: 'r' as const, label: 'ROOK' },
  { type: 'b' as const, label: 'BISHOP' },
  { type: 'n' as const, label: 'KNIGHT' },
];

export default function ChessBoard({ chessGame }: ChessBoardProps) {
  const {
    selectedSquare,
    legalMoves,
    highlights,
    getPieceAt,
    selectSquare,
    makeMove,
    isCheckmate,
  } = chessGame;

  const coordinateDisplay = useSettingsStore((s) => s.coordinateDisplay);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  const [promotionMove, setPromotionMove] = useState<{
    from: string;
    to: string;
    color: 'w' | 'b';
  } | null>(null);

  const handleSquareClick = useCallback(
    (square: string) => {
      if (isCheckmate) return;

      // If a piece is already selected and the clicked square is a legal move,
      // check whether this is a pawn promotion.
      if (selectedSquare && legalMoves.includes(square)) {
        const movingPiece = getPieceAt(selectedSquare);
        const destinationRank = square[1];

        const isPromotion =
          movingPiece?.type === 'p' &&
          (destinationRank === '1' || destinationRank === '8');

        if (isPromotion) {
          setPromotionMove({
            from: selectedSquare,
            to: square,
            color: movingPiece.color,
          });
          return;
        }
      }

      selectSquare(square);
    },
    [
      selectedSquare,
      legalMoves,
      getPieceAt,
      selectSquare,
      isCheckmate,
    ]
  );

  const handlePromotion = useCallback(
    (piece: 'q' | 'r' | 'b' | 'n') => {
      if (!promotionMove) return;

      const success = makeMove(
        promotionMove.from,
        promotionMove.to,
        piece
      );

      if (success) {
        setPromotionMove(null);
      }
    },
    [promotionMove, makeMove]
  );

  const cancelPromotion = useCallback(() => {
    setPromotionMove(null);
  }, []);

  // Build board squares
  const squares = useMemo(() => {
    const result: {
      square: string;
      isLight: boolean;
      rank: number;
      file: number;
    }[] = [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const file = FILES[c];
        const rank = RANKS[r];
        const square = `${file}${rank}`;
        const isLight = (r + c) % 2 === 0;

        result.push({ square, isLight, rank: r, file: c });
      }
    }

    return result;
  }, []);

  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative"
    >
      {/* Board container with wood frame */}
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          boxShadow: `
            0 0 0 3px #5A3A1F,
            0 0 0 6px #3A2010,
            0 8px 32px rgba(42, 27, 21, 0.4),
            inset 0 0 60px rgba(0, 0, 0, 0.15)
          `,
        }}
      >
        {/* Board background with warm vignette */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 40%, rgba(42, 27, 21, 0.15) 100%)',
          }}
        />

        {/* The 8x8 grid */}
        <div className="grid grid-cols-8 w-[min(85vw,85vh,520px)] h-[min(85vw,85vh,520px)]">
          {squares.map(({ square, isLight }) => {
            const piece = getPieceAt(square);
            const highlight = highlights.find(
              (h) => h.square === square
            );
            const isSelected = selectedSquare === square;

            return (
              <ChessSquare
                key={square}
                square={square}
                isLight={isLight}
                isSelected={isSelected}
                highlight={highlight}
                hasPiece={!!piece}
                onClick={() => handleSquareClick(square)}
              >
                {piece && (
                  <ChessPiece
                    piece={piece.type}
                    color={piece.color}
                    isSelected={isSelected}
                  />
                )}
              </ChessSquare>
            );
          })}
        </div>
      </div>

      {/* Coordinate labels */}
      {coordinateDisplay && (
        <>
          {/* File labels (a-h) - bottom */}
          <div className="flex justify-around w-[min(85vw,85vh,520px)] mt-1 px-0">
            {FILES.map((file) => (
              <span
                key={file}
                className="font-mono text-[10px] text-[#6B5B4A] w-full text-center select-none"
              >
                {file}
              </span>
            ))}
          </div>

          {/* Rank labels (1-8) - left side */}
          <div className="absolute top-0 left-0 flex flex-col justify-around h-[min(85vw,85vh,520px)] -ml-4 py-0">
            {RANKS.map((rank) => (
              <span
                key={rank}
                className="font-mono text-[10px] text-[#6B5B4A] h-full flex items-center select-none"
              >
                {rank}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Promotion chooser */}
      <AnimatePresence>
        {promotionMove && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[12000] flex items-center justify-center bg-[rgba(42,27,21,0.7)] backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="w-full max-w-[360px] rounded-[16px] border-2 border-[#8B6B4A] bg-[#E7DFC9] p-6 text-center shadow-2xl"
            >
              <div className="mb-4">
                <h2 className="font-arcade text-[13px] tracking-wider text-[#2A1B15]">
                  CHOOSE YOUR PROMOTION
                </h2>

                <p className="mt-2 font-mono text-[10px] text-[#6B5B4A]">
                  Your pawn made it this far. Don't waste the promotion.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {PROMOTION_PIECES.map((piece) => (
                  <button
                    key={piece.type}
                    type="button"
                    onClick={() => handlePromotion(piece.type)}
                    className="group rounded-[10px] border-2 border-[#8B6B4A] bg-[#E7DFC9] px-4 py-4 transition-all hover:border-[#C8A04A] hover:bg-[#C8A04A]/10"
                  >
                    <div className="flex justify-center mb-2">
                      <ChessPiece
                        piece={piece.type}
                        color={promotionMove.color}
                      />
                    </div>

                    <span className="font-mono text-[10px] tracking-wider text-[#6B5B4A] group-hover:text-[#2A1B15]">
                      {piece.label}
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={cancelPromotion}
                className="mt-4 font-mono text-[10px] text-[#6B5B4A] transition-colors hover:text-[#8C3A3A]"
              >
                CANCEL
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}