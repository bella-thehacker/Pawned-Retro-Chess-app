import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/settingsStore';

interface CapturedPiecesProps {
  capturedByWhite: string[];
  capturedByBlack: string[];
}

const PIECE_IMAGES: Record<string, string> = {
  p: '/assets/chess-pawn-b.png',
  n: '/assets/chess-knight-b.png',
  b: '/assets/chess-bishop-b.png',
  r: '/assets/chess-rook-b.png',
  q: '/assets/chess-queen-b.png',
  k: '/assets/chess-king-b.png',
  P: '/assets/chess-pawn-w.png',
  N: '/assets/chess-knight-w.png',
  B: '/assets/chess-bishop-w.png',
  R: '/assets/chess-rook-w.png',
  Q: '/assets/chess-queen-w.png',
  K: '/assets/chess-king-w.png',
};

function PieceRow({ pieces, label, isOpponent }: { pieces: string[]; label: string; isOpponent: boolean }) {
  const pieceTheme = useSettingsStore((s) => s.pieceTheme);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const prevCountRef = useRef(pieces.length);
  const [newCaptureIndex, setNewCaptureIndex] = useState<number | null>(null);

  useEffect(() => {
    if (pieces.length > prevCountRef.current) {
      setNewCaptureIndex(pieces.length - 1);
      const timer = setTimeout(() => setNewCaptureIndex(null), 600);
      prevCountRef.current = pieces.length;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = pieces.length;
  }, [pieces.length]);

  const getFilter = () => {
    switch (pieceTheme) {
      case 'silhouette':
        return isOpponent
          ? 'brightness(0.3) contrast(1.5) saturate(0)'
          : 'brightness(1.1) contrast(1.2) saturate(0)';
      case 'classic':
        return isOpponent
          ? 'brightness(0.5) contrast(1.1) sepia(0.3)'
          : 'brightness(1.15) contrast(0.95) sepia(0.15)';
      default:
        return isOpponent
          ? 'brightness(0.85) contrast(1.05)'
          : 'brightness(1.05) sepia(0.1)';
    }
  };

  const pieceOrder: Record<string, number> = { q: 9, r: 5, b: 3, n: 3, p: 1, k: 0 };
  const sorted = [...pieces].sort((a, b) => (pieceOrder[b] || 0) - (pieceOrder[a] || 0));

  const pieceValues: Record<string, number> = { q: 9, r: 5, b: 3, n: 3, p: 1 };
  const totalValue = sorted.reduce((sum, p) => sum + (pieceValues[p] || 0), 0);

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[9px] text-[#6B5B4A] tracking-wider uppercase w-8 flex-shrink-0">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-0.5 flex-1 min-h-[24px]">
        {sorted.length === 0 ? (
          <span className="text-[#8B6B4A]/30 text-[9px]">&mdash;</span>
        ) : (
          sorted.map((piece, i) => {
            const key = isOpponent ? piece : piece.toUpperCase();
            const isNew = i === newCaptureIndex;
            return (
              <motion.img
                key={`${piece}-${i}`}
                src={PIECE_IMAGES[key] || PIECE_IMAGES[piece.toLowerCase()]}
                alt=""
                className="w-5 h-5 object-contain"
                style={{ filter: getFilter() }}
                draggable={false}
                initial={!reduceMotion && isNew ? { scale: 0.5, opacity: 0, x: -10 } : false}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
              />
            );
          })
        )}
      </div>
      {totalValue > 0 && (
        <span className="font-mono text-[10px] text-[#C8A04A] font-semibold">
          +{totalValue}
        </span>
      )}
    </div>
  );
}

export default function CapturedPieces({ capturedByWhite, capturedByBlack }: CapturedPiecesProps) {
  return (
    <div className="flex flex-col gap-2 p-3 border border-[#8B6B4A]/20 rounded bg-[#F5EFE3]/30">
      <PieceRow pieces={capturedByWhite} label="White" isOpponent />
      <div className="h-px bg-[#8B6B4A]/15" />
      <PieceRow pieces={capturedByBlack} label="Black" isOpponent={false} />
    </div>
  );
}
