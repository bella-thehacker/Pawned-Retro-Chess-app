import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import ChessSquare from './ChessSquare';
import ChessPiece from './ChessPiece';
import type { UseChessGameReturn } from '../../hooks/useChessGame';
import { useSettingsStore } from '../../stores/settingsStore';

interface ChessBoardProps {
  chessGame: UseChessGameReturn;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export default function ChessBoard({ chessGame }: ChessBoardProps) {
  const {
    selectedSquare,
    highlights,
    getPieceAt,
    selectSquare,
    isCheckmate,
  } = chessGame;

  const coordinateDisplay = useSettingsStore((s) => s.coordinateDisplay);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  const handleSquareClick = useCallback(
    (square: string) => {
      if (isCheckmate) return;
      selectSquare(square);
    },
    [selectSquare, isCheckmate]
  );

  // Build board squares
  const squares = useMemo(() => {
    const result: { square: string; isLight: boolean; rank: number; file: number }[] = [];
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
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(42, 27, 21, 0.15) 100%)',
          }}
        />

        {/* The 8x8 grid */}
        <div className="grid grid-cols-8 w-[min(85vw,85vh,520px)] h-[min(85vw,85vh,520px)]">
          {squares.map(({ square, isLight }) => {
            const piece = getPieceAt(square);
            const highlight = highlights.find((h) => h.square === square);
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
          <div
            className="absolute top-0 left-0 flex flex-col justify-around h-[min(85vw,85vh,520px)] -ml-4 py-0"
          >
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
    </motion.div>
  );
}
