/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TetrominoType } from './types';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const TETROMINOES: Record<TetrominoType, { matrix: number[][]; color: string; glowColor: string }> = {
  I: {
    matrix: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#00f0f0', // Neon Cyan
    glowColor: 'rgba(0, 240, 240, 0.8)',
  },
  O: {
    matrix: [
      [1, 1],
      [1, 1],
    ],
    color: '#f0f000', // Neon Yellow
    glowColor: 'rgba(240, 240, 0, 0.8)',
  },
  T: {
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#a000f0', // Neon Purple
    glowColor: 'rgba(160, 0, 240, 0.8)',
  },
  S: {
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '#00f000', // Neon Green
    glowColor: 'rgba(0, 240, 0, 0.8)',
  },
  Z: {
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '#f00000', // Neon Red
    glowColor: 'rgba(240, 0, 0, 0.8)',
  },
  J: {
    matrix: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#0000f0', // Neon Blue
    glowColor: 'rgba(0, 0, 240, 0.8)',
  },
  L: {
    matrix: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#f0a000', // Neon Orange
    glowColor: 'rgba(240, 160, 0, 0.8)',
  },
};

export const LEVEL_SPEEDS: Record<number, number> = {
  1: 1000,
  2: 850,
  3: 700,
  4: 550,
  5: 450,
  6: 380,
  7: 300,
  8: 220,
  9: 150,
  10: 100,
};

export const LINE_POINTS = [0, 100, 300, 500, 800]; // 0, 1, 2, 3, 4 lines cleared

export const DEFAULT_CALIBRATION = {
  centerX: 0.5,
  centerY: 0.5,
  pinchThreshold: 0.04, // distance between thumb & index tip below this triggers pinch
  fistThreshold: 0.08,  // average distance of finger tips to palm below this triggers fist
};

export const THEME_COLORS: Record<'neon' | 'arcade' | 'candy', Record<TetrominoType, { color: string; glowColor: string }>> = {
  neon: {
    I: { color: '#00f0f0', glowColor: 'rgba(0, 240, 240, 0.8)' },
    O: { color: '#f0f000', glowColor: 'rgba(240, 240, 0, 0.8)' },
    T: { color: '#a000f0', glowColor: 'rgba(160, 0, 240, 0.8)' },
    S: { color: '#00f000', glowColor: 'rgba(0, 240, 0, 0.8)' },
    Z: { color: '#f00000', glowColor: 'rgba(240, 0, 0, 0.8)' },
    J: { color: '#0000f0', glowColor: 'rgba(0, 0, 240, 0.8)' },
    L: { color: '#f0a000', glowColor: 'rgba(240, 160, 0, 0.8)' },
  },
  arcade: {
    I: { color: '#ef4444', glowColor: 'rgba(239, 68, 68, 0.2)' }, // Pure red
    O: { color: '#3b82f6', glowColor: 'rgba(59, 130, 246, 0.2)' }, // Pure blue
    T: { color: '#eab308', glowColor: 'rgba(234, 179, 8, 0.2)' },  // Pure yellow
    S: { color: '#22c55e', glowColor: 'rgba(34, 197, 94, 0.2)' },  // Pure green
    Z: { color: '#a855f7', glowColor: 'rgba(168, 85, 247, 0.2)' },  // Pure purple
    J: { color: '#f97316', glowColor: 'rgba(249, 115, 22, 0.2)' },  // Pure orange
    L: { color: '#06b6d4', glowColor: 'rgba(6, 182, 212, 0.2)' },  // Cyan
  },
  candy: {
    I: { color: '#ff7eb9', glowColor: 'rgba(255, 126, 185, 0.6)' }, // Cotton Candy Pink
    O: { color: '#ffc107', glowColor: 'rgba(255, 193, 7, 0.6)' },   // Sweet Honey Yellow
    T: { color: '#bf5af2', glowColor: 'rgba(191, 90, 242, 0.6)' },  // Magic Grape Purple
    S: { color: '#30d158', glowColor: 'rgba(48, 209, 88, 0.6)' },   // Apple Candy Green
    Z: { color: '#ff453a', glowColor: 'rgba(255, 69, 58, 0.6)' },   // Strawberry Red
    J: { color: '#64d2ff', glowColor: 'rgba(100, 210, 255, 0.6)' }, // Bubblegum Blue
    L: { color: '#ff9f0a', glowColor: 'rgba(255, 159, 10, 0.6)' },  // Sweet Orange
  },
};

export const DEFAULT_SETTINGS = {
  soundEnabled: true,
  musicEnabled: false,
  sensitivity: 3, // 1 to 5
  cameraEnabled: true,
  mirrorCamera: true,
  gameMode: 'classic' as const, // classic, casual, expert
  visualTheme: 'neon' as const, // neon, arcade, candy
  voiceAssist: false,
  gestureControls: {
    moveLeft: 'Hand in Left Zone',
    moveRight: 'Hand in Right Zone',
    rotate: 'Pinch (Thumb + Index)',
    drop: 'Closed Fist (Hold to drop)',
  },
};
