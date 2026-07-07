/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Flame, Calendar, Trash2, Check } from 'lucide-react';
import { LeaderboardEntry } from '../types';

interface LeaderboardProps {
  currentScore: number;
  level: number;
  lines: number;
  isGameOver: boolean;
  onScoreSubmitted: () => void;
  defaultPlayerName: string;
}

const LOCAL_STORAGE_KEY = 'cyber_tetris_leaderboard';

const DEFAULT_SCORES: LeaderboardEntry[] = [
  { name: 'TRON_BOT', score: 12500, level: 8, lines: 42, date: '2026-06-25' },
  { name: 'NEON_SAMURAI', score: 9800, level: 6, lines: 31, date: '2026-06-28' },
  { name: 'GLITCH_CHAMP', score: 7500, level: 5, lines: 25, date: '2026-06-30' },
  { name: 'PIXEL_PIONEER', score: 4200, level: 3, lines: 15, date: '2026-07-01' },
];

export default function Leaderboard({
  currentScore,
  level,
  lines,
  isGameOver,
  onScoreSubmitted,
  defaultPlayerName,
}: LeaderboardProps) {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [playerName, setPlayerName] = useState(defaultPlayerName);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isQualified, setIsQualified] = useState(false);

  // Keep state synced with outer player name prop
  useEffect(() => {
    if (defaultPlayerName) {
      setPlayerName(defaultPlayerName);
    }
  }, [defaultPlayerName]);

  // Load scores
  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setScores(parsed);
      } catch (e) {
        setScores(DEFAULT_SCORES);
      }
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_SCORES));
      setScores(DEFAULT_SCORES);
    }
  }, []);

  // Check if player qualifies for a high score when game ends
  useEffect(() => {
    if (isGameOver && currentScore > 0) {
      setHasSubmitted(false);
      // Qualifies if leaderboard has fewer than 8 entries, or score exceeds the lowest score
      const isTop = scores.length < 8 || currentScore > (scores[scores.length - 1]?.score || 0);
      setIsQualified(isTop);
    } else {
      setIsQualified(false);
    }
  }, [isGameOver, currentScore, scores]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || currentScore === 0) return;

    const newEntry: LeaderboardEntry = {
      name: playerName.trim().toUpperCase().substring(0, 12),
      score: currentScore,
      level,
      lines,
      date: new Date().toISOString().split('T')[0],
    };

    const updated = [...scores, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 8); // Keep top 8 scores

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    setScores(updated);
    setHasSubmitted(true);
    setPlayerName('');
    onScoreSubmitted();
  };

  const clearLeaderboard = () => {
    if (confirm('Are you sure you want to reset the neural high scores database?')) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
      setScores([]);
    }
  };

  return (
    <div id="leaderboard_component_container" className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl h-full">
      {/* Title */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-semibold tracking-wide text-slate-200 uppercase font-sans">
            Neural Leaderboard
          </h2>
        </div>
        {scores.length > 0 && (
          <button
            id="clear_leaderboard_btn"
            onClick={clearLeaderboard}
            title="Reset Board"
            className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Leaderboard content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[300px] md:max-h-none">
        {/* Submission form if qualified */}
        {isGameOver && isQualified && !hasSubmitted && (
          <div className="bg-gradient-to-br from-cyan-950/40 to-fuchsia-950/40 border border-cyan-500/30 rounded-xl p-4 animate-pulse-faint">
            <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-mono font-bold mb-2">
              <Flame className="h-4 w-4 text-fuchsia-400" />
              NEW HIGH RECORD QUALIFIED!
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                id="leaderboard_name_input"
                type="text"
                maxLength={12}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="INPUT PILOT ID..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono tracking-wider text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                required
              />
              <button
                id="submit_score_btn"
                type="submit"
                className="flex items-center justify-center h-8 w-8 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
              >
                <Check className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        {hasSubmitted && (
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 text-center text-xs font-mono text-emerald-400">
            SCORE REGISTERED SUCCESSFULLY!
          </div>
        )}

        {scores.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-slate-500 font-mono">GRID DATABASE IS EMPTY</p>
            <p className="text-[10px] text-slate-600 font-sans mt-1">Start playing to establish coordinates!</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {scores.map((entry, index) => {
              const isTop3 = index < 3;
              const placeColors = [
                'text-amber-400 bg-amber-500/10 border-amber-500/20',
                'text-slate-300 bg-slate-400/10 border-slate-400/20',
                'text-amber-600 bg-amber-700/10 border-amber-700/20',
              ];

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-2.5 rounded-xl border border-slate-800/60 bg-slate-950/30 hover:bg-slate-950/60 transition duration-150`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div
                      className={`flex items-center justify-center h-5 w-5 rounded text-[10px] font-mono font-bold border ${
                        isTop3 ? placeColors[index] : 'text-slate-500 bg-slate-900 border-slate-800'
                      }`}
                    >
                      {index + 1}
                    </div>
                    {/* Player Name */}
                    <span className="text-xs font-mono font-bold tracking-wider text-slate-200">
                      {entry.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 font-mono text-[11px]">
                    <div className="text-slate-500 text-right hidden sm:block">
                      Lvl <span className="text-slate-400">{entry.level}</span>
                    </div>
                    <div className="text-slate-500 text-right hidden sm:block">
                      Lines <span className="text-slate-400">{entry.lines}</span>
                    </div>
                    {/* Score */}
                    <div className="text-cyan-400 font-black text-right font-mono min-w-[55px]">
                      {entry.score.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Small metadata footer */}
      <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/30 text-[9px] text-slate-600 flex items-center justify-between font-mono">
        <span>GRID SECURE</span>
        <span>LOCAL PERSISTENCE ENGINE</span>
      </div>
    </div>
  );
}
