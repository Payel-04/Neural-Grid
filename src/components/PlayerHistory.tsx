/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Clock, BarChart2, Trash2, Check, Award, History, Edit2 } from 'lucide-react';
import { GameHistoryRecord } from '../types';

interface PlayerHistoryProps {
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  history: GameHistoryRecord[];
  onClearHistory: () => void;
  theme: 'neon' | 'arcade' | 'candy';
}

export default function PlayerHistory({
  playerName,
  onPlayerNameChange,
  history,
  onClearHistory,
  theme = 'neon',
}: PlayerHistoryProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(playerName);

  const handleSaveName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = editName.trim().toUpperCase().substring(0, 12);
    if (cleanName) {
      onPlayerNameChange(cleanName);
      setIsEditing(false);
    }
  };

  // Compute Career Stats
  const gamesPlayed = history.length;
  const careerHighScore = history.reduce((max, game) => Math.max(max, game.score), 0);
  const totalLinesCleared = history.reduce((sum, game) => sum + game.lines, 0);
  const avgLevel = gamesPlayed > 0 
    ? Math.round((history.reduce((sum, game) => sum + game.level, 0) / gamesPlayed) * 10) / 10
    : 0;

  // The very last game played (most recent in chronological list)
  const previousGame = history[0] || null;

  const getThemeClass = (type: 'btn-primary' | 'card' | 'badge' | 'text-accent' | 'border-accent') => {
    if (theme === 'arcade') {
      switch (type) {
        case 'btn-primary': return 'bg-yellow-400 hover:bg-yellow-350 text-black border-2 border-black font-sans font-bold';
        case 'card': return 'bg-black border-slate-700 border-2';
        case 'badge': return 'bg-slate-800 text-slate-300 border-slate-600';
        case 'text-accent': return 'text-yellow-400';
        case 'border-accent': return 'border-yellow-400/40';
      }
    } else if (theme === 'candy') {
      switch (type) {
        case 'btn-primary': return 'bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-400 hover:to-fuchsia-400 text-white shadow-md';
        case 'card': return 'bg-slate-950/40 border-pink-500/10 border backdrop-blur-sm';
        case 'badge': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
        case 'text-accent': return 'text-pink-500';
        case 'border-accent': return 'border-pink-500/30';
      }
    } else {
      // Default Cyber Neon
      switch (type) {
        case 'btn-primary': return 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]';
        case 'card': return 'bg-slate-950/60 border-slate-850 border shadow-lg backdrop-blur-sm';
        case 'badge': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
        case 'text-accent': return 'text-cyan-400';
        case 'border-accent': return 'border-cyan-500/30';
      }
    }
  };

  return (
    <div id="player_history_tab_panel" className="flex flex-col gap-4 animate-fade-in select-none">
      
      {/* SECTION 1: Active Player Profile */}
      <div className={`p-4 rounded-xl ${getThemeClass('card')}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <User className={`h-4.5 w-4.5 ${getThemeClass('text-accent')}`} />
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Pilot Profile</span>
          </div>
          {!isEditing && (
            <button
              id="edit_pilot_name_btn"
              onClick={() => {
                setEditName(playerName);
                setIsEditing(true);
              }}
              className="p-1 rounded text-slate-500 hover:text-slate-300 transition"
              title="Edit Pilot ID"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveName} className="flex gap-2">
            <input
              id="edit_profile_name_input"
              type="text"
              maxLength={12}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-xs font-mono tracking-wider text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
              placeholder="PILOT ID..."
              required
              autoFocus
            />
            <button
              id="save_profile_name_btn"
              type="submit"
              className={`flex items-center justify-center h-7 w-7 rounded-lg ${getThemeClass('btn-primary')} transition-colors`}
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-sm font-mono font-black tracking-widest text-slate-100">
              {playerName}
            </div>
            <span className={`text-[9px] font-mono border px-2 py-0.5 rounded-full ${getThemeClass('badge')}`}>
              ACTIVE PILOT
            </span>
          </div>
        )}
      </div>

      {/* SECTION 2: Career Statistics Summary */}
      <div className={`p-4 rounded-xl ${getThemeClass('card')} space-y-3`}>
        <div className="flex items-center gap-2">
          <BarChart2 className={`h-4.5 w-4.5 ${getThemeClass('text-accent')}`} />
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Neural Career Stats</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950/40 border border-slate-900 rounded-lg p-2.5">
            <span className="text-[8px] font-mono text-slate-500 uppercase block leading-tight">Career Peak</span>
            <span className="text-sm font-mono font-black text-amber-400 mt-1 block">
              {careerHighScore.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-950/40 border border-slate-900 rounded-lg p-2.5">
            <span className="text-[8px] font-mono text-slate-500 uppercase block leading-tight">Missions Played</span>
            <span className="text-sm font-mono font-black text-slate-200 mt-1 block">
              {gamesPlayed}
            </span>
          </div>
          <div className="bg-slate-950/40 border border-slate-900 rounded-lg p-2.5">
            <span className="text-[8px] font-mono text-slate-500 uppercase block leading-tight">Total Lines Cleared</span>
            <span className="text-sm font-mono font-black text-emerald-400 mt-1 block">
              {totalLinesCleared}
            </span>
          </div>
          <div className="bg-slate-950/40 border border-slate-900 rounded-lg p-2.5">
            <span className="text-[8px] font-mono text-slate-500 uppercase block leading-tight">Average Level Reach</span>
            <span className="text-sm font-mono font-black text-fuchsia-400 mt-1 block">
              {avgLevel > 0 ? `Lvl ${avgLevel}` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 3: Previous Game Summary */}
      <div className={`p-4 rounded-xl ${getThemeClass('card')} space-y-2`}>
        <div className="flex items-center gap-2">
          <Clock className={`h-4.5 w-4.5 ${getThemeClass('text-accent')}`} />
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Previous Mission Details</span>
        </div>

        {previousGame ? (
          <div className="bg-slate-950/50 border border-slate-900 rounded-lg p-3 space-y-2 font-mono">
            <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-900 pb-1.5 mb-1.5">
              <span>PILOT: {previousGame.playerName}</span>
              <span>{previousGame.date}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="space-y-0.5">
                <span className="text-[8px] text-slate-500 uppercase block">Score</span>
                <span className="text-xs font-bold text-cyan-400">{previousGame.score.toLocaleString()}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] text-slate-500 uppercase block">Lines</span>
                <span className="text-xs font-bold text-emerald-400">{previousGame.lines}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] text-slate-500 uppercase block">Level reached</span>
                <span className="text-xs font-bold text-fuchsia-400">{previousGame.level}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[8.5px] text-slate-500 mt-1.5 pt-1.5 border-t border-slate-900">
              <span>MODE: <span className="text-slate-400 font-bold uppercase">{previousGame.gameMode}</span></span>
              <span>THEME: <span className="text-slate-400 font-bold uppercase">{previousGame.visualTheme}</span></span>
            </div>
          </div>
        ) : (
          <div className="text-center py-5 bg-slate-950/20 border border-dashed border-slate-900 rounded-lg">
            <p className="text-[9px] text-slate-600 font-mono">NO MISSION COORDINATES IN RECORD</p>
            <p className="text-[8px] text-slate-700 font-sans mt-0.5">Launch a matrix game first to record telemetry!</p>
          </div>
        )}
      </div>

      {/* SECTION 4: Chronological History Log */}
      <div className={`p-4 rounded-xl ${getThemeClass('card')} flex-1 flex flex-col min-h-[160px]`}>
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <History className={`h-4.5 w-4.5 ${getThemeClass('text-accent')}`} />
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Mission Log History</span>
          </div>
          {gamesPlayed > 0 && (
            <button
              id="clear_history_log_btn"
              onClick={onClearHistory}
              className="text-[9px] font-mono text-rose-500 hover:text-rose-400 transition flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
              <span>CLEAR LOG</span>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto max-h-[180px] space-y-1.5 pr-1">
          {history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[9px] text-slate-600 font-mono">LOG REGISTER EMPTY</p>
            </div>
          ) : (
            history.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-2 rounded-lg border border-slate-900/40 bg-slate-950/40 hover:bg-slate-950/60 transition"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-200">{record.playerName}</span>
                    <span className="text-[8px] font-mono text-slate-500">{record.date}</span>
                  </div>
                  <div className="flex gap-2 text-[8px] font-mono text-slate-500 uppercase">
                    <span>Lvl {record.level}</span>
                    <span>•</span>
                    <span>{record.lines} lines</span>
                    <span>•</span>
                    <span>{record.gameMode}</span>
                  </div>
                </div>

                <div className="text-xs font-mono font-black text-cyan-400">
                  {record.score.toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
