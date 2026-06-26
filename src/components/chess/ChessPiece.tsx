import { cn } from '../../lib/utils';
import { useSettingsStore } from '../../stores/settingsStore';

interface ChessPieceProps {
  piece: string; // 'p', 'n', 'b', 'r', 'q', 'k'
  color: 'w' | 'b';
  isSelected?: boolean;
  isCaptured?: boolean;
  onAnimationEnd?: () => void;
}

const PIECE_IMAGES: Record<string, string> = {
  wp: '/assets/chess-pawn-w.png',
  wn: '/assets/chess-knight-w.png',
  wb: '/assets/chess-bishop-w.png',
  wr: '/assets/chess-rook-w.png',
  wq: '/assets/chess-queen-w.png',
  wk: '/assets/chess-king-w.png',
  bp: '/assets/chess-pawn-b.png',
  bn: '/assets/chess-knight-b.png',
  bb: '/assets/chess-bishop-b.png',
  br: '/assets/chess-rook-b.png',
  bq: '/assets/chess-queen-b.png',
  bk: '/assets/chess-king-b.png',
};

export default function ChessPiece({
  piece,
  color,
  isSelected = false,
  isCaptured = false,
}: ChessPieceProps) {
  const pieceTheme = useSettingsStore((s) => s.pieceTheme);
  const largePieces = useSettingsStore((s) => s.largePieces);

  const key = `${color}${piece}`;
  const src = PIECE_IMAGES[key];

  // CSS filters based on piece theme
  const getThemeFilter = () => {
    switch (pieceTheme) {
      case 'silhouette':
        return color === 'w'
          ? 'brightness(1.1) contrast(1.2) saturate(0)'
          : 'brightness(0.3) contrast(1.5) saturate(0)';
      case 'classic':
        return color === 'w'
          ? 'brightness(1.15) contrast(0.95) sepia(0.15)'
          : 'brightness(0.5) contrast(1.1) sepia(0.3)';
      case 'retro':
      default:
        // Default retro wood - minimal filter
        return color === 'w'
          ? 'brightness(1.05) sepia(0.1)'
          : 'brightness(0.85) contrast(1.05)';
    }
  };

  return (
    <div
      className={cn(
        'relative w-full h-full flex items-center justify-center',
        'transition-all duration-200 ease-out',
        isSelected && 'scale-105 z-10',
        isCaptured && 'opacity-0 scale-75 translate-y-2'
      )}
      style={{
        filter: getThemeFilter(),
        padding: largePieces ? '4%' : '10%',
      }}
    >
      <img
        src={src}
        alt={`${color === 'w' ? 'White' : 'Black'} ${piece}`}
        className={cn(
          'w-full h-full object-contain pointer-events-none',
          'drop-shadow-sm',
          isSelected && 'drop-shadow-[0_0_8px_rgba(200,160,74,0.6)]'
        )}
        draggable={false}
      />

      {/* Selection glow overlay */}
      {isSelected && (
        <div
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(200, 160, 74, 0.2) 0%, transparent 60%)',
            animation: 'glowPulse 1.5s ease-in-out infinite',
          }}
        />
      )}
    </div>
  );
}
