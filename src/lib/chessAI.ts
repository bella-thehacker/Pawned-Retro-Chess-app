import { Chess } from 'chess.js';
import type { Square, Move } from 'chess.js';

// Piece values
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-square tables (from white's perspective, flipped for black)
// Values encourage good piece placement
const PST: Record<string, number[]> = {
  p: [
    0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5,  5, 10, 25, 25, 10,  5,  5,
    0,  0,  0, 20, 20,  0,  0,  0,
    5, -5,-10,  0,  0,-10, -5,  5,
    5, 10, 10,-20,-20, 10, 10,  5,
    0,  0,  0,  0,  0,  0,  0,  0,
  ],
  n: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
  ],
  b: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
  ],
  r: [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0,
  ],
  q: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
    -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20,
  ],
  k: [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
    20, 20,  0,  0,  0,  0, 20, 20,
    20, 30, 10,  0,  0, 10, 30, 20,
  ],
  k_endgame: [
    -50,-40,-30,-20,-20,-30,-40,-50,
    -30,-20,-10,  0,  0,-10,-20,-30,
    -30,-10, 20, 30, 30, 20,-10,-30,
    -30,-10, 30, 40, 40, 30,-10,-30,
    -30,-10, 30, 40, 40, 30,-10,-30,
    -30,-10, 20, 30, 30, 20,-10,-30,
    -30,-30,  0,  0,  0,  0,-30,-30,
    -50,-30,-30,-30,-30,-30,-30,-50,
  ],
};

// Opening phase: first 10 moves
function isOpening(game: Chess): boolean {
  return game.moveNumber() <= 10;
}

// Endgame: both sides have queen <=1 and no rooks, or total material <= 20
function isEndgame(game: Chess): boolean {
  const board = game.board();
  let queens = 0;
  let rooks = 0;
  let minorPieces = 0;
  for (const row of board) {
    for (const sq of row) {
      if (!sq) continue;
      if (sq.type === 'q') queens++;
      if (sq.type === 'r') rooks++;
      if (sq.type === 'n' || sq.type === 'b') minorPieces++;
    }
  }
  return (queens <= 2 && rooks === 0) || (queens <= 2 && minorPieces <= 2);
}

function getKingPST(endgame: boolean): number[] {
  return endgame ? PST.k_endgame : PST.k;
}

function evaluateBoard(game: Chess, personality: AIPersonality): number {
  const board = game.board();
  const endgame = isEndgame(game);
  const kingPST = getKingPST(endgame);
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = board[r][c];
      if (!sq) continue;
      const idx = sq.color === 'w' ? (7 - r) * 8 + c : r * 8 + c;
      let pieceValue = PIECE_VALUES[sq.type];
      let tableValue = 0;
      switch (sq.type) {
        case 'p': tableValue = PST.p[idx]; break;
        case 'n': tableValue = PST.n[idx]; break;
        case 'b': tableValue = PST.b[idx]; break;
        case 'r': tableValue = PST.r[idx]; break;
        case 'q': tableValue = PST.q[idx]; break;
        case 'k': tableValue = kingPST[idx]; break;
      }
      const sign = sq.color === 'w' ? 1 : -1;
      score += sign * (pieceValue + tableValue);
    }
  }

  // Mobility
  const mobilityWeight = personality.mobilityWeight || 5;
  const turnMobility = game.moves().length * mobilityWeight;
  score += game.turn() === 'w' ? turnMobility : -turnMobility;

  // Center control
  const centerSquares = ['d4', 'd5', 'e4', 'e5'];
  const extendedCenter = ['c3', 'c4', 'c5', 'c6', 'd3', 'd6', 'e3', 'e6', 'f3', 'f4', 'f5', 'f6'];
  let centerControl = 0;
  for (const sq of centerSquares) {
    const piece = game.get(sq as Square);
    if (piece) {
      centerControl += piece.color === 'w' ? 30 : -30;
    }
  }
  for (const sq of extendedCenter) {
    const piece = game.get(sq as Square);
    if (piece) {
      centerControl += piece.color === 'w' ? 10 : -10;
    }
  }
  score += (personality.centerControlWeight || 1) * centerControl;

  // King safety (penalty for exposed king)
  if (!endgame) {
    const kingSafetyWeight = personality.kingSafetyWeight || 1;
    // Check if king has castled by checking position
    const whiteKing = findKing(game, 'w');
    const blackKing = findKing(game, 'b');
    if (whiteKing && (whiteKing === 'g1' || whiteKing === 'c1')) {
      score += 40 * kingSafetyWeight;
    }
    if (blackKing && (blackKing === 'g8' || blackKing === 'c8')) {
      score -= 40 * kingSafetyWeight;
    }
  }

  return game.turn() === 'w' ? score : -score;
}

function findKing(game: Chess, color: 'w' | 'b'): string | null {
  const board = game.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = board[r][c];
      if (sq && sq.type === 'k' && sq.color === color) {
        return String.fromCharCode(97 + c) + (8 - r);
      }
    }
  }
  return null;
}

// Detect forks (one piece attacks two+ valuable pieces)
function detectFork(game: Chess, move: Move): number {
  const sim = new Chess(game.fen());
  sim.move(move);
  const movedPiece = sim.get(move.to);
  if (!movedPiece) return 0;
  // Check if this piece now attacks multiple enemy pieces
  const attackers = sim.attackers(move.to as Square, movedPiece.color === 'w' ? 'b' : 'w');
  if (attackers.length >= 2) {
    return 150; // Fork bonus
  }
  return 0;
}

// Check if move gives check
function givesCheck(game: Chess, move: Move): boolean {
  const sim = new Chess(game.fen());
  sim.move(move);
  return sim.inCheck();
}

// Check if move is a capture
function isCapture(move: Move): boolean {
  return !!move.captured;
}

// Check if move promotes
function isPromotion(move: Move): boolean {
  return !!move.promotion;
}

export interface AIPersonality {
  name: string;
  description: string;
  depth: number;
  randomness: number; // 0-1, higher = more random
  captureBias: number;
  checkBias: number;
  positionalWeight: number;
  tacticalWeight: number;
  mobilityWeight: number;
  centerControlWeight: number;
  kingSafetyWeight: number;
  preferDevelopment: boolean;
  preferAggressive: boolean;
  preferDefensive: boolean;
  blunderChance: number; // 0-1
  endgameSkill: number; // 0-1
}

export const AI_PERSONALITIES: Record<number, AIPersonality> = {
  1: {
    name: 'Static Pawn',
    description: 'Barely moves. Good for learning the basics.',
    depth: 1,
    randomness: 0.9,
    captureBias: 0.1,
    checkBias: 0.05,
    positionalWeight: 0.1,
    tacticalWeight: 0,
    mobilityWeight: 0,
    centerControlWeight: 0,
    kingSafetyWeight: 0,
    preferDevelopment: false,
    preferAggressive: false,
    preferDefensive: false,
    blunderChance: 0.7,
    endgameSkill: 0.1,
  },
  2: {
    name: 'Broken Clock',
    description: 'Defensive. Recognizes immediate threats.',
    depth: 1,
    randomness: 0.7,
    captureBias: 0.3,
    checkBias: 0.1,
    positionalWeight: 0.2,
    tacticalWeight: 0.1,
    mobilityWeight: 1,
    centerControlWeight: 0.5,
    kingSafetyWeight: 0.5,
    preferDevelopment: false,
    preferAggressive: false,
    preferDefensive: true,
    blunderChance: 0.5,
    endgameSkill: 0.2,
  },
  3: {
    name: 'Street Player',
    description: 'Aggressive. Prefers attacking.',
    depth: 1,
    randomness: 0.5,
    captureBias: 0.5,
    checkBias: 0.4,
    positionalWeight: 0.3,
    tacticalWeight: 0.3,
    mobilityWeight: 2,
    centerControlWeight: 0.8,
    kingSafetyWeight: 0.3,
    preferDevelopment: false,
    preferAggressive: true,
    preferDefensive: false,
    blunderChance: 0.35,
    endgameSkill: 0.3,
  },
  4: {
    name: 'Club Player',
    description: 'Balanced opening play. Protects pieces.',
    depth: 2,
    randomness: 0.3,
    captureBias: 0.4,
    checkBias: 0.2,
    positionalWeight: 0.5,
    tacticalWeight: 0.3,
    mobilityWeight: 3,
    centerControlWeight: 1,
    kingSafetyWeight: 0.8,
    preferDevelopment: true,
    preferAggressive: false,
    preferDefensive: false,
    blunderChance: 0.25,
    endgameSkill: 0.4,
  },
  5: {
    name: 'Tactical Mind',
    description: 'Looks for forks, pins, skewers.',
    depth: 2,
    randomness: 0.2,
    captureBias: 0.6,
    checkBias: 0.5,
    positionalWeight: 0.4,
    tacticalWeight: 0.8,
    mobilityWeight: 4,
    centerControlWeight: 1,
    kingSafetyWeight: 0.6,
    preferDevelopment: true,
    preferAggressive: true,
    preferDefensive: false,
    blunderChance: 0.15,
    endgameSkill: 0.5,
  },
  6: {
    name: 'Silent Bishop',
    description: 'Positional. Controls the center.',
    depth: 2,
    randomness: 0.15,
    captureBias: 0.5,
    checkBias: 0.3,
    positionalWeight: 0.9,
    tacticalWeight: 0.4,
    mobilityWeight: 5,
    centerControlWeight: 1.5,
    kingSafetyWeight: 1,
    preferDevelopment: true,
    preferAggressive: false,
    preferDefensive: true,
    blunderChance: 0.1,
    endgameSkill: 0.6,
  },
  7: {
    name: "Master's Shadow",
    description: 'Punishes blunders. Strong opening.',
    depth: 3,
    randomness: 0.1,
    captureBias: 0.6,
    checkBias: 0.5,
    positionalWeight: 0.8,
    tacticalWeight: 0.7,
    mobilityWeight: 5,
    centerControlWeight: 1.2,
    kingSafetyWeight: 1,
    preferDevelopment: true,
    preferAggressive: false,
    preferDefensive: false,
    blunderChance: 0.06,
    endgameSkill: 0.75,
  },
  8: {
    name: 'Endgame Engine',
    description: 'Exceptional endgame technique.',
    depth: 3,
    randomness: 0.05,
    captureBias: 0.7,
    checkBias: 0.4,
    positionalWeight: 0.9,
    tacticalWeight: 0.6,
    mobilityWeight: 5,
    centerControlWeight: 1,
    kingSafetyWeight: 1.2,
    preferDevelopment: false,
    preferAggressive: false,
    preferDefensive: false,
    blunderChance: 0.03,
    endgameSkill: 0.95,
  },
  9: {
    name: 'Grandmaster Echo',
    description: 'Very accurate. Strong repertoire.',
    depth: 3,
    randomness: 0.02,
    captureBias: 0.8,
    checkBias: 0.6,
    positionalWeight: 1,
    tacticalWeight: 0.9,
    mobilityWeight: 5,
    centerControlWeight: 1.2,
    kingSafetyWeight: 1,
    preferDevelopment: true,
    preferAggressive: false,
    preferDefensive: false,
    blunderChance: 0.015,
    endgameSkill: 0.9,
  },
  10: {
    name: 'The Arbiter',
    description: 'Near-perfect play. Ultimate challenge.',
    depth: 4,
    randomness: 0,
    captureBias: 1,
    checkBias: 0.7,
    positionalWeight: 1,
    tacticalWeight: 1,
    mobilityWeight: 5,
    centerControlWeight: 1.2,
    kingSafetyWeight: 1.2,
    preferDevelopment: true,
    preferAggressive: false,
    preferDefensive: false,
    blunderChance: 0.005,
    endgameSkill: 1,
  },
};

function scoreMove(
  game: Chess,
  move: Move,
  personality: AIPersonality
): number {
  let score = 0;
  const endgame = isEndgame(game);

  // Capture bonus
  if (isCapture(move)) {
    const victimValue = PIECE_VALUES[move.captured || 'p'];
    const attackerValue = PIECE_VALUES[move.piece] || 100;
    // MVV-LVA: most valuable victim, least valuable attacker
    score += victimValue * 10 - attackerValue + personality.captureBias * 200;
  }

  // Check bonus
  if (givesCheck(game, move)) {
    score += personality.checkBias * 100;
  }

  // Promotion bonus
  if (isPromotion(move)) {
    const promoValue = move.promotion === 'q' ? 800 : move.promotion === 'r' ? 400 : 250;
    score += promoValue;
  }

  // Development bonus in opening
  if (isOpening(game) && personality.preferDevelopment) {
    if (move.piece === 'n' || move.piece === 'b') {
      const fromRank = parseInt(move.from[1]);
      if (fromRank === 2 || fromRank === 7) {
        score += 30;
      }
    }
  }

  // Castling bonus
  if (move.san === 'O-O' || move.san === 'O-O-O') {
    score += personality.kingSafetyWeight * 50;
  }

  // Tactical detection for higher levels
  if (personality.tacticalWeight > 0.3) {
    score += detectFork(game, move) * personality.tacticalWeight;
  }

  // Endgame: push pawns, activate king
  if (endgame && personality.endgameSkill > 0.5) {
    if (move.piece === 'p') {
      const toRank = parseInt(move.to[1]);
      const advance = game.turn() === 'w' ? toRank : 9 - toRank;
      score += advance * 20 * personality.endgameSkill;
    }
    if (move.piece === 'k') {
      // King centralization in endgame
      const file = move.to.charCodeAt(0) - 97; // 0-7
      const rank = parseInt(move.to[1]) - 1; // 0-7
      const centerDist = Math.abs(3.5 - file) + Math.abs(3.5 - rank);
      score += (7 - centerDist) * 15 * personality.endgameSkill;
    }
  }

  // Aggressive/defensive tendencies
  if (personality.preferAggressive) {
    const toRank = parseInt(move.to[1]);
    const advance = game.turn() === 'w' ? toRank : 9 - toRank;
    score += advance * 5;
  }
  if (personality.preferDefensive) {
    const toRank = parseInt(move.to[1]);
    const retreat = game.turn() === 'w' ? 9 - toRank : toRank;
    score += retreat * 3;
  }

  return score;
}

// Minimax with alpha-beta pruning
function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  personality: AIPersonality
): number {
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game, personality);
  }

  const moves = game.moves({ verbose: true });
  
  // Order moves: captures first for better pruning
  moves.sort((a, b) => {
    const aScore = isCapture(a) ? PIECE_VALUES[a.captured || 'p'] : 0;
    const bScore = isCapture(b) ? PIECE_VALUES[b.captured || 'p'] : 0;
    return bScore - aScore;
  });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evalScore = minimax(game, depth - 1, alpha, beta, false, personality);
      game.undo();
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evalScore = minimax(game, depth - 1, alpha, beta, true, personality);
      game.undo();
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function getAIMove(game: Chess, difficulty: number): Move | null {
  const personality = AI_PERSONALITIES[difficulty];
  if (!personality) return null;

  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;

  // Blunder chance: sometimes play a terrible move
  if (Math.random() < personality.blunderChance) {
    // Pick a random bad move
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    return randomMove;
  }

  // Score all moves
  const scoredMoves = moves.map((move) => {
    let score = scoreMove(game, move, personality);

    // For deeper search
    if (personality.depth >= 2 && Math.random() > personality.randomness) {
      const sim = new Chess(game.fen());
      sim.move(move);
      const searchScore = minimax(
        sim,
        personality.depth - 1,
        -Infinity,
        Infinity,
        sim.turn() === 'w',
        personality
      );
      score += searchScore;
    }

    // Add randomness for lower levels
    score += (Math.random() - 0.5) * personality.randomness * 500;

    return { move, score };
  });

  // Sort by score
  scoredMoves.sort((a, b) => b.score - a.score);

  // Top levels always pick best; lower levels might pick from top N
  const topN = personality.depth >= 3 ? 1 : personality.depth >= 2 ? 2 : Math.max(1, Math.floor(moves.length * (1 - personality.randomness)));
  const bestIndex = Math.floor(Math.random() * Math.min(topN, scoredMoves.length));
  
  return scoredMoves[bestIndex]?.move || scoredMoves[0]?.move || null;
}

export function getDifficultyName(level: number): string {
  return AI_PERSONALITIES[level]?.name || 'Unknown';
}

export function getDifficultyDescription(level: number): string {
  return AI_PERSONALITIES[level]?.description || '';
}
