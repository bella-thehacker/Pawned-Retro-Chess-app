/**
 * Opening Detection System
 * Recognizes common chess openings from move sequences
 */

export interface OpeningInfo {
  name: string;
  ecoCode: string;
  category: string;
}

// ECO-coded opening detection based on first few moves
// Format: [white moves joined, black moves joined] -> opening info
interface OpeningPattern {
  whiteMoves: string[];
  blackMoves: string[];
  opening: OpeningInfo;
}

const OPENINGS: OpeningPattern[] = [
  // Italian Game family
  {
    whiteMoves: ['e4'],
    blackMoves: ['e5'],
    opening: { name: "Open Game", ecoCode: "C40", category: "Open Game" },
  },
  {
    whiteMoves: ['e4', 'Nf3'],
    blackMoves: ['e5', 'Nc6'],
    opening: { name: "King's Knight Opening", ecoCode: "C44", category: "Open Game" },
  },
  {
    whiteMoves: ['e4', 'Nf3', 'Bc4'],
    blackMoves: ['e5', 'Nc6'],
    opening: { name: "Italian Game", ecoCode: "C50", category: "Open Game" },
  },
  {
    whiteMoves: ['e4', 'Nf3', 'Bc4', 'c3'],
    blackMoves: ['e5', 'Nc6', 'Nf6'],
    opening: { name: "Italian Game", ecoCode: "C50", category: "Open Game" },
  },
  {
    whiteMoves: ['e4', 'Nf3', 'Bc4', 'b4'],
    blackMoves: ['e5', 'Nc6'],
    opening: { name: "Evans Gambit", ecoCode: "C51", category: "Open Game" },
  },
  {
    whiteMoves: ['e4', 'Nf3', 'Bc4', 'd3'],
    blackMoves: ['e5', 'Nc6', 'Nf6'],
    opening: { name: "Italian Game", ecoCode: "C50", category: "Open Game" },
  },
  {
    whiteMoves: ['e4', 'Nf3', 'd4'],
    blackMoves: ['e5', 'exd4'],
    opening: { name: "Scotch Gambit", ecoCode: "C44", category: "Open Game" },
  },
  {
    whiteMoves: ['e4', 'Nf3', 'd4', 'Nxd4'],
    blackMoves: ['e5', 'exd4'],
    opening: { name: "Scotch Game", ecoCode: "C45", category: "Open Game" },
  },
  {
    whiteMoves: ['e4', 'Nf3', 'Nxe5'],
    blackMoves: ['e5', 'Nf6'],
    opening: { name: "Petrov's Defense", ecoCode: "C42", category: "Open Game" },
  },
  {
    whiteMoves: ['e4', 'Nf3', 'dxe5'],
    blackMoves: ['e5', 'd6'],
    opening: { name: "Philidor Defense", ecoCode: "C41", category: "Open Game" },
  },
  {
    whiteMoves: ['e4', 'Nf3', 'Nxe5', 'd4'],
    blackMoves: ['e5', 'Nf6', 'd6'],
    opening: { name: "Petrov's Defense", ecoCode: "C42", category: "Open Game" },
  },
  // Ruy Lopez
  {
    whiteMoves: ['e4', 'Nf3', 'Bb5'],
    blackMoves: ['e5', 'Nc6'],
    opening: { name: "Ruy Lopez (Spanish Opening)", ecoCode: "C60", category: "Open Game" },
  },
  {
    whiteMoves: ['e4', 'Nf3', 'Bb5', 'Ba4'],
    blackMoves: ['e5', 'Nc6', 'Nf6'],
    opening: { name: "Ruy Lopez, Morphy Defense", ecoCode: "C78", category: "Open Game" },
  },
  {
    whiteMoves: ['e4', 'Nf3', 'Bb5', 'Ba4', 'O-O'],
    blackMoves: ['e5', 'Nc6', 'Nf6', 'Be7'],
    opening: { name: "Ruy Lopez, Closed", ecoCode: "C88", category: "Open Game" },
  },
  {
    whiteMoves: ['e4', 'Nf3', 'Bb5', 'Bxc6'],
    blackMoves: ['e5', 'Nc6'],
    opening: { name: "Ruy Lopez, Exchange", ecoCode: "C68", category: "Open Game" },
  },
  // Sicilian Defense
  {
    whiteMoves: ['e4'],
    blackMoves: ['c5'],
    opening: { name: "Sicilian Defense", ecoCode: "B20", category: "Semi-Open Game" },
  },
  {
    whiteMoves: ['e4', 'Nf3'],
    blackMoves: ['c5', 'd6'],
    opening: { name: "Sicilian Defense, Najdorf Variation", ecoCode: "B90", category: "Semi-Open Game" },
  },
  {
    whiteMoves: ['e4', 'Nf3', 'd4'],
    blackMoves: ['c5', 'cxd4'],
    opening: { name: "Sicilian Defense, Open", ecoCode: "B32", category: "Semi-Open Game" },
  },
  {
    whiteMoves: ['e4', 'Nf3', 'd4', 'Nxd4'],
    blackMoves: ['c5', 'cxd4', 'Nf6'],
    opening: { name: "Sicilian Defense, Open", ecoCode: "B33", category: "Semi-Open Game" },
  },
  {
    whiteMoves: ['e4', 'c3'],
    blackMoves: ['c5'],
    opening: { name: "Sicilian Defense, Alapin Variation", ecoCode: "B22", category: "Semi-Open Game" },
  },
  {
    whiteMoves: ['e4', 'Nc3'],
    blackMoves: ['c5'],
    opening: { name: "Sicilian Defense, Closed", ecoCode: "B23", category: "Semi-Open Game" },
  },
  // French Defense
  {
    whiteMoves: ['e4'],
    blackMoves: ['e6'],
    opening: { name: "French Defense", ecoCode: "C00", category: "Semi-Open Game" },
  },
  {
    whiteMoves: ['e4', 'd4'],
    blackMoves: ['e6', 'd5'],
    opening: { name: "French Defense", ecoCode: "C00", category: "Semi-Open Game" },
  },
  {
    whiteMoves: ['e4', 'd4', 'Nd2'],
    blackMoves: ['e6', 'd5'],
    opening: { name: "French Defense, Tarrasch Variation", ecoCode: "C03", category: "Semi-Open Game" },
  },
  {
    whiteMoves: ['e4', 'd4', 'e5'],
    blackMoves: ['e6', 'd5'],
    opening: { name: "French Defense, Advance Variation", ecoCode: "C02", category: "Semi-Open Game" },
  },
  {
    whiteMoves: ['e4', 'd4', 'exd5'],
    blackMoves: ['e6', 'exd5'],
    opening: { name: "French Defense, Exchange Variation", ecoCode: "C01", category: "Semi-Open Game" },
  },
  // Caro-Kann
  {
    whiteMoves: ['e4'],
    blackMoves: ['c6'],
    opening: { name: "Caro-Kann Defense", ecoCode: "B10", category: "Semi-Open Game" },
  },
  {
    whiteMoves: ['e4', 'd4'],
    blackMoves: ['c6', 'd5'],
    opening: { name: "Caro-Kann Defense", ecoCode: "B13", category: "Semi-Open Game" },
  },
  // Pirc/Modern
  {
    whiteMoves: ['e4'],
    blackMoves: ['d6'],
    opening: { name: "Pirc Defense", ecoCode: "B07", category: "Semi-Open Game" },
  },
  {
    whiteMoves: ['e4', 'd4'],
    blackMoves: ['d6', 'Nf6'],
    opening: { name: "Pirc Defense", ecoCode: "B07", category: "Semi-Open Game" },
  },
  {
    whiteMoves: ['e4'],
    blackMoves: ['g6'],
    opening: { name: "Modern Defense", ecoCode: "B06", category: "Semi-Open Game" },
  },
  // Scandinavian
  {
    whiteMoves: ['e4'],
    blackMoves: ['d5'],
    opening: { name: "Scandinavian Defense", ecoCode: "B01", category: "Semi-Open Game" },
  },
  {
    whiteMoves: ['e4', 'exd5'],
    blackMoves: ['d5', 'Qxd5'],
    opening: { name: "Scandinavian Defense", ecoCode: "B01", category: "Semi-Open Game" },
  },
  {
    whiteMoves: ['e4', 'exd5', 'Nc3'],
    blackMoves: ['d5', 'Qxd5'],
    opening: { name: "Scandinavian Defense", ecoCode: "B01", category: "Semi-Open Game" },
  },
  // Alekhine
  {
    whiteMoves: ['e4'],
    blackMoves: ['Nf6'],
    opening: { name: "Alekhine's Defense", ecoCode: "B02", category: "Semi-Open Game" },
  },
  // Queen's Gambit / d4 openings
  {
    whiteMoves: ['d4'],
    blackMoves: ['d5'],
    opening: { name: "Closed Game", ecoCode: "D00", category: "Closed Game" },
  },
  {
    whiteMoves: ['d4', 'c4'],
    blackMoves: ['d5'],
    opening: { name: "Queen's Gambit", ecoCode: "D06", category: "Closed Game" },
  },
  {
    whiteMoves: ['d4', 'c4', 'cxd5'],
    blackMoves: ['d5', 'e6'],
    opening: { name: "Queen's Gambit Declined", ecoCode: "D30", category: "Closed Game" },
  },
  {
    whiteMoves: ['d4', 'c4', 'cxd5'],
    blackMoves: ['d5', 'dxc4'],
    opening: { name: "Queen's Gambit Accepted", ecoCode: "D20", category: "Closed Game" },
  },
  {
    whiteMoves: ['d4', 'c4', 'Nc3'],
    blackMoves: ['d5', 'Nf6'],
    opening: { name: "Queen's Gambit Declined", ecoCode: "D35", category: "Closed Game" },
  },
  {
    whiteMoves: ['d4', 'c4', 'Nc3', 'Nf3'],
    blackMoves: ['d5', 'Nf6', 'e6'],
    opening: { name: "Queen's Gambit Declined", ecoCode: "D37", category: "Closed Game" },
  },
  // Slav Defense
  {
    whiteMoves: ['d4', 'c4'],
    blackMoves: ['d5', 'c6'],
    opening: { name: "Slav Defense", ecoCode: "D10", category: "Closed Game" },
  },
  // King's Indian Defense
  {
    whiteMoves: ['d4'],
    blackMoves: ['Nf6'],
    opening: { name: "King's Indian Defense", ecoCode: "E60", category: "Indian Defense" },
  },
  {
    whiteMoves: ['d4', 'c4'],
    blackMoves: ['Nf6', 'g6'],
    opening: { name: "King's Indian Defense", ecoCode: "E60", category: "Indian Defense" },
  },
  {
    whiteMoves: ['d4', 'c4', 'Nc3'],
    blackMoves: ['Nf6', 'g6', 'Bg7'],
    opening: { name: "King's Indian Defense", ecoCode: "E73", category: "Indian Defense" },
  },
  {
    whiteMoves: ['d4', 'Nf3'],
    blackMoves: ['Nf6', 'g6'],
    opening: { name: "King's Indian Attack", ecoCode: "A07", category: "Indian Defense" },
  },
  // Nimzo-Indian
  {
    whiteMoves: ['d4', 'c4'],
    blackMoves: ['Nf6', 'e6'],
    opening: { name: "Queen's Indian / Nimzo-Indian", ecoCode: "E12", category: "Indian Defense" },
  },
  {
    whiteMoves: ['d4', 'c4', 'Nc3'],
    blackMoves: ['Nf6', 'e6', 'Bb4'],
    opening: { name: "Nimzo-Indian Defense", ecoCode: "E20", category: "Indian Defense" },
  },
  // Grunfeld
  {
    whiteMoves: ['d4', 'c4', 'Nc3'],
    blackMoves: ['Nf6', 'g6', 'd5'],
    opening: { name: "Grunfeld Defense", ecoCode: "D85", category: "Indian Defense" },
  },
  // Catalan
  {
    whiteMoves: ['d4', 'c4', 'g3'],
    blackMoves: ['Nf6', 'e6'],
    opening: { name: "Catalan Opening", ecoCode: "E00", category: "Closed Game" },
  },
  // English Opening
  {
    whiteMoves: ['c4'],
    blackMoves: [],
    opening: { name: "English Opening", ecoCode: "A10", category: "Flank Opening" },
  },
  {
    whiteMoves: ['c4', 'Nc3'],
    blackMoves: ['e5'],
    opening: { name: "English Opening", ecoCode: "A22", category: "Flank Opening" },
  },
  {
    whiteMoves: ['c4', 'Nc3', 'g3'],
    blackMoves: ['Nf6'],
    opening: { name: "English Opening, Botvinnik System", ecoCode: "A26", category: "Flank Opening" },
  },
  // Reti
  {
    whiteMoves: ['Nf3'],
    blackMoves: [],
    opening: { name: "Reti Opening", ecoCode: "A04", category: "Flank Opening" },
  },
  {
    whiteMoves: ['Nf3', 'g3'],
    blackMoves: ['d5'],
    opening: { name: "Reti Opening, King's Indian Attack", ecoCode: "A07", category: "Flank Opening" },
  },
  // London System
  {
    whiteMoves: ['d4', 'Nf3', 'Bf4'],
    blackMoves: ['d5', 'Nf6'],
    opening: { name: "London System", ecoCode: "D02", category: "Closed Game" },
  },
  {
    whiteMoves: ['d4', 'Nf3', 'Bf4', 'e3'],
    blackMoves: ['d5', 'Nf6', 'e6'],
    opening: { name: "London System", ecoCode: "D02", category: "Closed Game" },
  },
  // Colle
  {
    whiteMoves: ['d4', 'Nf3', 'e3'],
    blackMoves: ['d5', 'Nf6'],
    opening: { name: "Colle System", ecoCode: "D05", category: "Closed Game" },
  },
  // Benoni
  {
    whiteMoves: ['d4'],
    blackMoves: ['Nf6', 'c5'],
    opening: { name: "Benoni Defense", ecoCode: "A56", category: "Indian Defense" },
  },
  {
    whiteMoves: ['d4', 'c4'],
    blackMoves: ['Nf6', 'c5'],
    opening: { name: "Benoni Defense", ecoCode: "A43", category: "Indian Defense" },
  },
  // Dutch
  {
    whiteMoves: ['d4'],
    blackMoves: ['f5'],
    opening: { name: "Dutch Defense", ecoCode: "A80", category: "Indian Defense" },
  },
  // Bird's Opening
  {
    whiteMoves: ['f4'],
    blackMoves: [],
    opening: { name: "Bird's Opening", ecoCode: "A02", category: "Flank Opening" },
  },
  // Vienna Game
  {
    whiteMoves: ['e4', 'Nc3'],
    blackMoves: ['e5'],
    opening: { name: "Vienna Game", ecoCode: "C25", category: "Open Game" },
  },
  // King's Gambit
  {
    whiteMoves: ['e4', 'f4'],
    blackMoves: ['e5'],
    opening: { name: "King's Gambit", ecoCode: "C30", category: "Open Game" },
  },
  {
    whiteMoves: ['e4', 'f4', 'fxe5'],
    blackMoves: ['e5', 'exf4'],
    opening: { name: "King's Gambit Accepted", ecoCode: "C33", category: "Open Game" },
  },
  // Center Game
  {
    whiteMoves: ['e4', 'd4'],
    blackMoves: ['e5', 'exd4'],
    opening: { name: "Center Game", ecoCode: "C21", category: "Open Game" },
  },
  // Two Knights
  {
    whiteMoves: ['e4', 'Nf3'],
    blackMoves: ['e5', 'Nc6', 'Nf6'],
    opening: { name: "Two Knights Defense", ecoCode: "C55", category: "Open Game" },
  },
  // Four Knights
  {
    whiteMoves: ['e4', 'Nf3', 'Nc3'],
    blackMoves: ['e5', 'Nc6', 'Nf6'],
    opening: { name: "Four Knights Game", ecoCode: "C47", category: "Open Game" },
  },
];

/**
 * Detect the current opening from move history
 * @param history Array of SAN move strings
 * @returns OpeningInfo or null if no recognized opening
 */
export function detectOpening(history: string[]): OpeningInfo | null {
  if (history.length < 2) return null;

  // Separate white and black moves
  const whiteMoves: string[] = [];
  const blackMoves: string[] = [];
  
  for (let i = 0; i < history.length; i++) {
    if (i % 2 === 0) {
      whiteMoves.push(history[i]);
    } else {
      blackMoves.push(history[i]);
    }
  }

  // Find best matching opening (longest match)
  let bestMatch: OpeningPattern | null = null;
  let bestMatchLength = 0;

  for (const pattern of OPENINGS) {
    let matchLength = 0;
    let isMatch = true;

    // Check white moves
    for (let i = 0; i < pattern.whiteMoves.length; i++) {
      if (i >= whiteMoves.length) break;
      // Compare base moves (ignore check/checkmate symbols for matching)
      const histMove = whiteMoves[i].replace(/[+#]$/, '');
      const patternMove = pattern.whiteMoves[i];
      if (histMove === patternMove || histMove.startsWith(patternMove)) {
        matchLength++;
      } else {
        isMatch = false;
        break;
      }
    }

    // Check black moves
    if (isMatch) {
      for (let i = 0; i < pattern.blackMoves.length; i++) {
        if (i >= blackMoves.length) break;
        const histMove = blackMoves[i].replace(/[+#]$/, '');
        const patternMove = pattern.blackMoves[i];
        if (histMove === patternMove || histMove.startsWith(patternMove)) {
          matchLength++;
        } else {
          isMatch = false;
          break;
        }
      }
    }

    // Update best match if this is longer
    if (matchLength > bestMatchLength) {
      bestMatchLength = matchLength;
      bestMatch = pattern;
    }
  }

  return bestMatch?.opening || null;
}

/**
 * Get a display string for the opening
 */
export function getOpeningDisplayName(opening: OpeningInfo | null): string {
  if (!opening) return 'Unknown Opening';
  return `${opening.ecoCode} — ${opening.name}`;
}
