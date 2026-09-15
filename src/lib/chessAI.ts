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

function evaluateMoveSafety(
  game: Chess,
  move: Move,
  personality: AIPersonality
): number {
  const sim = new Chess(game.fen());

  try {
    sim.move(move);
  } catch {
    return -1000;
  }

  const movedPiece = sim.get(move.to as Square);

  if (!movedPiece) {
    return 0;
  }

  const opponentColor = movedPiece.color === 'w' ? 'b' : 'w';

  const attackers = sim.attackers(
    move.to as Square,
    opponentColor
  );

  const defenders = sim.attackers(
    move.to as Square,
    movedPiece.color
  );

  if (attackers.length === 0) {
    return 0;
  }

  const pieceValue = PIECE_VALUES[movedPiece.type] || 0;

  // If the piece is attacked but defended, it's not necessarily
  // a blunder. Only penalize strongly when the exchange is bad.
  if (defenders.length > 0) {
    return -Math.min(
      pieceValue * 0.15,
      attackers.length * 20
    );
  }

  // Completely hanging pieces should be heavily punished.
  return -pieceValue * (0.65 + personality.tacticalWeight * 0.35);
}

function evaluateMoveThreat(
  game: Chess,
  move: Move,
  personality: AIPersonality
): number {
  const sim = new Chess(game.fen());

  try {
    sim.move(move);
  } catch {
    return 0;
  }

  const enemyColor = sim.turn();

  let score = 0;

  // A move that gives check is a direct forcing threat.
  if (sim.inCheck()) {
    score += 180 * personality.checkBias;
  }

  // Look at what the moved piece attacks.
  const movedPiece = sim.get(move.to as Square);

  if (movedPiece) {
    const attacks = sim.attackers(
      move.to as Square,
      enemyColor
    );

    score += attacks.length * 20;
  }

  // Reward attacking valuable enemy pieces from the
  // resulting position.
  const board = sim.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];

      if (!piece || piece.color !== enemyColor) {
        continue;
      }

      const square =
        `${String.fromCharCode(97 + c)}${8 - r}` as Square;

      const attackers = sim.attackers(
        square,
        movedPiece?.color === 'w' ? 'w' : 'b'
      );

      if (attackers.length > 0) {
        const value = PIECE_VALUES[piece.type] || 0;

        score += Math.min(value * 0.08, 60);
      }
    }
  }

  return score * personality.tacticalWeight;
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
    randomness: 0.22,
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
    blunderChance: 0.12,
    endgameSkill: 0.4,
  },
  5: {
    name: 'Tactical Mind',
    description: 'Looks for forks, pins, skewers.',
    depth: 3,
    randomness: 0.14,
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
    blunderChance: 0.07,
    endgameSkill: 0.5,
  },
  6: {
    name: 'Silent Bishop',
    description: 'Positional. Controls the center.',
    depth: 3,
    randomness: 0.08,
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
    blunderChance: 0.04,
    endgameSkill: 0.6,
  },
  7: {
    name: "Master's Shadow",
    description: 'Punishes blunders. Strong opening.',
    depth: 4,
    randomness: 0.04,
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
    blunderChance: 0.015,
    endgameSkill: 0.75,
  },
  8: {
    name: 'Endgame Engine',
    description: 'Exceptional endgame technique.',
    depth: 5,
    randomness: 0.002,
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
    blunderChance: 0.008,
    endgameSkill: 0.95,
  },
  9: {
    name: 'Grandmaster Echo',
    description: 'Very accurate. Strong repertoire.',
    depth: 6,
    randomness: 0.005,
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
    blunderChance: 0.002,
    endgameSkill: 0.9,
  },
  10: {
    name: 'The Arbiter',
    description: 'Near-perfect play. Ultimate challenge.',
    depth: 7,
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
    blunderChance: 0,
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

    // Stronger AIs should actively avoid hanging pieces.
  if (personality.depth >= 2) {
    score +=
      evaluateMoveSafety(game, move, personality) *
      Math.min(1, personality.tacticalWeight + 0.4);
  }

  if (personality.tacticalWeight > 0.3) {
  score += evaluateMoveThreat(
    game,
    move,
    personality
  );
}

  return score;
}

// -----------------------------------------------------
// AI Search
// -----------------------------------------------------

class SearchTimeout extends Error {
  constructor() {
    super('AI search timed out');
    this.name = 'SearchTimeout';
  }
}

interface SearchLimits {
  maxDepth: number;
  maxTimeMs: number;
  maxNodes: number;
}

const SEARCH_LIMITS: Record<number, SearchLimits> = {
  1: { maxDepth: 1, maxTimeMs: 40, maxNodes: 2_000 },
  2: { maxDepth: 1, maxTimeMs: 60, maxNodes: 3_000 },
  3: { maxDepth: 2, maxTimeMs: 100, maxNodes: 6_000 },

  4: { maxDepth: 2, maxTimeMs: 180, maxNodes: 12_000 },
  5: { maxDepth: 3, maxTimeMs: 300, maxNodes: 22_000 },
  6: { maxDepth: 3, maxTimeMs: 450, maxNodes: 35_000 },

  7: { maxDepth: 4, maxTimeMs: 700, maxNodes: 55_000 },
  8: { maxDepth: 5, maxTimeMs: 950, maxNodes: 75_000 },
  9: { maxDepth: 6, maxTimeMs: 1_300, maxNodes: 100_000 },
  10: { maxDepth: 7, maxTimeMs: 1_800, maxNodes: 140_000 },
};

interface SearchContext {
  personality: AIPersonality;
  startTime: number;
  maxTimeMs: number;
  maxNodes: number;
  nodes: number;
}

function checkSearchLimits(context: SearchContext): void {
  context.nodes += 1;

  if (context.nodes >= context.maxNodes) {
    throw new SearchTimeout();
  }

  if (performance.now() - context.startTime >= context.maxTimeMs) {
    throw new SearchTimeout();
  }
}

/**
 * Move ordering is extremely important for alpha-beta pruning.
 *
 * We put forcing moves first:
 * 1. promotions
 * 2. captures
 * 3. checks
 * 4. everything else
 *
 * This helps the stronger levels prune large parts of the tree.
 */
function orderMoves(moves: Move[]): Move[] {
  return [...moves].sort((a, b) => {
    const score = (move: Move) => {
      let value = 0;

      if (move.promotion) {
        value += 10_000;
      }

      if (move.captured) {
        value += 1_000 + (PIECE_VALUES[move.captured] || 0);
      }

      if (move.san.includes('+')) {
        value += 500;
      }

      return value;
    };

    return score(b) - score(a);
  });
}

function quiescenceSearch(
  game: Chess,
  alpha: number,
  beta: number,
  context: SearchContext,
  depth: number
): number {
  checkSearchLimits(context);

  if (game.isCheckmate()) {
    return -1000000;
  }

  if (game.isDraw()) {
    return 0;
  }

  const standPat = evaluateBoard(game, context.personality);

  if (depth <= 0) {
    return standPat;
  }

  // If the current position is already good enough,
  // don't waste time looking for more forcing moves.
  if (standPat >= beta) {
    return standPat;
  }

  if (standPat > alpha) {
    alpha = standPat;
  }

  let forcingMoves = (
    game.moves({ verbose: true }) as Move[]
  ).filter(
    (move) =>
      !!move.captured ||
      !!move.promotion ||
      move.san.includes('+')
  );

  forcingMoves = orderMoves(forcingMoves);

  for (const move of forcingMoves) {
    checkSearchLimits(context);

    game.move(move);

    let score: number;

    try {
      score = -quiescenceSearch(
        game,
        -beta,
        -alpha,
        context,
        depth - 1
      );
    } finally {
      game.undo();
    }

    if (score >= beta) {
      return score;
    }

    if (score > alpha) {
      alpha = score;
    }
  }

  return alpha;
}

/**
 * Negamax search.
 *
 * evaluateBoard() already returns the evaluation from the
 * current side-to-move perspective, so negamax lets us use
 * one clean search function and simply flip the score after
 * every move.
 */
function negamax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  context: SearchContext
): number {
  checkSearchLimits(context);

  if (game.isCheckmate()) {
    return -1000000;
  }

  if (game.isDraw()) {
    return 0;
  }

  if (depth === 0) {
    return quiescenceSearch(
      game,
      alpha,
      beta,
      context,
      3
    );
  }
 if (game.isGameOver()) {
  return evaluateBoard(game, context.personality);
}
  const moves = orderMoves(
    game.moves({ verbose: true }) as Move[]
  );

  if (moves.length === 0) {
    return evaluateBoard(game, context.personality);
  }

  let bestScore = -Infinity;

  for (const move of moves) {
    checkSearchLimits(context);

    game.move(move);

    let score: number;

    try {
      score = -negamax(
        game,
        depth - 1,
        -beta,
        -alpha,
        context
      );
    } finally {
      game.undo();
    }

    bestScore = Math.max(bestScore, score);
    alpha = Math.max(alpha, score);

    if (alpha >= beta) {
      break;
    }
  }

  return bestScore;
}

/**
 * Search one complete depth.
 *
 * The important part is that this function either completes
 * the requested depth or throws SearchTimeout. We never use
 * an incomplete search result as the final answer.
 */
function searchRoot(
  game: Chess,
  moves: Move[],
  depth: number,
  context: SearchContext
): { move: Move; score: number } {
  let bestMove = moves[0];
  let bestScore = -Infinity;

  const orderedMoves = orderMoves(moves);

  for (const move of orderedMoves) {
    checkSearchLimits(context);

    game.move(move);

    let score: number;

    try {
      // Negate because the child position belongs to the
      // opponent.
      score = -negamax(
        game,
        depth - 1,
        -Infinity,
        Infinity,
        context
      );
    } finally {
      game.undo();
    }

    // Add the personality's move preferences at the root.
    score += scoreMove(game, move, context.personality);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return {
    move: bestMove,
    score: bestScore,
  };
}

// -----------------------------------------------------
// Main AI move selector
// -----------------------------------------------------

export function getAIMove(
  game: Chess,
  difficulty: number
): Move | null {
  const personality = AI_PERSONALITIES[difficulty];

  if (!personality) {
    return null;
  }

  const moves = game.moves({ verbose: true }) as Move[];

  if (moves.length === 0) {
    return null;
  }

  // ---------------------------------------------------
  // Low-level intentional mistakes
  // ---------------------------------------------------

const shouldMakeMistake =
  Math.random() < personality.blunderChance;

if (shouldMakeMistake) {
  const scoredMoves = moves.map((move) => ({
    move,
    score:
      scoreMove(game, move, personality) +
      (Math.random() - 0.5) * 150,
  }));

  scoredMoves.sort((a, b) => b.score - a.score);

  // Choose from the weaker half instead of a completely
  // random legal move. This creates believable mistakes.
  const mistakePool = scoredMoves.slice(
    Math.floor(scoredMoves.length / 2)
  );

  return (
    mistakePool[
      Math.floor(Math.random() * mistakePool.length)
    ]?.move ?? moves[moves.length - 1]
  );
}

  // ---------------------------------------------------
  // Difficulty-specific search limits
  // ---------------------------------------------------

  const limits =
    SEARCH_LIMITS[difficulty] || SEARCH_LIMITS[5];

  // Levels 1-3 stay lightweight and personality-driven.
  // This preserves the "beginner AI" feeling.
  if (difficulty <= 3) {
    const scoredMoves = moves.map((move) => {
      let score = scoreMove(game, move, personality);

      score +=
        (Math.random() - 0.5) *
        personality.randomness *
        500;

      return { move, score };
    });

    scoredMoves.sort((a, b) => b.score - a.score);

    const topN =
      difficulty === 1
        ? Math.max(3, Math.floor(moves.length * 0.7))
        : difficulty === 2
        ? Math.max(2, Math.floor(moves.length * 0.45))
        : Math.max(2, Math.floor(moves.length * 0.3));

    const choices = scoredMoves.slice(
      0,
      Math.min(topN, scoredMoves.length)
    );

    return choices[
      Math.floor(Math.random() * choices.length)
    ]?.move ?? moves[0];
  }

  // ---------------------------------------------------
  // Stronger levels: iterative deepening
  // ---------------------------------------------------

  const context: SearchContext = {
    personality,
    startTime: performance.now(),
    maxTimeMs: limits.maxTimeMs,
    maxNodes: limits.maxNodes,
    nodes: 0,
  };

  let bestCompletedMove: Move | null = null;
  let bestCompletedScore = -Infinity;

  // Start with a sensible root ordering before searching.
  const rootMoves = orderMoves(moves);

  for (
    let depth = 1;
    depth <= limits.maxDepth;
    depth++
  ) {
    try {
      const result = searchRoot(
        game,
        rootMoves,
        depth,
        context
      );

      bestCompletedMove = result.move;
      bestCompletedScore = result.score;

      // Small amount of personality-based noise for
      // levels that aren't supposed to be perfect.
      if (personality.randomness > 0) {
        const noise =
          (Math.random() - 0.5) *
          personality.randomness *
          100;

        bestCompletedScore += noise;
      }
    } catch (error) {
      if (error instanceof SearchTimeout) {
        break;
      }

      throw error;
    }
  }

  // ---------------------------------------------------
  // Guaranteed fallback
  // ---------------------------------------------------

  if (bestCompletedMove) {
    return bestCompletedMove;
  }

  // If even the first search could not complete,
  // use the personality's immediate move scoring.
  const fallbackMoves = moves.map((move) => ({
    move,
    score:
      scoreMove(game, move, personality) +
      (Math.random() - 0.5) *
        personality.randomness *
        300,
  }));

  fallbackMoves.sort((a, b) => b.score - a.score);

  return fallbackMoves[0]?.move ?? moves[0];
}

export function getDifficultyName(
  level: number
): string {
  return AI_PERSONALITIES[level]?.name || 'Unknown';
}

export function getDifficultyDescription(
  level: number
): string {
  return AI_PERSONALITIES[level]?.description || '';
}