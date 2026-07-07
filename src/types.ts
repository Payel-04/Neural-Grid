/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export type GridCell = TetrominoType | null;

export type BoardMatrix = GridCell[][];

export interface Point {
  x: number;
  y: number;
}

export interface Tetromino {
  type: TetrominoType;
  matrix: number[][];
  color: string;
  glowColor: string;
  position: Point;
}

export interface GameStats {
  score: number;
  highScore: number;
  level: number;
  lines: number;
  isGameOver: boolean;
  isPaused: boolean;
  hasStarted: boolean;
}

export interface GestureState {
  currentGesture: string;
  confidence: number;
  handDetected: boolean;
  xOffset: number; // -1 to 1 representing position relative to center
  yOffset: number; // -1 to 1 representing position relative to center
  rawX: number;
  rawY: number;
  isPinching: boolean;
  isFist: boolean;
  handX: number; // normalized wrist x
  handY: number; // normalized wrist y
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  level: number;
  lines: number;
  date: string;
}

export interface CalibrationData {
  centerX: number;
  centerY: number;
  pinchThreshold: number;
  fistThreshold: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  sensitivity: number; // 1 to 5
  cameraEnabled: boolean;
  mirrorCamera: boolean;
  gameMode: 'casual' | 'classic' | 'expert';
  visualTheme: 'neon' | 'arcade' | 'candy';
  voiceAssist: boolean;
  gestureControls: {
    moveLeft: string;
    moveRight: string;
    rotate: string;
    drop: string;
  };
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  decay: number;
}

export interface GameHistoryRecord {
  id: string;
  playerName: string;
  score: number;
  lines: number;
  level: number;
  gameMode: 'casual' | 'classic' | 'expert';
  visualTheme: 'neon' | 'arcade' | 'candy';
  date: string;
}

