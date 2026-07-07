/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Shield, Play, Pause, RotateCcw, AlertCircle, Gamepad2, Sliders, Trophy, Menu, X, Sparkles, User, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BoardMatrix, CalibrationData, GameSettings, GameStats, GestureState, Particle, Tetromino, TetrominoType, GameHistoryRecord } from './types';
import { BOARD_HEIGHT, BOARD_WIDTH, DEFAULT_CALIBRATION, DEFAULT_SETTINGS, LEVEL_SPEEDS, LINE_POINTS, TETROMINOES, THEME_COLORS } from './constants';
import { audio, speech } from './audio';

// Components
import CameraFeed from './components/CameraFeed';
import TetrisBoard from './components/TetrisBoard';
import GestureGuides from './components/GestureGuides';
import SettingsPanel from './components/SettingsPanel';
import Leaderboard from './components/Leaderboard';
import PlayerHistory from './components/PlayerHistory';

// Generate empty board matrix
const createEmptyBoard = (): BoardMatrix =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));

interface StartScreenProps {
  onStart: () => void;
  highScore: number;
  settings: GameSettings;
  setSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
  playerName: string;
  onPlayerNameChange: (name: string) => void;
}

function StartScreen({ onStart, highScore, settings, setSettings, playerName, onPlayerNameChange }: StartScreenProps) {
  return (
    <motion.div
      id="start_screen_container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 select-none font-sans relative overflow-hidden"
    >
      {/* Decorative cyber grid backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.1)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header bar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between border-b border-slate-900 pb-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-fuchsia-500 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <Gamepad2 className="h-4.5 w-4.5 text-white animate-pulse" />
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">NEURAL GRID CORP</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
          <span>SECURE PROTOCOL V2.0</span>
        </div>
      </header>

      {/* Main layout */}
      <main className="max-w-4xl w-full mx-auto flex-1 flex flex-col justify-center items-center py-8 z-10">
        
        {/* Logo and branding title */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-[10px] font-mono tracking-wider uppercase mb-1">
            <Sparkles className="h-3 w-3 animate-spin duration-[3000ms]" />
            Computer Vision Powered Interface
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-indigo-500 drop-shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            NEURAL GRID
          </h1>
          <p className="text-xs text-slate-400 font-mono tracking-widest max-w-md mx-auto uppercase">
            Classic Block Matrix Controlled by Real-time Hand Gestures
          </p>
        </motion.div>

        {/* High Score Badge & Pre-Launch Audio settings & Pilot Identification */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-8"
        >
          {/* Pilot ID Input Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-16 w-16 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-all duration-300" />
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider truncate">Pilot ID</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">Enter active name</div>
              </div>
            </div>
            <input
              id="start_screen_pilot_name_input"
              type="text"
              maxLength={12}
              value={playerName}
              onChange={(e) => onPlayerNameChange(e.target.value.toUpperCase())}
              className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500/50 rounded-xl px-3 py-1.5 text-xs font-mono tracking-widest text-slate-100 placeholder-slate-700 outline-none transition-all duration-300 mt-1"
              placeholder="INPUT PILOT ID..."
            />
          </div>

          {/* High Score Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-16 w-16 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all duration-300" />
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">High Record</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">Peak performance</div>
              </div>
            </div>
            <div className="text-lg font-black font-mono text-amber-400 tracking-tight mt-1">
              {highScore.toLocaleString()}
            </div>
          </div>

          {/* Quick Audio Feeds */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 shrink-0">
                <Volume2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Audio Feeds</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">Prior to boot</div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-1">
              <button
                id="start_music_toggle"
                onClick={() => {
                  setSettings(prev => ({ ...prev, musicEnabled: !prev.musicEnabled }));
                  audio.playDrop();
                }}
                className={`flex-1 py-1.5 rounded-lg border text-[10px] font-mono font-bold transition cursor-pointer text-center ${
                  settings.musicEnabled
                    ? 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30 shadow-[0_0_10px_rgba(217,70,239,0.15)]'
                    : 'bg-slate-950/60 text-slate-500 border-slate-850'
                }`}
              >
                Music
              </button>
              <button
                id="start_sound_toggle"
                onClick={() => {
                  setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
                  audio.playDrop();
                }}
                className={`flex-1 py-1.5 rounded-lg border text-[10px] font-mono font-bold transition cursor-pointer text-center ${
                  settings.soundEnabled
                    ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-950/60 text-slate-500 border-slate-850'
                }`}
              >
                SFX
              </button>
            </div>
          </div>
        </motion.div>

        {/* Guided Command Systems section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-2xl bg-slate-900/40 border border-slate-900/80 rounded-2xl p-5 mb-10 shadow-lg backdrop-blur-sm"
        >
          <h2 className="text-xs font-mono font-black uppercase text-slate-400 tracking-widest mb-4 flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-cyan-400" />
            Guided Command Systems & Pilot Controls
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Gesture Left/Right */}
            <div className="bg-slate-950/50 border border-slate-850 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Steer Left/Right</span>
                <span className="text-lg">🖐️</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans mb-2">
                Wave hand horizontally relative to webcam center line to slide blocks.
              </p>
              <div className="text-[9px] font-mono text-cyan-400/80 border border-cyan-500/10 bg-cyan-500/5 px-2 py-0.5 rounded text-center">
                Keyboard: Left / Right (A / D)
              </div>
            </div>

            {/* Gesture Rotate */}
            <div className="bg-slate-950/50 border border-slate-850 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Rotate Block</span>
                <span className="text-lg">🤏</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans mb-2">
                Pinch fingers together to rotate the active tetromino 90 degrees.
              </p>
              <div className="text-[9px] font-mono text-fuchsia-400/80 border border-fuchsia-500/10 bg-fuchsia-500/5 px-2 py-0.5 rounded text-center">
                Keyboard: Up Arrow (W)
              </div>
            </div>

            {/* Gesture Soft Drop */}
            <div className="bg-slate-950/50 border border-slate-850 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Soft Drop</span>
                <span className="text-lg">✊</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans mb-2">
                Make a clenched fist to accelerate the block speed downwards rapidly.
              </p>
              <div className="text-[9px] font-mono text-emerald-400/80 border border-emerald-500/10 bg-emerald-500/5 px-2 py-0.5 rounded text-center">
                Keyboard: Down Arrow (S)
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-855 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-slate-500 gap-2">
            <span>🎥 Camera calibration takes place immediately upon system load.</span>
            <span>Keyboard spacebar fires an instant hard drop.</span>
          </div>
        </motion.div>

        {/* Play/Launch Game Trigger */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.4 }}
          className="flex flex-col items-center gap-3 w-full max-w-xs"
        >
          <button
            id="start_screen_launch_btn"
            onClick={onStart}
            className="group relative w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-sm font-black tracking-[0.15em] font-sans uppercase bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-400 hover:to-fuchsia-400 text-white shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:shadow-[0_0_35px_rgba(217,70,239,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer overflow-hidden"
          >
            {/* Pulsating backdrop layer */}
            <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Play className="h-4 w-4 fill-white animate-pulse" />
            <span>Initialize Matrix</span>
          </button>
          
          <span className="text-[10px] font-mono text-slate-500 tracking-wider">
            (Or press <span className="text-slate-400">SPACEBAR</span> or <span className="text-slate-400">ENTER</span>)
          </span>
        </motion.div>

      </main>

      {/* Footer credits */}
      <footer className="max-w-4xl w-full mx-auto mt-6 border-t border-slate-900 pt-4 flex flex-col sm:flex-row items-center justify-between text-[9px] font-mono text-slate-600 gap-2 shrink-0">
        <span>© 2026 NEURAL GRID CORP. STATUS: ENERGIZED & SECURE.</span>
        <span>COMPUTER VISION HUMAN-COMPUTER INTERACTION STUDY</span>
      </footer>
    </motion.div>
  );
}

export default function App() {
  // Game states
  const [board, setBoard] = useState<BoardMatrix>(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null);
  const [nextPiece, setNextPiece] = useState<Tetromino | null>(null);
  const [heldPiece, setHeldPiece] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState<boolean>(true);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: parseInt(localStorage.getItem('cyber_tetris_highscore') || '0', 10),
    level: 1,
    lines: 0,
    isGameOver: false,
    isPaused: false,
    hasStarted: false,
  });

  // Player Name & Game History
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem('cyber_tetris_player_name') || 'PILOT_1';
  });

  const [history, setHistory] = useState<GameHistoryRecord[]>(() => {
    const raw = localStorage.getItem('cyber_tetris_player_history');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Settings & Calibration
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [activeRightTab, setActiveRightTab] = useState<'console' | 'leaderboard' | 'history'>('console');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [calibration, setCalibration] = useState<CalibrationData>(DEFAULT_CALIBRATION);
  const [gestureState, setGestureState] = useState<GestureState>({
    currentGesture: 'No Hand Detected',
    confidence: 0,
    handDetected: false,
    xOffset: 0,
    yOffset: 0,
    rawX: DEFAULT_CALIBRATION.centerX,
    rawY: DEFAULT_CALIBRATION.centerY,
    isPinching: false,
    isFist: false,
    handX: DEFAULT_CALIBRATION.centerX,
    handY: DEFAULT_CALIBRATION.centerY,
  });

  // Particle systems for rows cleared explosive visual effect
  const [particles, setParticles] = useState<Particle[]>([]);

  // Timer & Loop Refs
  const gravityTimerRef = useRef<any>(null);
  const gestureTimerRef = useRef<any>(null);

  // Gesture rising-edge / throttling detectors
  const wasPinchingRef = useRef<boolean>(false);
  const wasHoldingRef = useRef<boolean>(false);
  const lastMoveTimeRef = useRef<number>(0);
  const lastDropTimeRef = useRef<number>(0);

  // Synchronize local high scores in localStorage
  useEffect(() => {
    localStorage.setItem('cyber_tetris_highscore', stats.highScore.toString());
  }, [stats.highScore]);

  // Synchronize player name in localStorage
  useEffect(() => {
    localStorage.setItem('cyber_tetris_player_name', playerName);
  }, [playerName]);

  // Synchronize player history in localStorage
  useEffect(() => {
    localStorage.setItem('cyber_tetris_player_history', JSON.stringify(history));
  }, [history]);

  // Record completed mission/game stats chronologically on game over
  useEffect(() => {
    if (stats.isGameOver && stats.hasStarted && stats.score > 0) {
      const newRecord: GameHistoryRecord = {
        id: Math.random().toString(36).substring(2, 11),
        playerName: playerName.trim().toUpperCase() || 'PILOT_1',
        score: stats.score,
        lines: stats.lines,
        level: stats.level,
        gameMode: settings.gameMode,
        visualTheme: settings.visualTheme,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      };

      setHistory(prev => {
        const updated = [newRecord, ...prev];
        return updated.slice(0, 100); // Store up to 100 entries
      });
    }
  }, [stats.isGameOver]);

  // Sync settings with audio system
  useEffect(() => {
    audio.setSoundEnabled(settings.soundEnabled);
    audio.setMusicEnabled(settings.musicEnabled);
  }, [settings.soundEnabled, settings.musicEnabled]);

  // Sync settings with speech system and speak theme changes (highly engaging for children and seniors!)
  const lastVoiceAssistRef = useRef(settings.voiceAssist);
  const lastGameModeRef = useRef(settings.gameMode);
  const lastThemeRef = useRef(settings.visualTheme);

  useEffect(() => {
    speech.setEnabled(settings.voiceAssist);
    if (settings.voiceAssist) {
      if (!lastVoiceAssistRef.current) {
        speech.speak("Voice assistant enabled!");
      } else if (settings.gameMode !== lastGameModeRef.current) {
        if (settings.gameMode === 'casual') speech.speak("Casual mode activated, soft constant speed.");
        else if (settings.gameMode === 'classic') speech.speak("Classic speed mode active.");
        else if (settings.gameMode === 'expert') speech.speak("Expert mode, starting at level 5.");
      } else if (settings.visualTheme !== lastThemeRef.current) {
        if (settings.visualTheme === 'neon') speech.speak("Cyber neon theme applied.");
        else if (settings.visualTheme === 'arcade') speech.speak("Retro arcade theme applied.");
        else if (settings.visualTheme === 'candy') speech.speak("Candy paradise theme active!");
      }
    }
    lastVoiceAssistRef.current = settings.voiceAssist;
    lastGameModeRef.current = settings.gameMode;
    lastThemeRef.current = settings.visualTheme;
  }, [settings.voiceAssist, settings.gameMode, settings.visualTheme]);

  // Random Tetromino generator
  const spawnPiece = useCallback((type?: TetrominoType): Tetromino => {
    const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    const randomType = type || types[Math.floor(Math.random() * types.length)];
    const config = TETROMINOES[randomType];

    // Starting x is centered. Starting y is top (often negative or 0)
    const startX = Math.floor((BOARD_WIDTH - config.matrix[0].length) / 2);
    
    return {
      type: randomType,
      matrix: config.matrix,
      color: config.color,
      glowColor: config.glowColor,
      position: { x: startX, y: 0 },
    };
  }, []);

  // Initialize first active and next pieces
  const initPieces = useCallback(() => {
    setCurrentPiece(spawnPiece());
    setNextPiece(spawnPiece());
  }, [spawnPiece]);

  // Check collision of block matrix with boundary walls and settled pieces
  const checkCollision = useCallback((piece: Tetromino, targetBoard: BoardMatrix, offset: { x: number; y: number }): boolean => {
    const matrix = piece.matrix;
    const posX = piece.position.x + offset.x;
    const posY = piece.position.y + offset.y;

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c]) {
          const boardX = posX + c;
          const boardY = posY + r;

          // Wall collision
          if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
            return true;
          }

          // Floor / settled piece collision
          if (boardY >= 0 && targetBoard[boardY][boardX] !== null) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  // Calculate coordinates of the ghost piece (transparent indicator showing landing spot)
  const calculateGhostY = useCallback((piece: Tetromino, currentBoard: BoardMatrix): number => {
    let ghostY = piece.position.y;
    while (!checkCollision(piece, currentBoard, { x: 0, y: ghostY - piece.position.y + 1 })) {
      ghostY++;
    }
    return ghostY;
  }, [checkCollision]);

  const ghostY = currentPiece ? calculateGhostY(currentPiece, board) : 0;

  // Particle burst spawner for row clear satisfaction
  const spawnLineParticles = (yIndex: number, color: string) => {
    const burst: Particle[] = [];
    // Spawn 24 glowing particles across the row
    for (let i = 0; i < 24; i++) {
      burst.push({
        x: (i / 24) * BOARD_WIDTH + (Math.random() * 0.4 - 0.2),
        y: yIndex + 0.5 + (Math.random() * 0.4 - 0.2),
        vx: Math.random() * 0.4 - 0.2,
        vy: Math.random() * -0.3 - 0.1, // upward drift
        color: color,
        alpha: 1,
        size: Math.random() * 4 + 2,
        decay: Math.random() * 0.02 + 0.015,
      });
    }
    setParticles(prev => [...prev, ...burst]);
  };

  // Lock current piece, clear lines, handle level increases, spawn next piece
  const lockPiece = useCallback(() => {
    if (!currentPiece) return;

    setBoard(prevBoard => {
      const nextBoard = prevBoard.map(row => [...row]);
      const matrix = currentPiece.matrix;
      const { x, y } = currentPiece.position;

      // Burn piece onto matrix board
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c]) {
            const boardY = y + r;
            const boardX = x + c;
            if (boardY >= 0 && boardY < BOARD_HEIGHT) {
              nextBoard[boardY][boardX] = currentPiece.type;
            }
          }
        }
      }

      // Check for filled lines (starting from bottom to top)
      let linesClearedThisTurn = 0;
      const clearedRowsIdx: number[] = [];
      const boardWithClearedRows = nextBoard.filter((row, idx) => {
        const isFull = row.every(cell => cell !== null);
        if (isFull) {
          linesClearedThisTurn++;
          clearedRowsIdx.push(idx);
          // Spawn neon particles at row center using first matching tetromino block color
          const rowColor = row.find(c => c !== null) ? TETROMINOES[row.find(c => c !== null)!].color : '#00f0f0';
          spawnLineParticles(idx, rowColor);
        }
        return !isFull;
      });

      // Pad remaining empty rows on top
      while (boardWithClearedRows.length < BOARD_HEIGHT) {
        boardWithClearedRows.unshift(Array(BOARD_WIDTH).fill(null));
      }

      // Process Scoring, Level ups, and SFX
      if (linesClearedThisTurn > 0) {
        audio.playLineClear(linesClearedThisTurn);

        if (settings.voiceAssist) {
          if (linesClearedThisTurn === 1) speech.speak("Line clear!");
          else if (linesClearedThisTurn === 2) speech.speak("Double clear!");
          else if (linesClearedThisTurn === 3) speech.speak("Triple clear!");
          else if (linesClearedThisTurn >= 4) speech.speak("Awesome Tetris Blast!");
        }

        setStats(prevStats => {
          const newLines = prevStats.lines + linesClearedThisTurn;
          const levelMultiplier = prevStats.level;
          const ptsEarned = LINE_POINTS[linesClearedThisTurn] * levelMultiplier;
          const newScore = prevStats.score + ptsEarned;
          
          // Increment Level every 10 lines
          const nextLevelThreshold = prevStats.level * 10;
          let newLevel = prevStats.level;
          if (newLines >= nextLevelThreshold && prevStats.level < 10) {
            newLevel++;
            audio.playLevelUp();
            if (settings.voiceAssist) {
              speech.speak(`Level up! Level ${newLevel}.`);
            }
          }

          return {
            ...prevStats,
            score: newScore,
            highScore: Math.max(newScore, prevStats.highScore),
            lines: newLines,
            level: newLevel,
          };
        });
      } else {
        audio.playDrop();
      }

      // Spawn next piece
      setCurrentPiece(prevCurrent => {
        const next = nextPiece || spawnPiece();
        
        // Check immediate spawn collision -> Game Over trigger
        if (checkCollision(next, boardWithClearedRows, { x: 0, y: 0 })) {
          audio.playGameOver();
          setStats(prev => ({ ...prev, isGameOver: true }));
          if (settings.voiceAssist) {
            speech.speak("Grid collapsed, game over!");
          }
          return null;
        }

        // Advance next piece
        setNextPiece(spawnPiece());
        return next;
      });

      setCanHold(true);

      return boardWithClearedRows;
    });
  }, [currentPiece, nextPiece, spawnPiece, checkCollision]);

  // Move Active Piece down (Soft Gravity Tick)
  const moveDown = useCallback(() => {
    if (stats.isGameOver || stats.isPaused || !stats.hasStarted || !currentPiece) return;

    setCurrentPiece(prev => {
      if (!prev) return null;
      
      const collides = checkCollision(prev, board, { x: 0, y: 1 });
      if (collides) {
        // Run locking routine
        setTimeout(lockPiece, 0);
        return prev;
      }

      return {
        ...prev,
        position: { x: prev.position.x, y: prev.position.y + 1 },
      };
    });
  }, [board, checkCollision, stats, lockPiece]);

  // Move Piece horizontally
  const moveHorizontal = useCallback((direction: 'left' | 'right') => {
    if (stats.isGameOver || stats.isPaused || !stats.hasStarted || !currentPiece) return;

    setCurrentPiece(prev => {
      if (!prev) return null;
      const dx = direction === 'left' ? -1 : 1;
      const collides = checkCollision(prev, board, { x: dx, y: 0 });
      
      if (!collides) {
        audio.playMove();
        return {
          ...prev,
          position: { x: prev.position.x + dx, y: prev.position.y },
        };
      }
      return prev;
    });
  }, [board, checkCollision, stats]);

  // Hard Drop current piece instantly
  const hardDrop = useCallback(() => {
    if (stats.isGameOver || stats.isPaused || !stats.hasStarted || !currentPiece) return;

    setCurrentPiece(prev => {
      if (!prev) return null;
      
      const endY = calculateGhostY(prev, board);
      const droppedPiece = {
        ...prev,
        position: { x: prev.position.x, y: endY },
      };

      // Add soft score for dropping
      const dropHeight = endY - prev.position.y;
      setStats(prevStats => ({
        ...prevStats,
        score: prevStats.score + (dropHeight * 2),
      }));

      audio.playDrop();
      
      // Force lock instantly
      setTimeout(lockPiece, 0);
      return droppedPiece;
    });
  }, [board, calculateGhostY, lockPiece, stats]);

  // Rotate piece clockwise with wall kicks
  const rotatePiece = useCallback(() => {
    if (stats.isGameOver || stats.isPaused || !stats.hasStarted || !currentPiece) return;

    setCurrentPiece(prev => {
      if (!prev) return null;

      const size = prev.matrix.length;
      const rotatedMatrix = Array.from({ length: size }, () => Array(size).fill(0));
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          rotatedMatrix[c][size - 1 - r] = prev.matrix[r][c];
        }
      }

      const rotated = { ...prev, matrix: rotatedMatrix };

      // Wall-kick offsets
      const kicks = [
        { x: 0, y: 0 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: -2, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: -1 },
      ];

      for (const kick of kicks) {
        const shifted = {
          ...rotated,
          position: {
            x: rotated.position.x + kick.x,
            y: rotated.position.y + kick.y,
          },
        };
        if (!checkCollision(shifted, board, { x: 0, y: 0 })) {
          audio.playRotate();
          return shifted;
        }
      }

      return prev;
    });
  }, [board, checkCollision, stats]);

  // Game actions coordinator
  const startGame = () => {
    // Reset Board
    setBoard(createEmptyBoard());
    setParticles([]);
    
    const startingLevel = settings.gameMode === 'expert' ? 5 : 1;
    
    setStats({
      score: 0,
      highScore: parseInt(localStorage.getItem('cyber_tetris_highscore') || '0', 10),
      level: startingLevel,
      lines: 0,
      isGameOver: false,
      isPaused: false,
      hasStarted: true,
    });
    
    // Setup first active piece and next piece
    setCurrentPiece(spawnPiece());
    setNextPiece(spawnPiece());
    setHeldPiece(null);
    setCanHold(true);

    audio.playLevelUp();

    if (settings.voiceAssist) {
      const modeSpeech = settings.gameMode === 'casual' ? 'casual mode' : settings.gameMode === 'expert' ? 'expert mode' : 'classic mode';
      speech.speak(`Launching matrix in ${modeSpeech}! Ready, go!`);
    }
  };

  const togglePause = useCallback(() => {
    setStats(prev => {
      if (!prev.hasStarted || prev.isGameOver) return prev;
      return {
        ...prev,
        isPaused: !prev.isPaused,
      };
    });
  }, []);

  const holdPiece = useCallback(() => {
    if (stats.isGameOver || stats.isPaused || !stats.hasStarted || !currentPiece || !canHold) return;

    audio.playHold();

    const nextHeldType = currentPiece.type;

    if (heldPiece === null) {
      // First time holding: swap current with next piece
      const nextType = nextPiece ? nextPiece.type : spawnPiece().type;
      setCurrentPiece(spawnPiece(nextType));
      setNextPiece(spawnPiece());
    } else {
      // Already holding: swap current with held piece
      setCurrentPiece(spawnPiece(heldPiece));
    }

    setHeldPiece(nextHeldType);
    setCanHold(false);
  }, [stats, currentPiece, heldPiece, nextPiece, canHold, spawnPiece]);

  // 1. Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (stats.isGameOver) return;

      const key = e.key.toLowerCase();

      // Launch start on Space or Enter if not started yet
      if (!stats.hasStarted) {
        if (key === ' ' || key === 'enter') {
          startGame();
          e.preventDefault();
        }
        return;
      }

      switch (key) {
        case 'arrowleft':
        case 'a':
          moveHorizontal('left');
          e.preventDefault();
          break;
        case 'arrowright':
        case 'd':
          moveHorizontal('right');
          e.preventDefault();
          break;
        case 'arrowup':
        case 'w':
          rotatePiece();
          e.preventDefault();
          break;
        case 'arrowdown':
        case 's':
          moveDown();
          // Score 1 point for manual soft drop
          setStats(prev => ({ ...prev, score: prev.score + 1 }));
          e.preventDefault();
          break;
        case ' ':
          hardDrop();
          e.preventDefault();
          break;
        case 'c':
        case 'shift':
          holdPiece();
          e.preventDefault();
          break;
        case 'p':
          togglePause();
          e.preventDefault();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stats, moveHorizontal, rotatePiece, moveDown, hardDrop, togglePause, holdPiece]);

  // 2. Continuous Gravity loop
  useEffect(() => {
    if (stats.isGameOver || stats.isPaused || !stats.hasStarted) {
      if (gravityTimerRef.current) {
        clearInterval(gravityTimerRef.current);
        gravityTimerRef.current = null;
      }
      return;
    }

    let speed = LEVEL_SPEEDS[stats.level] || 100;
    if (settings.gameMode === 'casual') {
      speed = 1200; // Slower, comfortable constant gravity speed for elderly & kid accessibility
    }

    gravityTimerRef.current = setInterval(() => {
      moveDown();
    }, speed);

    return () => {
      if (gravityTimerRef.current) {
        clearInterval(gravityTimerRef.current);
      }
    };
  }, [stats.level, stats.isGameOver, stats.isPaused, stats.hasStarted, moveDown]);

  // 3. Gesture Poll Action Loop
  // Reactively trigger movements timed to camera frame updates, avoiding interval recreation bugs
  useEffect(() => {
    if (stats.isGameOver || stats.isPaused || !stats.hasStarted) return;

    const now = Date.now();

    if (!gestureState.handDetected) {
      // Reset pinch latch
      wasPinchingRef.current = false;
      return;
    }

    // Sensitivity factor influences delays
    const delayScaling = 1 / (1 + (settings.sensitivity - 3) * 0.25); // Faster triggers on high sensitivity
    const lateralMoveDelay = 180 * delayScaling;
    const softDropDelay = 65 * delayScaling;

    // A. Handle Steering (Move Left/Right continuous drift)
    // Steer thresholds: xOffset < -0.4, xOffset > 0.4
    if (gestureState.xOffset < -0.4) {
      if (now - lastMoveTimeRef.current > lateralMoveDelay) {
        moveHorizontal('left');
        lastMoveTimeRef.current = now;
      }
    } else if (gestureState.xOffset > 0.4) {
      if (now - lastMoveTimeRef.current > lateralMoveDelay) {
        moveHorizontal('right');
        lastMoveTimeRef.current = now;
      }
    }

    // B. Handle Pinch Latch (Rising edge trigger for single discrete rotation)
    if (gestureState.isPinching) {
      if (!wasPinchingRef.current) {
        rotatePiece();
        wasPinchingRef.current = true;
      }
    } else {
      wasPinchingRef.current = false;
    }

    // C. Handle Fist (Continuous rapid soft drop downwards)
    if (gestureState.isFist) {
      if (now - lastDropTimeRef.current > softDropDelay) {
        moveDown();
        setStats(prev => ({ ...prev, score: prev.score + 1 }));
        lastDropTimeRef.current = now;
      }
    }

    // D. Handle Raise Hand Hold Latch (Rising edge trigger for single discrete hold)
    if (gestureState.yOffset < -0.6) {
      if (!wasHoldingRef.current) {
        holdPiece();
        wasHoldingRef.current = true;
      }
    } else {
      wasHoldingRef.current = false;
    }
  }, [gestureState, stats.isGameOver, stats.isPaused, stats.hasStarted, settings.sensitivity, moveHorizontal, rotatePiece, moveDown, holdPiece]);

  // Handle score registration submission
  const handleScoreSubmitted = () => {
    // Clear score so it does not keep triggering high score overlay
    setStats(prev => ({ ...prev, score: 0 }));
  };

  if (!stats.hasStarted) {
    return (
      <StartScreen
        onStart={startGame}
        highScore={stats.highScore}
        settings={settings}
        setSettings={setSettings}
        playerName={playerName}
        onPlayerNameChange={setPlayerName}
      />
    );
  }

  return (
    <div id="application_main_wrapper" className="h-screen bg-slate-950 text-slate-100 flex flex-col p-4 md:p-6 select-none font-sans overflow-y-auto relative">
      {/* Upper Brand / Ambient Navigation bar */}
      <header className="max-w-5xl w-full mx-auto flex flex-row items-center justify-between gap-4 border-b border-slate-900 pb-5 mb-5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-fuchsia-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Gamepad2 className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-indigo-500 uppercase">
                Neural Grid
              </h1>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-cyan-500/30 text-cyan-400 bg-cyan-950/20">
                AI VISION v2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider">
              GESTURE-CONTROLLED COGNITIVE TETRIS ENGINE
            </p>
          </div>
        </div>

        {/* Global Controls HUD */}
        <div className="flex items-center gap-3.5 bg-slate-900/40 border border-slate-900 px-4 py-2 rounded-xl">
          {/* Active Pilot Badge */}
          <div className="flex flex-col text-left font-mono text-[10px] text-slate-400 leading-tight">
            <span className="text-slate-500">Active Pilot</span>
            <span className="text-cyan-400 font-bold flex items-center gap-1 cursor-pointer hover:text-cyan-300 transition" onClick={() => { setIsDrawerOpen(true); setActiveRightTab('history'); audio.playDrop(); }} title="View Career Profile & History">
              <User className="h-3 w-3 text-cyan-400" />
              {playerName}
            </span>
          </div>

          <div className="h-6 w-[1px] bg-slate-800"></div>

          <div className="hidden sm:flex flex-col text-right font-mono text-[10px] text-slate-400 leading-tight">
            <span>High Score Database</span>
            <span className="text-amber-400 font-bold">{stats.highScore.toLocaleString()}</span>
          </div>

          <div className="hidden sm:block h-6 w-[1px] bg-slate-800"></div>

          {/* Quick Sound Toggles and Hamburger Menu */}
          <div className="flex gap-2 items-center">
            <button
              id="top_sound_toggle_btn"
              onClick={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
              title={settings.soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                settings.soundEnabled
                  ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              {settings.soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            </button>

            <div className="h-6 w-[1px] bg-slate-800"></div>

            <button
              id="hamburger_menu_btn"
              onClick={() => {
                setIsDrawerOpen(true);
                audio.playDrop();
              }}
              title="Open Controls & Leaderboard"
              className="p-1.5 rounded-lg border bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Menu className="h-4 w-4" />
              <span className="text-[10px] font-mono font-bold uppercase hidden sm:inline">Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container conforming exactly to visual prototype blocks */}
      <main className="flex-1 flex flex-col">
        
        {/* Dynamic Widescreen Side-by-Side Play Area */}
        <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch min-h-0">
          
          {/* LEFT WING: Game Station (Stats & Block Matrix Screen) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            
            {/* Upper Stats Row - Compact HUD layout */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 shrink-0">
              {/* Score */}
              <div className="bg-slate-900 border border-slate-850 rounded-2xl p-3 flex flex-col justify-between shadow-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 h-10 w-10 bg-cyan-500/5 rounded-full blur-lg group-hover:bg-cyan-500/10 transition-all duration-300"></div>
                <span className="text-[9px] font-mono font-bold tracking-wider text-slate-500 uppercase">Score Matrix</span>
                <span className="text-base font-black font-mono text-cyan-400 mt-1 tracking-tight truncate">
                  {stats.score.toLocaleString()}
                </span>
              </div>

              {/* Level */}
              <div className="bg-slate-900 border border-slate-850 rounded-2xl p-3 flex flex-col justify-between shadow-md relative overflow-hidden">
                <span className="text-[9px] font-mono font-bold tracking-wider text-slate-500 uppercase">Level</span>
                <span className="text-base font-black font-mono text-fuchsia-400 mt-1">
                  {stats.level}
                </span>
              </div>

              {/* Sector Lines */}
              <div className="bg-slate-900 border border-slate-850 rounded-2xl p-3 flex flex-col justify-between shadow-md relative overflow-hidden">
                <span className="text-[9px] font-mono font-bold tracking-wider text-slate-500 uppercase">Lines</span>
                <span className="text-base font-black font-mono text-emerald-400 mt-1">
                  {stats.lines}
                </span>
              </div>

              {/* Stored Hold Piece */}
              <div className={`bg-slate-900 border rounded-2xl p-3 flex flex-col justify-between shadow-md relative overflow-hidden transition-all duration-200 ${canHold ? 'border-slate-850 bg-slate-900' : 'border-orange-500/30 bg-orange-950/10'}`}>
                <span className="text-[9px] font-mono font-bold tracking-wider text-slate-500 uppercase block mb-1 flex items-center justify-between">
                  <span>Hold</span>
                  {!canHold && stats.hasStarted && !stats.isGameOver && (
                    <span className="text-[8px] font-mono text-orange-400 font-black tracking-widest uppercase px-1 rounded border border-orange-500/40 bg-orange-950/40 leading-none">LOCK</span>
                  )}
                </span>
                <div className="flex items-center justify-center flex-1 min-h-[22px]">
                  {heldPiece && stats.hasStarted && !stats.isGameOver ? (
                    (() => {
                      const config = TETROMINOES[heldPiece];
                      const themeColors = THEME_COLORS[settings.visualTheme][heldPiece];
                      return (
                        <div className={`grid gap-0.5 scale-90 transition-opacity duration-200 ${canHold ? 'opacity-100' : 'opacity-40'}`} style={{ gridTemplateColumns: `repeat(${config.matrix[0].length}, minmax(0, 1fr))` }}>
                          {config.matrix.map((row, rIdx) =>
                            row.map((cell, cIdx) => (
                              <div
                                key={`${rIdx}-${cIdx}`}
                                className={`h-2.5 w-2.5 rounded-[1.5px] border ${
                                  cell
                                    ? 'border-white/20 shadow-[0_0_6px_rgba(255,255,255,0.2)]'
                                    : 'border-transparent'
                                }`}
                                style={{
                                  backgroundColor: cell ? themeColors.color : 'transparent',
                                  boxShadow: cell ? `0 0 6px ${themeColors.glowColor}` : 'none'
                                }}
                              />
                            ))
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <span className="text-[9px] font-mono text-slate-600">EMPTY</span>
                  )}
                </div>
              </div>

              {/* Queue Loading Next Piece */}
              <div className="bg-slate-900 border border-slate-850 rounded-2xl p-3 flex flex-col justify-between shadow-md relative overflow-hidden">
                <span className="text-[9px] font-mono font-bold tracking-wider text-slate-500 uppercase block mb-1">Next Piece</span>
                <div className="flex items-center justify-center flex-1 min-h-[22px]">
                  {nextPiece && stats.hasStarted && !stats.isGameOver ? (
                    (() => {
                      const themeColors = THEME_COLORS[settings.visualTheme][nextPiece.type];
                      return (
                        <div className="grid gap-0.5 scale-90" style={{ gridTemplateColumns: `repeat(${nextPiece.matrix[0].length}, minmax(0, 1fr))` }}>
                          {nextPiece.matrix.map((row, rIdx) =>
                            row.map((cell, cIdx) => (
                              <div
                                key={`${rIdx}-${cIdx}`}
                                className={`h-2.5 w-2.5 rounded-[1.5px] border ${
                                  cell
                                    ? 'border-white/20 shadow-[0_0_6px_rgba(255,255,255,0.2)]'
                                    : 'border-transparent'
                                }`}
                                style={{
                                  backgroundColor: cell ? themeColors.color : 'transparent',
                                  boxShadow: cell ? `0 0 6px ${themeColors.glowColor}` : 'none'
                                }}
                              />
                            ))
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <span className="text-[9px] font-mono text-slate-600">WAITING</span>
                  )}
                </div>
              </div>
            </div>

            {/* Block Matrix Game Screen */}
            <div className="flex-1 flex items-center justify-center bg-slate-900/10 border border-slate-900/30 rounded-2xl p-4 min-h-[440px] relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 to-transparent pointer-events-none" />
              <div className="w-full max-w-[340px]">
                <TetrisBoard
                  board={board}
                  currentPiece={currentPiece}
                  ghostY={ghostY}
                  stats={stats}
                  onStartGame={startGame}
                  onPauseToggle={togglePause}
                  particles={particles}
                  setParticles={setParticles}
                  theme={settings.visualTheme}
                />
              </div>
            </div>

          </div>

          {/* RIGHT WING: Vision Controller (Calibration Center & Gesture Guides) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            
            {/* Calibrate Center Webcam Component */}
            <div className="flex-1 flex flex-col min-h-[320px]">
              <CameraFeed
                onGestureChange={setGestureState}
                calibration={calibration}
                onCalibrationChange={setCalibration}
                settings={settings}
              />
            </div>

            {/* Gesture Guides tutorial info */}
            <div className="shrink-0">
              <GestureGuides currentGesture={gestureState} />
            </div>

          </div>

        </div>

      </main>

      {/* Slide-out Control Deck & Leaderboard Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              id="drawer_backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsDrawerOpen(false);
                audio.playDrop();
              }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 cursor-pointer"
            />

            {/* Sliding Panel */}
            <motion.div
              id="drawer_panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-900/95 border-l border-slate-800 shadow-2xl p-6 z-50 flex flex-col gap-6 select-none backdrop-blur-md"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-cyan-400" />
                  <h2 className="text-sm font-black font-mono uppercase text-slate-100 tracking-wider">
                    Control Deck
                  </h2>
                </div>
                <button
                  id="drawer_close_btn"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    audio.playDrop();
                  }}
                  className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 hover:text-slate-200 text-slate-400 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Drawer Navigation Bar Tabs */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-1.5 flex gap-1.5 shadow-lg shrink-0">
                <button
                  id="drawer_control_console_tab"
                  onClick={() => {
                    setActiveRightTab('console');
                    audio.playDrop();
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    activeRightTab === 'console'
                      ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/5 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-black'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent hover:bg-slate-800/40'
                  }`}
                >
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Console</span>
                </button>
                <button
                  id="drawer_leaderboard_tab"
                  onClick={() => {
                    setActiveRightTab('leaderboard');
                    audio.playDrop();
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    activeRightTab === 'leaderboard'
                      ? 'bg-gradient-to-r from-fuchsia-500/15 to-pink-500/5 text-fuchsia-400 border border-fuchsia-500/30 shadow-[0_0_12px_rgba(217,70,239,0.15)] font-black'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent hover:bg-slate-800/40'
                  }`}
                >
                  <Trophy className="h-3.5 w-3.5" />
                  <span>Leaderboard</span>
                </button>
                <button
                  id="drawer_history_tab"
                  onClick={() => {
                    setActiveRightTab('history');
                    audio.playDrop();
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    activeRightTab === 'history'
                      ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/5 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)] font-black'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent hover:bg-slate-800/40'
                  }`}
                >
                  <History className="h-3.5 w-3.5" />
                  <span>History</span>
                </button>
              </div>

              {/* Active Tab Container */}
              <div className="flex-1 flex flex-col min-h-0 bg-slate-950/20 rounded-2xl border border-slate-850 p-2 overflow-y-auto">
                {activeRightTab === 'console' ? (
                  <div className="flex-1 animate-fade-in">
                    <SettingsPanel settings={settings} onSettingsChange={setSettings} />
                  </div>
                ) : activeRightTab === 'leaderboard' ? (
                  <div className="flex-1 animate-fade-in">
                    <Leaderboard
                      currentScore={stats.score}
                      level={stats.level}
                      lines={stats.lines}
                      isGameOver={stats.isGameOver}
                      onScoreSubmitted={handleScoreSubmitted}
                      defaultPlayerName={playerName}
                    />
                  </div>
                ) : (
                  <div className="flex-1 animate-fade-in">
                    <PlayerHistory
                      playerName={playerName}
                      onPlayerNameChange={setPlayerName}
                      history={history}
                      onClearHistory={() => {
                        if (confirm('Are you sure you want to clear your pilot mission logs?')) {
                          setHistory([]);
                        }
                      }}
                      theme={settings.visualTheme}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Ambient decorative footer */}
      <footer className="max-w-5xl w-full mx-auto mt-6 border-t border-slate-900 pt-4 flex flex-col sm:flex-row items-center justify-between text-[9px] font-mono text-slate-600 gap-2 shrink-0">
        <span>© 2026 NEURAL GRID CORP. SECURE CONNECTION TRACE OK.</span>
        <span>COMPUTER VISION HUMAN-COMPUTER INTERACTION STUDY</span>
      </footer>
    </div>
  );
}
