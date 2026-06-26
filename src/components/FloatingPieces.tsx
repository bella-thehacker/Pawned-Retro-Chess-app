import { motion } from 'framer-motion';
import { useMemo } from 'react';

const PIECE_IMAGES = [
  '/assets/chess-king-w.png',
  '/assets/chess-queen-w.png',
  '/assets/chess-rook-w.png',
  '/assets/chess-bishop-w.png',
  '/assets/chess-knight-w.png',
  '/assets/chess-pawn-w.png',
];

const PIECE_COUNT = 8;

interface PieceConfig {
  id: number;
  image: string;
  size: number;
  x: number;
  y: number;
  yDuration: number;
  rotateDuration: number;
  xDuration: number;
  opacityDuration: number;
  yOffset: number;
  rotateOffset: number;
  xOffset: number;
}

function FloatingPiece({ config }: { config: PieceConfig }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{
        left: `${config.x}%`,
        top: `${config.y}%`,
        width: config.size,
        opacity: 0.06,
      }}
      animate={{
        y: [0, -config.yOffset, 0],
        rotate: [-5, config.rotateOffset, -5],
        x: [0, config.xOffset, 0],
        opacity: [0.03, 0.08, 0.03],
      }}
      transition={{
        y: { duration: config.yDuration, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration: config.rotateDuration, repeat: Infinity, ease: 'easeInOut' },
        x: { duration: config.xDuration, repeat: Infinity, ease: 'easeInOut' },
        opacity: { duration: config.opacityDuration, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      <img
        src={config.image}
        alt=""
        className="w-full h-auto"
        draggable={false}
        style={{ filter: 'sepia(0.3)' }}
      />
    </motion.div>
  );
}

export default function FloatingPieces() {
  const pieces = useMemo<PieceConfig[]>(() => {
    return Array.from({ length: PIECE_COUNT }, (_, i) => ({
      id: i,
      image: PIECE_IMAGES[i % PIECE_IMAGES.length],
      size: 60 + Math.random() * 60,
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      yDuration: 12 + Math.random() * 8,
      rotateDuration: 14 + Math.random() * 6,
      xDuration: 15 + Math.random() * 10,
      opacityDuration: 8 + Math.random() * 7,
      yOffset: 20 + Math.random() * 20,
      rotateOffset: 3 + Math.random() * 4,
      xOffset: (Math.random() - 0.5) * 80,
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {pieces.map((config) => (
        <FloatingPiece key={config.id} config={config} />
      ))}
    </div>
  );
}
