/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, AlertTriangle, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BoardMatrix, GameStats, Particle, Tetromino, TetrominoType } from '../types';
import { BOARD_HEIGHT, BOARD_WIDTH, TETROMINOES, THEME_COLORS } from '../constants';

interface TetrisBoardProps {
  board: BoardMatrix;
  currentPiece: Tetromino | null;
  ghostY: number;
  stats: GameStats;
  onStartGame: () => void;
  onPauseToggle: () => void;
  particles: Particle[];
  setParticles: React.Dispatch<React.SetStateAction<Particle[]>>;
  theme: 'neon' | 'arcade' | 'candy';
}

export default function TetrisBoard({
  board,
  currentPiece,
  ghostY,
  stats,
  onStartGame,
  onPauseToggle,
  particles,
  setParticles,
  theme = 'neon',
}: TetrisBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [clearedText, setClearedText] = useState<string | null>(null);
  const prevLinesRef = useRef(stats.lines);

  // Trigger floating cartoon text on line clear (Highly satisfying for kids and seniors!)
  useEffect(() => {
    if (stats.lines > prevLinesRef.current) {
      const diff = stats.lines - prevLinesRef.current;
      let msg = '';
      if (diff === 1) msg = 'Nice Play! 👍';
      else if (diff === 2) msg = 'Double Spot! 🌟';
      else if (diff === 3) msg = 'Amazing! 🎉';
      else if (diff >= 4) msg = '💥 TETRIS! 💥';

      setClearedText(msg);
      const timer = setTimeout(() => setClearedText(null), 1200);
      prevLinesRef.current = stats.lines;
      return () => clearTimeout(timer);
    } else {
      prevLinesRef.current = stats.lines;
    }
  }, [stats.lines]);

  // Setup canvas drawing loop for smooth 60fps animations (grid effects, floating particle physics)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const blockWidth = canvas.width / BOARD_WIDTH;
    const blockHeight = canvas.height / BOARD_HEIGHT;

    const render = () => {
      // 1. Clear based on theme background
      if (theme === 'arcade') {
        ctx.fillStyle = '#000000'; // Retro arcade true black
      } else if (theme === 'candy') {
        ctx.fillStyle = '#0f172a'; // Deep cozy midnight blue
      } else {
        ctx.fillStyle = '#020617'; // Slate 950 for Cyber Neon
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw Ambient Grid lines
      if (theme === 'arcade') {
        ctx.strokeStyle = '#1e293b'; // Flat outline
      } else if (theme === 'candy') {
        ctx.strokeStyle = 'rgba(255, 182, 193, 0.15)'; // Playful pink tinted grids
      } else {
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)'; // Cyber Slate 800
      }
      
      ctx.lineWidth = 1;
      for (let x = 0; x <= BOARD_WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(x * blockWidth, 0);
        ctx.lineTo(x * blockWidth, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= BOARD_HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * blockHeight);
        ctx.lineTo(canvas.width, y * blockHeight);
        ctx.stroke();
      }

      // 3. Draw Settled Blocks with active theme colors
      for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
          const cell = board[y][x];
          if (cell) {
            const { color, glowColor } = THEME_COLORS[theme][cell];
            drawBlock(ctx, x, y, blockWidth, blockHeight, color, glowColor, false);
          }
        }
      }

      // 4. Draw Ghost Piece (where the piece will land)
      if (currentPiece && stats.hasStarted && !stats.isGameOver && !stats.isPaused) {
        const matrix = currentPiece.matrix;
        const posX = currentPiece.position.x;
        const themeDef = THEME_COLORS[theme][currentPiece.type];

        ctx.save();
        ctx.globalAlpha = theme === 'arcade' ? 0.4 : 0.25; // Translucent
        for (let r = 0; r < matrix.length; r++) {
          for (let c = 0; c < matrix[r].length; c++) {
            if (matrix[r][c]) {
              drawBlock(
                ctx,
                posX + c,
                ghostY + r,
                blockWidth,
                blockHeight,
                themeDef.color,
                themeDef.glowColor,
                true // Draw as outline only
              );
            }
          }
        }
        ctx.restore();
      }

      // 5. Draw Active Falling Piece
      if (currentPiece && stats.hasStarted && !stats.isGameOver && !stats.isPaused) {
        const matrix = currentPiece.matrix;
        const posX = currentPiece.position.x;
        const posY = currentPiece.position.y;
        const themeDef = THEME_COLORS[theme][currentPiece.type];

        for (let r = 0; r < matrix.length; r++) {
          for (let c = 0; c < matrix[r].length; c++) {
            if (matrix[r][c]) {
              drawBlock(
                ctx,
                posX + c,
                posY + r,
                blockWidth,
                blockHeight,
                themeDef.color,
                themeDef.glowColor,
                false
              );
            }
          }
        }
      }

      // 6. Update and Draw Particles
      updateAndDrawParticles(ctx, blockWidth, blockHeight);

      // Repeat frame
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [board, currentPiece, ghostY, stats, particles, theme]);

  // Rounded square blocks drawing helper with customizable themes
  const drawBlock = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    glowColor: string,
    outlineOnly: boolean
  ) => {
    if (y < 0) return;

    ctx.save();
    const padding = theme === 'arcade' ? 1.5 : 2;
    const rx = x * w + padding;
    const ry = y * h + padding;
    const rw = w - padding * 2;
    const rh = h - padding * 2;
    
    // Theme-based block rounding (Retro is sharp/flat, Candy is very round, Cyber is modern rounded)
    const radius = theme === 'arcade' ? 2 : theme === 'candy' ? 8 : 4.5;

    ctx.beginPath();
    ctx.roundRect(rx, ry, rw, rh, radius);

    if (outlineOnly) {
      ctx.strokeStyle = color;
      ctx.lineWidth = theme === 'arcade' ? 1.5 : 2.5;
      if (theme !== 'arcade') {
        ctx.setLineDash([4, 2]);
      }
      ctx.stroke();
    } else {
      if (theme === 'arcade') {
        // Pure classic flat arcade filling
        ctx.fillStyle = color;
        ctx.fill();
        // Bright interior highlight lines for classic 80s feel
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (theme === 'candy') {
        // High-shine glossy bubblegum candy blocks
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 6;
        
        const gradient = ctx.createRadialGradient(rx + rw * 0.3, ry + rh * 0.3, 1, rx + rw * 0.5, ry + rh * 0.5, rw);
        gradient.addColorStop(0, '#ffffff'); // Glossy highlight
        gradient.addColorStop(0.3, color);
        gradient.addColorStop(1, darkenColor(color, 35));

        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        // Cyber Neon gradient with outer glow
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 12;

        const gradient = ctx.createLinearGradient(rx, ry, rx, ry + rh);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.15, color);
        gradient.addColorStop(1, darkenColor(color, 45));

        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    ctx.restore();
  };

  // Hex shade helper
  const darkenColor = (hex: string, percent: number) => {
    let num = parseInt(hex.replace("#", ""), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) - amt,
      G = (num >> 8 & 0x00FF) - amt,
      B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R < 255 ? R < 0 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 0 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 0 ? 0 : B : 255)).toString(16).slice(1);
  };

  // Particles animator
  const updateAndDrawParticles = (ctx: CanvasRenderingContext2D, bw: number, bh: number) => {
    if (particles.length === 0) return;

    const nextParticles: Particle[] = [];

    particles.forEach(p => {
      // Apply forces
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08; // Small gravity pull
      p.alpha -= p.decay;

      if (p.alpha > 0) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        // Square or circle particles
        ctx.arc(p.x * bw, p.y * bh, p.size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();

        nextParticles.push(p);
      }
    });

    // Save alive particles
    // Note: React state is updated synchronously inside callbacks, but here we can manage it
    // asynchronously by setting it occasionally, or directly modifying ref to prevent re-triggering React loops
    setParticles(nextParticles);
  };

  return (
    <div id="tetris_grid_component" className={`relative border-2 rounded-2xl overflow-hidden flex items-center justify-center aspect-[1/2] w-full max-w-[340px] md:max-w-[360px] mx-auto transition-all duration-300 ${
      theme === 'candy'
        ? 'bg-slate-950 border-pink-500/30 shadow-[0_0_40px_rgba(244,63,94,0.15)]'
        : theme === 'arcade'
        ? 'bg-black border-slate-700 shadow-none'
        : 'bg-slate-950 border-slate-800 shadow-[0_0_40px_rgba(15,23,42,0.8)]'
    }`}>
      {/* Floating Milestone Text overlay for line clears */}
      <AnimatePresence>
        {clearedText && (
          <motion.div
            id="line_clear_floating_alert"
            initial={{ scale: 0.2, opacity: 0, y: 30, rotate: -5 }}
            animate={{ scale: [1.4, 1], opacity: 1, y: 0, rotate: 0 }}
            exit={{ scale: 1.4, opacity: 0, y: -50, rotate: 5 }}
            transition={{ type: 'spring', damping: 9, stiffness: 220 }}
            className={`absolute z-30 px-6 py-3 rounded-2xl select-none pointer-events-none text-center font-black uppercase tracking-wider shadow-2xl ${
              theme === 'candy'
                ? 'bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white text-xl border-2 border-white/40'
                : theme === 'arcade'
                ? 'bg-yellow-400 text-black text-2xl border-4 border-black font-sans tracking-tight'
                : 'bg-slate-900/90 border border-cyan-500/30 text-cyan-400 text-lg font-mono'
            }`}
          >
            {clearedText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2D Canvas for actual game graphics */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        width="360"
        height="720"
      />

      {/* Grid Border Accent Glow */}
      <div className="absolute inset-0 border border-cyan-500/10 pointer-events-none rounded-2xl"></div>

      {/* overlay: GAME START screen */}
      {!stats.hasStarted && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 text-center z-20">
          <div className="absolute top-8 text-xs font-mono tracking-[0.25em] text-cyan-500 animate-pulse">
            CYBER TETRIS v2.0
          </div>

          <div className="space-y-2 mb-8 mt-12">
            <h1 className="text-3xl font-extrabold font-sans tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-indigo-500">
              NEURAL GRID
            </h1>
            <p className="text-[11px] text-slate-400 font-mono tracking-wide max-w-[240px]">
              CLASSIC RETRO GAME PLAY POWERED BY COMPUTER VISION GESTURES
            </p>
          </div>

          <button
            id="start_game_btn"
            onClick={onStartGame}
            className="group flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold tracking-wider font-sans uppercase bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-400 hover:to-fuchsia-400 active:from-cyan-600 active:to-fuchsia-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Play className="h-4 w-4 fill-white" />
            Launch Matrix
          </button>
        </div>
      )}

      {/* overlay: GAME OVER screen */}
      {stats.isGameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md p-6 text-center z-20 animate-fade-in">
          <AlertTriangle className="h-12 w-12 text-rose-500 mb-4 animate-bounce" />
          <div className="space-y-1 mb-6">
            <h2 className="text-2xl font-black font-sans text-rose-500 tracking-wider">
              GRID COLLAPSED
            </h2>
            <p className="text-xs text-slate-400 font-mono">GAME OVER</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 w-full max-w-[220px] mb-8 space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Score:</span>
              <span className="text-cyan-400 font-bold">{stats.score}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Lines Cleared:</span>
              <span className="text-slate-200">{stats.lines}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Peak Level:</span>
              <span className="text-fuchsia-400">{stats.level}</span>
            </div>
          </div>

          <button
            id="retry_game_btn"
            onClick={onStartGame}
            className="flex items-center gap-2 px-5 py-3 rounded-lg text-xs font-bold tracking-wider font-sans uppercase bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 border border-slate-700 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reboot Matrix
          </button>
        </div>
      )}

      {/* overlay: PAUSED screen */}
      {stats.isPaused && stats.hasStarted && !stats.isGameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm p-6 text-center z-20">
          <Pause className="h-10 w-10 text-cyan-400 mb-3 animate-pulse" />
          <h2 className="text-xl font-black tracking-widest font-sans text-cyan-400 uppercase">
            MATRIX FROZEN
          </h2>
          <p className="text-[10px] text-slate-400 font-mono mt-1 mb-6">PRESS P OR PINCH TO RESUME</p>

          <button
            id="resume_game_btn"
            onClick={onPauseToggle}
            className="px-5 py-2.5 rounded-lg text-xs font-bold tracking-wider font-sans uppercase bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition"
          >
            Resume Grid
          </button>
        </div>
      )}
    </div>
  );
}
