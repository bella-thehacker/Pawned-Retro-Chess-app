import type { MatchStatistics } from '../../hooks/useMatchStats';
import { Clock, Swords, Trophy, Zap, Hourglass } from 'lucide-react';

interface MatchStatsProps {
  stats: MatchStatistics;
  winner: 'w' | 'b' | null;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return `${m}m ${s.toString().padStart(2, '0')}s`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h}h ${rm.toString().padStart(2, '0')}m`;
}

function formatTime(seconds: number): string {
  if (seconds === Infinity) return '—';
  if (seconds < 1) return '<1s';
  return `${Math.round(seconds)}s`;
}

export default function MatchStats({ stats, winner }: MatchStatsProps) {
  const resultText = winner === 'w' ? 'White Victory' : winner === 'b' ? 'Black Victory' : 'Draw';
  const resultColor = winner === 'w' ? '#C8A04A' : winner === 'b' ? '#8C3A3A' : '#8B6B4A';

  return (
    <div className="space-y-4">
      {/* Result header */}
      <div className="flex items-center gap-3 justify-center pb-3 border-b border-[#8B6B4A]/20">
        <Trophy size={20} style={{ color: resultColor }} />
        <span className="font-arcade text-[12px] tracking-wider" style={{ color: resultColor }}>
          {resultText}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Opening */}
        <div className="col-span-2 flex items-center gap-2 p-2 rounded bg-[rgba(200,160,74,0.05)] border border-[#C8A04A]/10">
          <Swords size={14} className="text-[#C8A04A] flex-shrink-0" />
          <div className="min-w-0">
            <span className="font-mono text-[9px] text-[#6B5B4A] tracking-wider uppercase block">Opening</span>
            <span className="font-mono text-[11px] text-[#2A1B15] font-semibold truncate block">
              {stats.openingPlayed || 'Unknown Opening'}
            </span>
          </div>
        </div>

        {/* Total Moves */}
        <div className="flex items-center gap-2 p-2 rounded bg-[rgba(42,27,21,0.03)] border border-[#8B6B4A]/10">
          <Zap size={14} className="text-[#C8A04A] flex-shrink-0" />
          <div>
            <span className="font-mono text-[9px] text-[#6B5B4A] tracking-wider uppercase block">Moves</span>
            <span className="font-mono text-[13px] text-[#2A1B15] font-semibold">{stats.totalMoves}</span>
          </div>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2 p-2 rounded bg-[rgba(42,27,21,0.03)] border border-[#8B6B4A]/10">
          <Clock size={14} className="text-[#C8A04A] flex-shrink-0" />
          <div>
            <span className="font-mono text-[9px] text-[#6B5B4A] tracking-wider uppercase block">Duration</span>
            <span className="font-mono text-[13px] text-[#2A1B15] font-semibold">
              {formatDuration(stats.gameDuration)}
            </span>
          </div>
        </div>

        {/* Pieces Captured */}
        <div className="flex items-center gap-2 p-2 rounded bg-[rgba(42,27,21,0.03)] border border-[#8B6B4A]/10">
          <Swords size={14} className="text-[#8C3A3A] flex-shrink-0" />
          <div>
            <span className="font-mono text-[9px] text-[#6B5B4A] tracking-wider uppercase block">Captures</span>
            <span className="font-mono text-[13px] text-[#2A1B15] font-semibold">
              {stats.piecesCaptured.white + stats.piecesCaptured.black}
            </span>
          </div>
        </div>

        {/* Material */}
        <div className="flex items-center gap-2 p-2 rounded bg-[rgba(42,27,21,0.03)] border border-[#8B6B4A]/10">
          <Hourglass size={14} className="text-[#6E7B4F] flex-shrink-0" />
          <div>
            <span className="font-mono text-[9px] text-[#6B5B4A] tracking-wider uppercase block">Material</span>
            <span className="font-mono text-[11px] text-[#2A1B15] font-semibold">
              W:{stats.whiteMaterial} B:{stats.blackMaterial}
            </span>
          </div>
        </div>

        {/* Fastest Move */}
        <div className="flex items-center gap-2 p-2 rounded bg-[rgba(42,27,21,0.03)] border border-[#8B6B4A]/10">
          <Zap size={14} className="text-[#6E7B4F] flex-shrink-0" />
          <div>
            <span className="font-mono text-[9px] text-[#6B5B4A] tracking-wider uppercase block">Fastest</span>
            <span className="font-mono text-[13px] text-[#2A1B15] font-semibold">
              {formatTime(stats.fastestMove)}
            </span>
          </div>
        </div>

        {/* Longest Think */}
        <div className="flex items-center gap-2 p-2 rounded bg-[rgba(42,27,21,0.03)] border border-[#8B6B4A]/10">
          <Hourglass size={14} className="text-[#C66A35] flex-shrink-0" />
          <div>
            <span className="font-mono text-[9px] text-[#6B5B4A] tracking-wider uppercase block">Longest Think</span>
            <span className="font-mono text-[13px] text-[#2A1B15] font-semibold">
              {formatTime(stats.longestThink)}
            </span>
          </div>
        </div>
      </div>

      {/* Result reason */}
      {stats.resultReason && (
        <div className="text-center pt-2 border-t border-[#8B6B4A]/10">
          <span className="font-mono text-[10px] text-[#6B5B4A] tracking-wider uppercase">
            {stats.resultReason === 'checkmate' && 'By Checkmate'}
            {stats.resultReason === 'stalemate' && 'Stalemate'}
            {stats.resultReason === 'insufficient-material' && 'Insufficient Material'}
            {stats.resultReason === 'threefold-repetition' && 'Threefold Repetition'}
            {stats.resultReason === 'fifty-move-rule' && 'Fifty-Move Rule'}
            {stats.resultReason === 'timeout' && 'Timeout'}
            {stats.resultReason === 'resignation' && 'By Resignation'}
            {stats.resultReason === 'agreement' && 'Draw by Agreement'}
          </span>
        </div>
      )}
    </div>
  );
}
