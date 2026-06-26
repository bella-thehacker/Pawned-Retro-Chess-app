import { cn } from '../../lib/utils';
import type { SquareHighlight } from '../../types';

interface ChessSquareProps {
  square: string;
  isLight: boolean;
  isSelected: boolean;
  highlight?: SquareHighlight;
  hasPiece: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

export default function ChessSquare({
  square,
  isLight,
  isSelected,
  highlight,
  hasPiece,
  onClick,
  children,
}: ChessSquareProps) {
  const isLegalMove = highlight?.type === 'legal';
  const isCapture = highlight?.type === 'capture';
  const isLastMove = highlight?.type === 'last-move';
  const isCheck = highlight?.type === 'check';

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative w-full aspect-square flex items-center justify-center',
        'cursor-pointer select-none',
        'transition-colors duration-100',
        isLight ? 'bg-[#E8D5B5]' : 'bg-[#8B6B4A]',
        isSelected && 'ring-2 ring-inset ring-[#C8A04A]',
        isLastMove && !isSelected && 'ring-1 ring-inset ring-[#C8A04A]/50',
        'hover:brightness-110'
      )}
      data-square={square}
    >
      {/* Square texture overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: isLight
            ? 'url(/assets/board_plain_01.png)'
            : 'url(/assets/board_plain_02.png)',
          backgroundSize: 'cover',
          mixBlendMode: 'multiply',
        }}
      />

      {/* Check indicator - king in check gets red overlay */}
      {isCheck && (
        <div className="absolute inset-0 bg-[#8C3A3A]/40 animate-pulse pointer-events-none" />
      )}

      {/* Legal move indicator - small dot */}
      {isLegalMove && !hasPiece && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-[30%] h-[30%] rounded-full bg-[#C8A04A]/70"
            style={{
              boxShadow: '0 0 8px rgba(200, 160, 74, 0.5)',
            }}
          />
        </div>
      )}

      {/* Capture indicator - ring around square */}
      {isCapture && (
        <div
          className="absolute inset-0 rounded-none pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 0 4px rgba(198, 106, 53, 0.8)',
          }}
        >
          <div className="absolute inset-0 border-2 border-[#C66A35] opacity-60" />
        </div>
      )}

      {/* Selected piece glow */}
      {isSelected && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(200, 160, 74, 0.25) 0%, transparent 70%)',
          }}
        />
      )}

      {/* Piece content */}
      {children}
    </div>
  );
}
