import { useEffect, useCallback, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import ChessBoard from '../components/chess/ChessBoard';
import MoveHistory from '../components/chess/MoveHistory';
import GameTimer from '../components/chess/GameTimer';
import GameStatus from '../components/chess/GameStatus';
import CapturedPieces from '../components/chess/CapturedPieces';
import GameModal from '../components/chess/GameModal';
import OpeningDisplay from '../components/chess/OpeningDisplay';
import VictoryOverlay from '../components/chess/VictoryOverlay';
import SoundSubtitles from '../components/chess/SoundSubtitles';
import RetroButton from '../components/RetroButton';
import CRTPanel from '../components/CRTPanel';
import { useChessGame } from '../hooks/useChessGame';
import { useGameTimer } from '../hooks/useGameTimer';
import { useChessSounds } from '../hooks/useChessSounds';
import { useChessAI } from '../hooks/useChessAI';
import { useMatchStats } from '../hooks/useMatchStats';
import { useSettingsStore } from '../stores/settingsStore';
import { detectOpening, getOpeningDisplayName } from '../lib/openingDetection';
import type { OpeningInfo } from '../lib/openingDetection';
import { saveGame, loadGame, clearSavedGame } from '../lib/gameStorage';
import type { SavedGameState } from '../lib/gameStorage';
import type { MatchStatistics } from '../hooks/useMatchStats';
import {
  RotateCcw,
  Flag,
  Home,
  Pause,
  Play,
  ChevronDown,
  ChevronUp,
  Bot,
  Users,
  Brain,
} from 'lucide-react';

export default function ChessGame() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get('mode') || 'pass-and-play') as 'pass-and-play' | 'robot';
  const difficulty = parseInt(searchParams.get('difficulty') || '1', 10);

  const chessGame = useChessGame();
  const timer = useGameTimer(600); // 10 minutes default
  const { playSound } = useChessSounds();
  const ai = useChessAI(difficulty);
  const matchStats = useMatchStats();
  const getAnimationDuration = useSettingsStore((s) => s.getAnimationDuration);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  const [isPaused, setIsPaused] = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [currentOpening, setCurrentOpening] = useState<OpeningInfo | null>(null);
  const [lastSound, setLastSound] = useState<string | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const prevStatusRef = useRef(chessGame.status);
  const prevMoveCountRef = useRef(chessGame.moves.length);
  const gameStartedRef = useRef(false);
  const aiInProgressRef = useRef(false);

  // Try to restore saved game on first load
  useEffect(() => {
    if (gameStartedRef.current) return;

    const saved = loadGame();
    if (saved && saved.mode === mode && saved.status === 'playing') {
      // Restore game state
      const game = chessGame.game;
      try {
        // Load FEN
        game.load(saved.fen);
        // Restore timers
        timer.reset();
        // Set times from saved state
        // Note: timer.reset() resets to initial, we'd need to set specific times
        // For now, we'll just continue with fresh timers for simplicity
        gameStartedRef.current = true;
        matchStats.startTracking();
      } catch {
        // If restore fails, start fresh
        startNewGame();
      }
    } else {
      startNewGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startNewGame = useCallback(() => {
    gameStartedRef.current = true;
    matchStats.startTracking();
    timer.start();
    playSound('game-start');
  }, [matchStats, timer, playSound]);

  // Detect opening after each move
  useEffect(() => {
    if (chessGame.moves.length > 1) {
      const sanMoves = chessGame.moves.map((m) => m.san);
      const opening = detectOpening(sanMoves);
      if (opening) {
        setCurrentOpening(opening);
        matchStats.setOpening(getOpeningDisplayName(opening));
      }
    }
  }, [chessGame.moves, matchStats]);

  // AI Turn
  useEffect(() => {
    if (mode !== 'robot') return;
    if (chessGame.turn !== 'b') return;
    if (chessGame.isCheckmate || chessGame.isStalemate || chessGame.isDraw) return;
    if (aiInProgressRef.current) return;
    if (isPaused) return;

    aiInProgressRef.current = true;
    setAiThinking(true);

    const makeAiMove = async () => {
      try {
        const san = await ai.makeAIMove(chessGame.game);
        if (san) {
          // Find the move in verbose format and make it
          const moves = chessGame.game.moves({ verbose: true });
          const move = moves.find((m) => m.san === san);
          if (move) {
            chessGame.makeMove(move.from, move.to, move.promotion);
          }
        }
      } catch (err) {
        console.error('AI move error:', err);
      } finally {
        setAiThinking(false);
        aiInProgressRef.current = false;
      }
    };

    makeAiMove();
  }, [chessGame.turn, mode, chessGame.isCheckmate, chessGame.isStalemate, chessGame.isDraw, isPaused]);

  // Handle timer switching on moves
  useEffect(() => {
    const currentMoveCount = chessGame.moves.length;
    if (currentMoveCount > prevMoveCountRef.current) {
      const lastMove = chessGame.moves[currentMoveCount - 1];

      // Play sound based on move type
      if (lastMove.captured) {
        playSound('capture');
        setLastSound('capture');
      } else {
        playSound('move');
        setLastSound('move');
      }

      // Record in match stats
      matchStats.recordMove(lastMove);

      // Check for check after the move
      if (chessGame.isCheck) {
        setTimeout(() => {
          playSound('check');
          setLastSound('check');
        }, 200);
      }

      // Checkmate sound
      if (chessGame.isCheckmate) {
        setTimeout(() => {
          playSound('checkmate');
          setLastSound('checkmate');
        }, 400);
        timer.stop();
        matchStats.setResult(
          chessGame.winner === 'w' ? 'white-win' : 'black-win',
          'checkmate'
        );
      }

      // Stalemate
      if (chessGame.isStalemate) {
        timer.stop();
        matchStats.setResult('draw', 'stalemate');
      }

      // Draw
      if (chessGame.isDraw && !chessGame.isStalemate) {
        timer.stop();
        // Determine draw reason
        const game = chessGame.game;
        let reason: MatchStatistics['resultReason'] = 'agreement';
        if (game.isInsufficientMaterial()) reason = 'insufficient-material';
        else if (game.isThreefoldRepetition()) reason = 'threefold-repetition';
        else reason = 'fifty-move-rule';
        matchStats.setResult('draw', reason);
      }

      // Save game after each move
      const state: SavedGameState = {
        fen: chessGame.game.fen(),
        moveHistory: chessGame.moveHistory,
        moves: chessGame.moves.map((m) => m.san),
        whiteTime: timer.whiteTime,
        blackTime: timer.blackTime,
        activeColor: chessGame.turn,
        isRunning: timer.isRunning,
        capturedByWhite: chessGame.capturedByWhite,
        capturedByBlack: chessGame.capturedByBlack,
        mode,
        difficulty: mode === 'robot' ? difficulty : undefined,
        startedAt: Date.now(),
        lastMoveAt: Date.now(),
        status: chessGame.isCheckmate || chessGame.isStalemate || chessGame.isDraw ? 'checkmate' : 'playing',
      };
      saveGame(state);

      // Switch timer
      timer.switchTurn();
      prevMoveCountRef.current = currentMoveCount;
    }
    prevStatusRef.current = chessGame.status;
  }, [chessGame.moves.length]);

  // Handle pause/resume
  const handlePause = useCallback(() => {
    if (isPaused) {
      timer.start();
      setIsPaused(false);
    } else {
      timer.stop();
      setIsPaused(true);
    }
  }, [isPaused, timer]);

  // Handle resign
  const handleResign = useCallback(() => {
    timer.stop();
    matchStats.setResult(
      chessGame.turn === 'w' ? 'black-win' : 'white-win',
      'resignation'
    );
    clearSavedGame();
    navigate(mode === 'robot' ? '/robot' : '/friend');
  }, [navigate, mode, timer, chessGame.turn, matchStats]);

  // Handle play again
  const handlePlayAgain = useCallback(() => {
    chessGame.reset();
    timer.reset();
    timer.start();
    prevMoveCountRef.current = 0;
    setIsPaused(false);
    setCurrentOpening(null);
    matchStats.startTracking();
    gameStartedRef.current = true;
    clearSavedGame();
  }, [chessGame, timer, matchStats]);

  // Handle back to menu
  const handleBackToMenu = useCallback(() => {
    clearSavedGame();
    navigate('/');
  }, [navigate]);

  const gameEnded =
    chessGame.status === 'checkmate' ||
    chessGame.status === 'stalemate' ||
    chessGame.status === 'draw';

  return (
    <div className="min-h-screen flex flex-col pt-[60px]">
      <SoundSubtitles lastSound={lastSound} />

      {/* Pause overlay */}
      {isPaused && !gameEnded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[9990] bg-[rgba(42,27,21,0.6)] backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-[#E7DFC9] border-2 border-[#8B6B4A] rounded-[20px] p-8 text-center shadow-lg"
          >
            <h2 className="font-arcade text-[16px] text-[#2A1B15] mb-6">PAUSED</h2>
            <div className="flex flex-col gap-3">
              <RetroButton variant="accent" icon={Play} onClick={handlePause}>
                RESUME
              </RetroButton>
              <RetroButton variant="secondary" icon={RotateCcw} onClick={handlePlayAgain}>
                RESTART
              </RetroButton>
              <RetroButton variant="secondary" icon={Home} onClick={handleBackToMenu}>
                QUIT TO MENU
              </RetroButton>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* AI Thinking Indicator */}
      <AnimatePresence>
        {aiThinking && mode === 'robot' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-[70px] left-1/2 -translate-x-1/2 z-[9980]"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#2A1B15] border border-[#C8A04A]/30 shadow-lg">
              <Brain size={14} className="text-[#C8A04A] animate-pulse" />
              <span className="font-mono text-[10px] text-[#C8A04A] tracking-wider">
                {ai.personality?.name?.toUpperCase() || 'AI'} IS THINKING...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main game layout */}
      <div className="flex-1 flex flex-col lg:flex-row items-start justify-center gap-6 p-4 md:p-6 max-w-[1200px] mx-auto w-full">
        {/* Left: Board */}
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: getAnimationDuration(0.4) }}
          className="flex flex-col items-center gap-4 flex-shrink-0"
        >
          {/* Top bar with game info */}
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              {mode === 'robot' ? (
                <>
                  <Bot size={14} className="text-[#C8A04A]" />
                  <span className="font-mono text-[10px] text-[#6B5B4A] tracking-wider uppercase">
                    VS {ai.personality?.name?.toUpperCase() || `LEVEL ${difficulty}`}
                  </span>
                </>
              ) : (
                <>
                  <Users size={14} className="text-[#6E7B4F]" />
                  <span className="font-mono text-[10px] text-[#6B5B4A] tracking-wider uppercase">
                    PASS & PLAY
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePause}
                className="p-1.5 rounded hover:bg-[#8B6B4A]/10 transition-colors text-[#6B5B4A]"
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
              </button>
              <button
                onClick={handleResign}
                className="p-1.5 rounded hover:bg-[#8C3A3A]/10 transition-colors text-[#8C3A3A]"
                title="Resign"
              >
                <Flag size={16} />
              </button>
            </div>
          </div>

          {/* Game Status */}
          <GameStatus
            status={chessGame.status}
            turn={chessGame.turn}
            winner={chessGame.winner}
          />

          {/* Timer */}
          <GameTimer
            whiteTime={timer.whiteTime}
            blackTime={timer.blackTime}
            activeColor={timer.activeColor}
            isLowTime={timer.isLowTime}
          />

          {/* Opening Display */}
          {currentOpening && (
            <OpeningDisplay opening={currentOpening} />
          )}

          {/* The Chess Board with Victory Overlay */}
          <div className="relative">
            <ChessBoard chessGame={chessGame} />
            <VictoryOverlay
              isActive={gameEnded}
              winner={chessGame.winner}
            />
          </div>

          {/* Mobile: Toggle panel button */}
          <button
            onClick={() => setShowMobilePanel(!showMobilePanel)}
            className="lg:hidden flex items-center gap-1 font-mono text-[11px] text-[#6B5B4A] hover:text-[#C8A04A] transition-colors mt-2"
          >
            {showMobilePanel ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showMobilePanel ? 'HIDE PANEL' : 'SHOW MOVE HISTORY'}
          </button>
        </motion.div>

        {/* Right: Side panel */}
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: getAnimationDuration(0.4), delay: 0.1 }}
          className={`flex flex-col gap-4 w-full lg:w-[300px] flex-shrink-0 ${
            showMobilePanel ? 'block' : 'hidden lg:flex'
          }`}
        >
          {/* Captured Pieces */}
          <CRTPanel>
            <CapturedPieces
              capturedByWhite={chessGame.capturedByWhite}
              capturedByBlack={chessGame.capturedByBlack}
            />
          </CRTPanel>

          {/* Move History */}
          <CRTPanel className="flex-1 min-h-[200px]">
            <MoveHistory history={chessGame.moveHistory} />
          </CRTPanel>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <RetroButton
              variant="secondary"
              size="sm"
              icon={RotateCcw}
              onClick={handlePlayAgain}
              className="flex-1"
            >
              Restart
            </RetroButton>
            <RetroButton
              variant="secondary"
              size="sm"
              icon={Home}
              onClick={handleBackToMenu}
              className="flex-1"
            >
              Menu
            </RetroButton>
          </div>
        </motion.div>
      </div>

      {/* Game Over Modal */}
      <GameModal
        isOpen={gameEnded}
        status={(chessGame.status === 'check' || chessGame.status === 'playing') ? 'draw' : chessGame.status}
        winner={chessGame.winner}
        stats={matchStats.stats}
        onPlayAgain={handlePlayAgain}
        onBackToMenu={handleBackToMenu}
      />
    </div>
  );
}
