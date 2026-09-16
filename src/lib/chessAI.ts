import { Chess } from 'chess.js';
import type { Square, Move } from 'chess.js';

// -----------------------------------------------------
// Piece values
// -----------------------------------------------------

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

const MATE_SCORE = 1_000_000;

// -----------------------------------------------------
// Piece-square tables
// -----------------------------------------------------

const PST: Record<string, number[]> = {
  p: [
    0, 0, 0, 0, 0, 0, 0, 0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5, 5, 10, 25, 25, 10, 5, 5,
    0, 0, 0, 20, 20, 0, 0, 0,
    5, -5, -10, 0, 0, -10, -5, 5,
    5, 10, 10, -20, -20, 10, 10, 5,
    0, 0, 0, 0, 0, 0, 0, 0,
  ],

  n: [
    -50, -40, -30, -30, -30, -30, -40, -50,
    -40, -20, 0, 0, 0, 0, -20, -40,
    -30, 0, 10, 15, 15, 10, 0, -30,
    -30, 5, 15, 20, 20, 15, 5, -30,
    -30, 0, 15, 20, 20, 15, 0, -30,
    -30, 5, 10, 15, 15, 10, 5, -30,
    -40, -20, 0, 5, 5, 0, -20, -40,
    -50, -40, -30, -30, -30, -30, -40, -50,
  ],

  b: [
    -20, -10, -10, -10, -10, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 10, 10, 10, 10, 0, -10,
    -10, 5, 5, 10, 10, 5, 5, -10,
    -10, 0, 5, 10, 10, 5, 0, -10,
    -10, 10, 10, 10, 10, 10, 10, -10,
    -10, 5, 0, 0, 0, 0, 5, -10,
    -20, -10, -10, -10, -10, -10, -10, -20,
  ],

  r: [
    0, 0, 0, 0, 0, 0, 0, 0,
    5, 10, 10, 10, 10, 10, 10, 5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    0, 0, 0, 5, 5, 0, 0, 0,
  ],

  q: [
    -20, -10, -10, -5, -5, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 5, 5, 5, 5, 0, -10,
    -5, 0, 5, 5, 5, 5, 0, -5,
    0, 0, 5, 5, 5, 5, 0, -5,
    -10, 5, 5, 5, 5, 5, 0, -10,
    -10, 0, 5, 0, 0, 0, 0, -10,
    -20, -10, -10, -5, -5, -10, -10, -20,
  ],

  k: [
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -20, -30, -30, -40, -40, -30, -30, -20,
    -10, -20, -20, -20, -20, -20, -20, -10,
    20, 20, 0, 0, 0, 0, 20, 20,
    20, 30, 10, 0, 0, 10, 30, 20,
  ],

  k_endgame: [
    -50, -40, -30, -20, -20, -30, -40, -50,
    -30, -20, -10, 0, 0, -10, -20, -30,
    -30, -10, 20, 30, 30, 20, -10, -30,
    -30, -10, 30, 40, 40, 30, -10, -30,
    -30, -10, 30, 40, 40, 30, -10, -30,
    -30, -10, 20, 30, 30, 20, -10, -30,
    -30, -30, 0, 0, 0, 0, -30, -30,
    -50, -30, -30, -30, -30, -30, -30, -50,
  ],
};

// -----------------------------------------------------
// Game phase helpers
// -----------------------------------------------------

function isOpening(game: Chess): boolean {
  return game.moveNumber() <= 10;
}

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
      if (sq.type === 'n' || sq.type === 'b') {
        minorPieces++;
      }
    }
  }

  return (
    (queens <= 2 && rooks === 0) ||
    (queens <= 2 && minorPieces <= 2)
  );
}

function getKingPST(endgame: boolean): number[] {
  return endgame ? PST.k_endgame : PST.k;
}

// -----------------------------------------------------
// Board helpers
// -----------------------------------------------------

function squareFromCoordinates(
  row: number,
  col: number
): Square {
  return `${String.fromCharCode(97 + col)}${8 - row}` as Square;
}

function findKing(
  game: Chess,
  color: 'w' | 'b'
): string | null {
  const board = game.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];

      if (
        piece &&
        piece.type === 'k' &&
        piece.color === color
      ) {
        return String.fromCharCode(97 + c) + (8 - r);
      }
    }
  }

  return null;
}

// -----------------------------------------------------
// Pawn structure
// -----------------------------------------------------

function evaluatePawnStructure(game: Chess): number {
  const board = game.board();

  const pawns: Record<'w' | 'b', number[]> = {
    w: Array(8).fill(0),
    b: Array(8).fill(0),
  };

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];

      if (piece?.type === 'p') {
        pawns[piece.color][c]++;
      }
    }
  }

  let score = 0;

  for (const color of ['w', 'b'] as const) {
    const enemy = color === 'w' ? 'b' : 'w';

    for (let file = 0; file < 8; file++) {
      const count = pawns[color][file];

      // Doubled pawns
      if (count > 1) {
        score +=
          (color === 'w' ? -1 : 1) *
          (count - 1) *
          15;
      }

      // Isolated pawn
      if (count > 0) {
        const left = file > 0
          ? pawns[color][file - 1]
          : 0;

        const right = file < 7
          ? pawns[color][file + 1]
          : 0;

        if (left === 0 && right === 0) {
          score += color === 'w' ? -10 : 10;
        }
      }
    }

    // Passed pawns
    for (let file = 0; file < 8; file++) {
      if (pawns[color][file] === 0) continue;

      const enemyFiles = [
        file - 1,
        file,
        file + 1,
      ].filter(
        (f) => f >= 0 && f <= 7
      );

      const hasEnemyPawn = enemyFiles.some(
        (f) => pawns[enemy][f] > 0
      );

      if (!hasEnemyPawn) {
        score += color === 'w' ? 25 : -25;
      }
    }
  }

  return score;
}

// -----------------------------------------------------
// Hanging pieces
// -----------------------------------------------------

function evaluateHangingPieces(game: Chess): number {
  const board = game.board();
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];

      if (!piece || piece.type === 'k' || piece.type === 'p') {
        continue;
      }

      const square = squareFromCoordinates(r, c);

      const enemyColor =
        piece.color === 'w' ? 'b' : 'w';

      const attackers = game.attackers(
        square,
        enemyColor
      );

      if (attackers.length === 0) {
        continue;
      }

      const defenders = game.attackers(
        square,
        piece.color
      );

      const pieceValue =
        PIECE_VALUES[piece.type] || 0;

      // Completely hanging major/minor piece.
      if (defenders.length === 0) {
        score +=
          piece.color === 'w'
            ? -pieceValue * 0.32
            : pieceValue * 0.32;

        continue;
      }

      // Slight penalty when the piece is under heavier
      // attacking pressure than defending pressure.
      if (attackers.length > defenders.length) {
        score +=
          piece.color === 'w'
            ? -pieceValue * 0.08
            : pieceValue * 0.08;
      }
    }
  }

  return score;
}

// -----------------------------------------------------
// Board evaluation
// -----------------------------------------------------

function evaluateBoard(
  game: Chess,
  personality: AIPersonality
): number {
  const board = game.board();
  const endgame = isEndgame(game);
  const kingPST = getKingPST(endgame);

  let score = 0;

  // ---------------------------------------------------
  // Material + piece placement
  // ---------------------------------------------------

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];

      if (!piece) continue;

      const idx =
        piece.color === 'w'
          ? (7 - r) * 8 + c
          : r * 8 + c;

      let tableValue = 0;

      switch (piece.type) {
        case 'p':
          tableValue = PST.p[idx];
          break;
        case 'n':
          tableValue = PST.n[idx];
          break;
        case 'b':
          tableValue = PST.b[idx];
          break;
        case 'r':
          tableValue = PST.r[idx];
          break;
        case 'q':
          tableValue = PST.q[idx];
          break;
        case 'k':
          tableValue = kingPST[idx];
          break;
      }

      const pieceValue =
        PIECE_VALUES[piece.type] || 0;

      const sign =
        piece.color === 'w' ? 1 : -1;

      score +=
        sign *
        (pieceValue + tableValue);
    }
  }

  // ---------------------------------------------------
  // Mobility
  // ---------------------------------------------------

  const currentMobility = game.moves().length;

  score +=
    (game.turn() === 'w' ? 1 : -1) *
    currentMobility *
    (personality.mobilityWeight || 1);

  // ---------------------------------------------------
  // Centre control
  // ---------------------------------------------------

  const centerSquares = [
    'd4',
    'd5',
    'e4',
    'e5',
  ] as Square[];

  const extendedCenter = [
    'c3',
    'c4',
    'c5',
    'c6',
    'd3',
    'd6',
    'e3',
    'e6',
    'f3',
    'f4',
    'f5',
    'f6',
  ] as Square[];

  for (const square of centerSquares) {
    const piece = game.get(square);

    if (piece) {
      score +=
        piece.color === 'w'
          ? 30 * (personality.centerControlWeight || 1)
          : -30 * (personality.centerControlWeight || 1);
    }
  }

  for (const square of extendedCenter) {
    const piece = game.get(square);

    if (piece) {
      score +=
        piece.color === 'w'
          ? 10 * (personality.centerControlWeight || 1)
          : -10 * (personality.centerControlWeight || 1);
    }
  }

  // ---------------------------------------------------
  // King safety
  // ---------------------------------------------------

  if (!endgame) {
    const kingSafetyWeight =
      personality.kingSafetyWeight || 1;

    const whiteKing = findKing(game, 'w');
    const blackKing = findKing(game, 'b');

    if (
      whiteKing === 'g1' ||
      whiteKing === 'c1'
    ) {
      score += 45 * kingSafetyWeight;
    }

    if (
      blackKing === 'g8' ||
      blackKing === 'c8'
    ) {
      score -= 45 * kingSafetyWeight;
    }

    if (whiteKing && whiteKing !== 'g1' && whiteKing !== 'c1') {
      score -= 8 * kingSafetyWeight;
    }

    if (blackKing && blackKing !== 'g8' && blackKing !== 'c8') {
      score += 8 * kingSafetyWeight;
    }
  }

  // ---------------------------------------------------
  // Pawn structure
  // ---------------------------------------------------

  score += evaluatePawnStructure(game);

  // ---------------------------------------------------
  // Hanging-piece pressure
  // ---------------------------------------------------

  score += evaluateHangingPieces(game);

  // ---------------------------------------------------
  // Check penalty
  // ---------------------------------------------------

  if (game.inCheck()) {
    score += game.turn() === 'w' ? -120 : 120;
  }

  // ---------------------------------------------------
  // Personality tendencies
  // ---------------------------------------------------

  if (personality.preferAggressive) {
    const turn = game.turn();

    const kingSquare =
      turn === 'w'
        ? findKing(game, 'b')
        : findKing(game, 'w');

    if (kingSquare) {
      const rank = parseInt(kingSquare[1], 10);

      if (turn === 'w') {
        score += (8 - rank) * 3;
      } else {
        score += (rank - 1) * 3;
      }
    }
  }

  if (personality.preferDefensive) {
    const currentKing =
      findKing(game, game.turn());

    if (currentKing) {
      const rank = parseInt(currentKing[1], 10);

      if (game.turn() === 'w') {
        score += Math.max(0, rank - 1) * 2;
      } else {
        score += Math.max(0, 8 - rank) * 2;
      }
    }
  }

  // Return from current side-to-move perspective.
  return game.turn() === 'w'
    ? score
    : -score;
}

// -----------------------------------------------------
// Opening book
// -----------------------------------------------------

interface OpeningLine {
  name: string;
  moves: string[];
}

const OPENING_BOOK: OpeningLine[] = [
  // ---------------------------------------------------
  // 1.e4 openings
  // ---------------------------------------------------

  {
    name: 'Sicilian Defence',
    moves: [
      'e4',
      'c5',
      'Nf3',
      'd6',
      'd4',
      'cxd4',
      'Nxd4',
      'Nf6',
      'Nc3',
      'g6',
    ],
  },

  {
    name: 'French Defence',
    moves: [
      'e4',
      'e6',
      'd4',
      'd5',
      'Nc3',
      'Nf6',
      'e5',
      'Nfd7',
      'f4',
      'c5',
    ],
  },

  {
    name: 'Caro-Kann Defence',
    moves: [
      'e4',
      'c6',
      'd4',
      'd5',
      'Nc3',
      'dxe4',
      'Nxe4',
      'Bf5',
      'Ng3',
      'Bg6',
    ],
  },

  {
    name: 'Open Game',
    moves: [
      'e4',
      'e5',
      'Nf3',
      'Nc6',
      'Bc4',
      'Nf6',
      'O-O',
      'Be7',
      'Re1',
      'd6',
    ],
  },

  // ---------------------------------------------------
  // 1.d4 openings
  // ---------------------------------------------------

  {
    name: "King's Indian Defence",
    moves: [
      'd4',
      'Nf6',
      'c4',
      'g6',
      'Nc3',
      'Bg7',
      'e4',
      'd6',
      'Nf3',
      'O-O',
    ],
  },

  {
    name: "Queen's Gambit Declined",
    moves: [
      'd4',
      'd5',
      'c4',
      'e6',
      'Nc3',
      'Nf6',
      'Bg5',
      'Be7',
      'e3',
      'O-O',
    ],
  },

  {
    name: 'Slav Defence',
    moves: [
      'd4',
      'd5',
      'c4',
      'c6',
      'Nc3',
      'Nf6',
      'Nf3',
      'dxc4',
      'a4',
      'Bf5',
    ],
  },

  {
    name: 'Nimzo-Indian Defence',
    moves: [
      'd4',
      'Nf6',
      'c4',
      'e6',
      'Nc3',
      'Bb4',
      'e3',
      'O-O',
      'Bd3',
      'd5',
    ],
  },

  // ---------------------------------------------------
  // 1.c4 / 1.Nf3
  // ---------------------------------------------------

  {
    name: 'English Opening',
    moves: [
      'c4',
      'e5',
      'Nc3',
      'Nf6',
      'g3',
      'd5',
      'cxd5',
      'Nxd5',
      'Bg2',
      'Nb6',
    ],
  },

  {
    name: 'Reti Opening',
    moves: [
      'Nf3',
      'd5',
      'g3',
      'Nf6',
      'Bg2',
      'c6',
      'O-O',
      'Bf5',
      'd3',
      'e6',
    ],
  },
];

const openingState = new WeakMap<Chess, OpeningLine>();

let recentOpenings: string[] = [];

function findLegalMoveBySAN(
  game: Chess,
  san: string
): Move | null {
  const moves = game.moves({
    verbose: true,
  }) as Move[];

  return (
    moves.find((move) => move.san === san) ??
    null
  );
}

function chooseOpeningLine(
  game: Chess
): OpeningLine | null {
  const history = game.history();

  // The opening is selected on Black's first move.
  if (
    history.length !== 1 ||
    game.turn() !== 'b'
  ) {
    return null;
  }

  const firstMove = history[0];

  const compatibleOpenings =
    OPENING_BOOK.filter(
      (opening) =>
        opening.moves[0] === firstMove
    );

  if (compatibleOpenings.length === 0) {
    return null;
  }

  // Prefer openings we haven't used recently.
  const freshOpenings =
    compatibleOpenings.filter(
      (opening) =>
        !recentOpenings.includes(opening.name)
    );

  const pool =
    freshOpenings.length > 0
      ? freshOpenings
      : compatibleOpenings;

  const selected =
    pool[
      Math.floor(
        Math.random() * pool.length
      )
    ];

  openingState.set(game, selected);

  recentOpenings = [
    selected.name,
    ...recentOpenings.filter(
      (name) => name !== selected.name
    ),
  ].slice(0, 4);

  return selected;
}

function getOpeningBookMove(
  game: Chess,
  difficulty: number
): Move | null {
  // Keep the beginner levels intentionally loose.
  if (difficulty < 4) {
    return null;
  }

  const history = game.history();

  // Only use the opening book during the first 10 plies.
  if (
    history.length === 0 ||
    history.length > 10
  ) {
    return null;
  }

  let opening = openingState.get(game);

  if (!opening) {
    opening = chooseOpeningLine(game);
  }

  if (!opening) {
    return null;
  }

  // Make sure the actual game still follows
  // the selected opening.
  for (
    let i = 0;
    i < history.length;
    i++
  ) {
    if (opening.moves[i] !== history[i]) {
      openingState.delete(game);
      return null;
    }
  }

  const nextMove =
    opening.moves[history.length];

  if (!nextMove) {
    return null;
  }

  const legalMove =
    findLegalMoveBySAN(
      game,
      nextMove
    );

  // If the line somehow isn't legal in the
  // current position, abandon the book safely.
  if (!legalMove) {
    openingState.delete(game);
    return null;
  }

  return legalMove;
}

// -----------------------------------------------------
// Tactical helpers
// -----------------------------------------------------

function isCapture(move: Move): boolean {
  return !!move.captured;
}

function isPromotion(move: Move): boolean {
  return !!move.promotion;
}

function givesCheck(
  game: Chess,
  move: Move
): boolean {
  const sim = new Chess(game.fen());

  try {
    sim.move(move);
    return sim.inCheck();
  } catch {
    return false;
  }
}

function detectFork(
  game: Chess,
  move: Move
): number {
  const sim = new Chess(game.fen());

  try {
    sim.move(move);
  } catch {
    return 0;
  }

  const movedPiece = sim.get(move.to as Square);

  if (!movedPiece) {
    return 0;
  }

  const enemyColor =
    movedPiece.color === 'w' ? 'b' : 'w';

  const board = sim.board();
  let valuableTargets = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const target = board[r][c];

      if (
        !target ||
        target.color !== enemyColor ||
        target.type === 'p' ||
        target.type === 'k'
      ) {
        continue;
      }

      const targetSquare =
        squareFromCoordinates(r, c);

      const attackers = sim.attackers(
        targetSquare,
        movedPiece.color
      );

      if (
        attackers.includes(move.to as Square)
      ) {
        valuableTargets++;

        if (valuableTargets >= 2) {
          return 180;
        }
      }
    }
  }

  return 0;
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
    return -500;
  }

  const movedPiece = sim.get(
    move.to as Square
  );

  if (!movedPiece) {
    return 0;
  }

  if (movedPiece.type === 'k') {
    return 0;
  }

  const enemyColor =
    movedPiece.color === 'w' ? 'b' : 'w';

  const attackers = sim.attackers(
    move.to as Square,
    enemyColor
  );

  if (attackers.length === 0) {
    return 0;
  }

  const defenders = sim.attackers(
    move.to as Square,
    movedPiece.color
  );

  const pieceValue =
    PIECE_VALUES[movedPiece.type] || 0;

  if (defenders.length === 0) {
    return (
      -pieceValue *
      (0.45 +
        personality.tacticalWeight * 0.35)
    );
  }

  if (attackers.length > defenders.length) {
    return (
      -pieceValue *
      0.10
    );
  }

  return -15;
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

  const movedPiece = sim.get(
    move.to as Square
  );

  if (!movedPiece) {
    return 0;
  }

  const enemyColor =
    movedPiece.color === 'w' ? 'b' : 'w';

  let score = 0;

  // Direct check.
  if (sim.inCheck()) {
    score += 180;
  }

  const board = sim.board();

  // What valuable enemy pieces does the moved
  // piece actually attack?
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const enemyPiece = board[r][c];

      if (
        !enemyPiece ||
        enemyPiece.color !== enemyColor
      ) {
        continue;
      }

      if (
        enemyPiece.type === 'p' ||
        enemyPiece.type === 'k'
      ) {
        continue;
      }

      const targetSquare =
        squareFromCoordinates(r, c);

      const attackers = sim.attackers(
        targetSquare,
        movedPiece.color
      );

      if (
        attackers.includes(
          move.to as Square
        )
      ) {
        score += Math.min(
          PIECE_VALUES[enemyPiece.type] * 0.12,
          100
        );
      }
    }
  }

  // Bonus for a fork.
  score += detectFork(game, move);

  return (
    score *
    personality.tacticalWeight
  );
}

// -----------------------------------------------------
// Root move scoring
// -----------------------------------------------------

function scoreMove(
  game: Chess,
  move: Move,
  personality: AIPersonality
): number {
  let score = 0;

  // Captures.
  if (isCapture(move)) {
    const victimValue =
      PIECE_VALUES[move.captured || 'p'];

    const attackerValue =
      PIECE_VALUES[move.piece] || 100;

    score +=
      (victimValue * 1.8) -
      (attackerValue * 0.25) +
      personality.captureBias * 40;
  }

  // Checks.
  if (givesCheck(game, move)) {
    score +=
      80 +
      personality.checkBias * 80;
  }

  // Promotions.
  if (isPromotion(move)) {
    const promoValue =
      move.promotion === 'q'
        ? 800
        : move.promotion === 'r'
        ? 400
        : 250;

    score += promoValue;
  }

  // Opening development.
  if (
    isOpening(game) &&
    personality.preferDevelopment
  ) {
    if (
      move.piece === 'n' ||
      move.piece === 'b'
    ) {
      const fromRank =
        parseInt(move.from[1], 10);

      if (
        fromRank === 2 ||
        fromRank === 7
      ) {
        score += 30;
      }
    }
  }

  // Castling.
  if (
    move.san === 'O-O' ||
    move.san === 'O-O-O'
  ) {
    score +=
      personality.kingSafetyWeight * 50;
  }

  // Tactical play.
  if (
    personality.tacticalWeight > 0
  ) {
    score += detectFork(
      game,
      move
    ) * personality.tacticalWeight;
  }

  // Endgame pawn/king preferences.
  if (
    isEndgame(game) &&
    personality.endgameSkill > 0.5
  ) {
    if (move.piece === 'p') {
      const toRank =
        parseInt(move.to[1], 10);

      const advance =
        game.turn() === 'w'
          ? toRank
          : 9 - toRank;

      score +=
        advance *
        12 *
        personality.endgameSkill;
    }

    if (move.piece === 'k') {
      const file =
        move.to.charCodeAt(0) - 97;

      const rank =
        parseInt(move.to[1], 10) - 1;

      const centerDistance =
        Math.abs(3.5 - file) +
        Math.abs(3.5 - rank);

      score +=
        (7 - centerDistance) *
        10 *
        personality.endgameSkill;
    }
  }

  if (personality.preferAggressive) {
    const toRank =
      parseInt(move.to[1], 10);

    const advance =
      game.turn() === 'w'
        ? toRank
        : 9 - toRank;

    score += advance * 3;
  }

  if (personality.preferDefensive) {
    const toRank =
      parseInt(move.to[1], 10);

    const retreat =
      game.turn() === 'w'
        ? 9 - toRank
        : toRank;

    score += retreat * 2;
  }

  // Avoid hanging important pieces.
  if (personality.depth >= 2) {
    score +=
      evaluateMoveSafety(
        game,
        move,
        personality
      );
  }

  // Create actual threats.
  if (
    personality.tacticalWeight >= 0.3
  ) {
    score += evaluateMoveThreat(
      game,
      move,
      personality
    );
  }

  return score;
}

// -----------------------------------------------------
// AI personalities
// -----------------------------------------------------

export interface AIPersonality {
  name: string;
  description: string;
  depth: number;
  randomness: number;
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
  blunderChance: number;
  endgameSkill: number;
}

export const AI_PERSONALITIES:
  Record<number, AIPersonality> = {
1: {
  name: 'Static Pawn',
  description: 'Barely moves. Good for learning the basics.',
  depth: 1,
  randomness: 0.70,
  captureBias: 0.15,
  checkBias: 0.08,
  positionalWeight: 0.12,
  tacticalWeight: 0.05,
  mobilityWeight: 0,
  centerControlWeight: 0.1,
  kingSafetyWeight: 0.1,
  preferDevelopment: false,
  preferAggressive: false,
  preferDefensive: false,
  blunderChance: 0.28,
  endgameSkill: 0.12,
},

2: {
  name: 'Broken Clock',
  description: 'Defensive. Recognizes immediate threats.',
  depth: 1,
  randomness: 0.55,
  captureBias: 0.25,
  checkBias: 0.12,
  positionalWeight: 0.2,
  tacticalWeight: 0.12,
  mobilityWeight: 1,
  centerControlWeight: 0.5,
  kingSafetyWeight: 0.5,
  preferDevelopment: false,
  preferAggressive: false,
  preferDefensive: true,
  blunderChance: 0.18,
  endgameSkill: 0.2,
},

3: {
  name: 'Street Player',
  description: 'Aggressive. Prefers attacking.',
  depth: 2,
  randomness: 0.38,
  captureBias: 0.45,
  checkBias: 0.35,
  positionalWeight: 0.3,
  tacticalWeight: 0.3,
  mobilityWeight: 2,
  centerControlWeight: 0.8,
  kingSafetyWeight: 0.3,
  preferDevelopment: false,
  preferAggressive: true,
  preferDefensive: false,
  blunderChance: 0.10,
  endgameSkill: 0.3,
},

4: {
  name: 'Club Player',
  description: 'Balanced opening play. Protects pieces.',
  depth: 2,
  randomness: 0.20,
  captureBias: 0.5,
  checkBias: 0.25,
  positionalWeight: 0.55,
  tacticalWeight: 0.4,
  mobilityWeight: 3,
  centerControlWeight: 1,
  kingSafetyWeight: 0.9,
  preferDevelopment: true,
  preferAggressive: false,
  preferDefensive: false,
  blunderChance: 0.07,
  endgameSkill: 0.45,
},

5: {
  name: 'Tactical Mind',
  description: 'Looks for forks, pins, skewers.',
  depth: 3,
  randomness: 0.10,
  captureBias: 0.65,
  checkBias: 0.55,
  positionalWeight: 0.5,
  tacticalWeight: 0.85,
  mobilityWeight: 4,
  centerControlWeight: 1.1,
  kingSafetyWeight: 0.75,
  preferDevelopment: true,
  preferAggressive: true,
  preferDefensive: false,
  blunderChance: 0.04,
  endgameSkill: 0.55,
},

6: {
  name: 'Silent Bishop',
  description: 'Deep positional calculation. A serious opponent.',
  depth: 8,
  randomness: 0.01,
  captureBias: 0.8,
  checkBias: 0.75,
  positionalWeight: 1.05,
  tacticalWeight: 0.95,
  mobilityWeight: 5,
  centerControlWeight: 1.3,
  kingSafetyWeight: 1.3,
  preferDevelopment: true,
  preferAggressive: false,
  preferDefensive: false,
  blunderChance: 0,
  endgameSkill: 1.0,
},

7: {
  name: "Master's Shadow",
  description: 'Very strong calculation with fewer inaccuracies.',
  depth: 8,
  randomness: 0.005,
  captureBias: 0.85,
  checkBias: 0.8,
  positionalWeight: 1.08,
  tacticalWeight: 0.98,
  mobilityWeight: 5,
  centerControlWeight: 1.35,
  kingSafetyWeight: 1.35,
  preferDevelopment: true,
  preferAggressive: false,
  preferDefensive: false,
  blunderChance: 0,
  endgameSkill: 1.0,
},

8: {
  name: 'Endgame Engine',
  description: 'Deep calculation and relentless endgame technique.',
  depth: 9,
  randomness: 0.002,
  captureBias: 0.9,
  checkBias: 0.85,
  positionalWeight: 1.1,
  tacticalWeight: 1.0,
  mobilityWeight: 5,
  centerControlWeight: 1.4,
  kingSafetyWeight: 1.4,
  preferDevelopment: true,
  preferAggressive: false,
  preferDefensive: false,
  blunderChance: 0,
  endgameSkill: 1.0,
},

9: {
  name: 'Grandmaster Echo',
  description: 'Extremely accurate. Rarely gives the board anything for free.',
  depth: 10,
  randomness: 0.001,
  captureBias: 0.95,
  checkBias: 0.9,
  positionalWeight: 1.12,
  tacticalWeight: 1.0,
  mobilityWeight: 5,
  centerControlWeight: 1.45,
  kingSafetyWeight: 1.45,
  preferDevelopment: true,
  preferAggressive: false,
  preferDefensive: false,
  blunderChance: 0,
  endgameSkill: 1.0,
},

10: {
  name: 'The Arbiter',
  description: 'Near-perfect calculation. The ultimate challenge.',
  depth: 11,
  randomness: 0,
  captureBias: 1.0,
  checkBias: 1.0,
  positionalWeight: 1.15,
  tacticalWeight: 1.0,
  mobilityWeight: 5,
  centerControlWeight: 1.5,
  kingSafetyWeight: 1.5,
  preferDevelopment: true,
  preferAggressive: false,
  preferDefensive: false,
  blunderChance: 0,
  endgameSkill: 1.0,
},
};

// -----------------------------------------------------
// Search control
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
  1: {
    maxDepth: 1,
    maxTimeMs: 30,
    maxNodes: 2_000,
  },

  2: {
    maxDepth: 1,
    maxTimeMs: 50,
    maxNodes: 3_000,
  },

  3: {
    maxDepth: 2,
    maxTimeMs: 90,
    maxNodes: 6_000,
  },

  4: {
    maxDepth: 3,
    maxTimeMs: 220,
    maxNodes: 16_000,
  },

  5: {
    maxDepth: 4,
    maxTimeMs: 400,
    maxNodes: 28_000,
  },

  // Current Arbiter strength becomes Silent Bishop.
  6: {
    maxDepth: 8,
    maxTimeMs: 2_000,
    maxNodes: 150_000,
  },

  // More time + more nodes than level 6.
  7: {
    maxDepth: 8,
    maxTimeMs: 2_500,
    maxNodes: 210_000,
  },

  // Deeper search.
  8: {
    maxDepth: 9,
    maxTimeMs: 3_200,
    maxNodes: 280_000,
  },

  // Very serious calculation.
  9: {
    maxDepth: 10,
    maxTimeMs: 4_200,
    maxNodes: 380_000,
  },

  // The final boss.
  10: {
    maxDepth: 11,
    maxTimeMs: 6_000,
    maxNodes: 500_000,
  },

};
interface SearchContext {
  personality: AIPersonality;
  difficulty: number;
  startTime: number;
  maxTimeMs: number;
  maxNodes: number;
  nodes: number;
}

function checkSearchLimits(
  context: SearchContext
): void {
  context.nodes += 1;

  if (
    context.nodes >= context.maxNodes
  ) {
    throw new SearchTimeout();
  }

  if (
    performance.now() -
      context.startTime >=
    context.maxTimeMs
  ) {
    throw new SearchTimeout();
  }
}

// -----------------------------------------------------
// Move ordering
// -----------------------------------------------------

function orderMoves(
  moves: Move[]
): Move[] {
  return [...moves].sort((a, b) => {
    const moveScore = (move: Move): number => {
      let score = 0;

      // Promotions first.
      if (move.promotion) {
        score += 10_000;
      }

      // Checks.
      if (move.san.includes('+')) {
        score += 4_000;
      }

      // Captures.
      if (move.captured) {
        score +=
          1_000 +
          (PIECE_VALUES[
            move.captured
          ] || 0);

        // MVV-LVA refinement.
        score -=
          (PIECE_VALUES[move.piece] || 100) *
          0.05;
      }

      // Castling.
      if (
        move.san === 'O-O' ||
        move.san === 'O-O-O'
      ) {
        score += 100;
      }

      return score;
    };

    return moveScore(b) - moveScore(a);
  });
}

// -----------------------------------------------------
// Quiescence search
// -----------------------------------------------------

function quiescenceSearch(
  game: Chess,
  alpha: number,
  beta: number,
  context: SearchContext,
  depth: number,
  ply: number
): number {
  checkSearchLimits(context);

  if (game.isCheckmate()) {
    return -MATE_SCORE + ply;
  }

  if (game.isDraw()) {
    return 0;
  }

  const inCheck = game.inCheck();

  // If we are not in check we can use stand-pat.
  if (!inCheck) {
    const standPat =
      evaluateBoard(
        game,
        context.personality
      );

    if (depth <= 0) {
      return standPat;
    }

    if (standPat >= beta) {
      return standPat;
    }

    if (standPat > alpha) {
      alpha = standPat;
    }
  }

  let moves = game.moves({
    verbose: true,
  }) as Move[];

  if (!inCheck) {
    moves = moves.filter(
      (move) =>
        !!move.captured ||
        !!move.promotion ||
        move.san.includes('+')
    );
  }

  if (moves.length === 0) {
    return evaluateBoard(
      game,
      context.personality
    );
  }

  moves = orderMoves(moves);

  for (const move of moves) {
    checkSearchLimits(context);

    game.move(move);

    let score: number;

    try {
      score =
        -quiescenceSearch(
          game,
          -beta,
          -alpha,
          context,
          depth - 1,
          ply + 1
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

// -----------------------------------------------------
// Negamax alpha-beta
// -----------------------------------------------------

function negamax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  context: SearchContext,
  ply: number
): number {
  checkSearchLimits(context);

  if (game.isCheckmate()) {
    return -MATE_SCORE + ply;
  }

  if (game.isDraw()) {
    return 0;
  }

  if (depth <= 0) {
    return quiescenceSearch(
      game,
      alpha,
      beta,
      context,
      3,
      ply
    );
  }

  const moves = orderMoves(
    game.moves({
      verbose: true,
    }) as Move[]
  );

  if (moves.length === 0) {
    return evaluateBoard(
      game,
      context.personality
    );
  }

  let bestScore = -Infinity;

  for (const move of moves) {
    checkSearchLimits(context);

    game.move(move);

    let score: number;

    try {
      // Extend tactical positions by one ply.
      const extension =
        game.inCheck() ||
        !!move.promotion ||
        move.san.includes('+')
          ? 1
          : 0;

      score =
        -negamax(
          game,
          depth - 1 + extension,
          -beta,
          -alpha,
          context,
          ply + 1
        );
    } finally {
      game.undo();
    }

    bestScore = Math.max(
      bestScore,
      score
    );

    alpha = Math.max(
      alpha,
      score
    );

    if (alpha >= beta) {
      break;
    }
  }

  return bestScore;
}

// -----------------------------------------------------
// Search root
// -----------------------------------------------------

interface RootSearchResult {
  move: Move;
  score: number;
}

function searchRoot(
  game: Chess,
  moves: Move[],
  depth: number,
  context: SearchContext
): RootSearchResult {
  let bestMove = moves[0];
  let bestScore = -Infinity;

  const orderedMoves =
    orderMoves(moves);

  for (const move of orderedMoves) {
    checkSearchLimits(context);

    game.move(move);

    let searchScore: number;

    try {
      searchScore =
        -negamax(
          game,
          depth - 1,
          -Infinity,
          Infinity,
          context,
          1
        );
    } finally {
      game.undo();
    }

    // Personality bias is deliberately small.
    //
    // The higher the level, the less this heuristic
    // is allowed to override actual calculation.
    const personalityBias =
  context.difficulty <= 4
    ? 0.14
    : context.difficulty <= 6
    ? 0.08
    : context.difficulty <= 8
    ? 0.025
    : 0.01;

    const heuristic =
      scoreMove(
        game,
        move,
        context.personality
      );

    const finalScore =
      searchScore +
      heuristic * personalityBias;

    if (finalScore > bestScore) {
      bestScore = finalScore;
      bestMove = move;
    }
  }

  return {
    move: bestMove,
    score: bestScore,
  };
}

// -----------------------------------------------------
// Lower-level controlled play
// -----------------------------------------------------

function chooseLowerLevelMove(
  game: Chess,
  moves: Move[],
  personality: AIPersonality,
  difficulty: number
): Move {
  const scoredMoves = moves.map(
    (move) => ({
      move,
      score:
        scoreMove(
          game,
          move,
          personality
        ) +
        (Math.random() - 0.5) *
          personality.randomness *
          120,
    })
  );

  scoredMoves.sort(
    (a, b) => b.score - a.score
  );

  const selectionFraction =
    difficulty === 1
      ? 0.80
      : difficulty === 2
      ? 0.60
      : 0.42;

  const candidateCount = Math.max(
    2,
    Math.ceil(
      scoredMoves.length *
        selectionFraction
    )
  );

  const candidates =
    scoredMoves.slice(
      0,
      Math.min(
        candidateCount,
        scoredMoves.length
      )
    );

  // Stronger of the three still gets a preference
  // toward the best candidate.
  if (difficulty === 3) {
    const roll = Math.random();

    if (
      roll <
      0.60 &&
      candidates[0]
    ) {
      return candidates[0].move;
    }

    if (
      roll <
      0.85 &&
      candidates[1]
    ) {
      return candidates[1].move;
    }
  }

  return (
    candidates[
      Math.floor(
        Math.random() *
          candidates.length
      )
    ]?.move ??
    scoredMoves[0]?.move ??
    moves[0]
  );
}

// -----------------------------------------------------
// Main AI move selector
// -----------------------------------------------------

export function getAIMove(
  game: Chess,
  difficulty: number
): Move | null {
  const personality =
    AI_PERSONALITIES[difficulty];

  if (!personality) {
    return null;
  }

  const moves = game.moves({
    verbose: true,
  }) as Move[];

  if (moves.length === 0) {
    return null;
  }

  // ---------------------------------------------------
// Opening book
// ---------------------------------------------------

const openingMove =
  getOpeningBookMove(
    game,
    difficulty
  );

if (openingMove) {
  return openingMove;
}

  // ---------------------------------------------------
  // Intentionally imperfect beginner play
  // ---------------------------------------------------

  if (difficulty <= 3) {
    return chooseLowerLevelMove(
      game,
      moves,
      personality,
      difficulty
    );
  }

  // ---------------------------------------------------
  // Strong levels
  // ---------------------------------------------------

  const limits =
    SEARCH_LIMITS[difficulty] ||
    SEARCH_LIMITS[5];

  const context: SearchContext = {
    personality,
    difficulty,
    startTime: performance.now(),
    maxTimeMs: limits.maxTimeMs,
    maxNodes: limits.maxNodes,
    nodes: 0,
  };

  let bestCompletedMove:
    | Move
    | null = null;

  // Root move ordering is reused between
  // iterative-deepening passes.
  let rootMoves =
    orderMoves(moves);

  for (
    let depth = 1;
    depth <= limits.maxDepth;
    depth++
  ) {
    try {
      const result =
        searchRoot(
          game,
          rootMoves,
          depth,
          context
        );

      bestCompletedMove =
        result.move;

      // Put the latest best move first
      // for the next iteration.
      rootMoves = [
        result.move,
        ...rootMoves.filter(
          (move) =>
            move.from !==
              result.move.from ||
            move.to !==
              result.move.to ||
            move.promotion !==
              result.move.promotion
        ),
      ];
    } catch (error) {
      if (
        error instanceof SearchTimeout
      ) {
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

  // If the search couldn't complete even
  // its first pass, choose the safest
  // immediately scored move.
  const fallback =
    moves
      .map((move) => ({
        move,
        score:
          scoreMove(
            game,
            move,
            personality
          ),
      }))
      .sort(
        (a, b) => b.score - a.score
      );

  return (
    fallback[0]?.move ??
    moves[0]
  );
}

// -----------------------------------------------------
// Public difficulty helpers
// -----------------------------------------------------

export function getDifficultyName(
  level: number
): string {
  return (
    AI_PERSONALITIES[level]?.name ||
    'Unknown'
  );
}

export function getDifficultyDescription(
  level: number
): string {
  return (
    AI_PERSONALITIES[level]?.description ||
    ''
  );
}