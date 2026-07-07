/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sliders, Volume2, VolumeX, Music, Music2, Video, VideoOff, FlipHorizontal, Eye, HelpCircle } from 'lucide-react';
import { GameSettings } from '../types';

interface SettingsPanelProps {
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
}

export default function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const toggleSound = () => {
    onSettingsChange({
      ...settings,
      soundEnabled: !settings.soundEnabled,
    });
  };

  const toggleMusic = () => {
    onSettingsChange({
      ...settings,
      musicEnabled: !settings.musicEnabled,
    });
  };

  const toggleCamera = () => {
    onSettingsChange({
      ...settings,
      cameraEnabled: !settings.cameraEnabled,
    });
  };

  const toggleMirror = () => {
    onSettingsChange({
      ...settings,
      mirrorCamera: !settings.mirrorCamera,
    });
  };

  const handleSensitivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({
      ...settings,
      sensitivity: parseInt(e.target.value, 10),
    });
  };

  return (
    <div id="settings_component_container" className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl h-full">
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-semibold tracking-wide text-slate-200 uppercase font-sans">
            Control Console
          </h2>
        </div>
        <span className="font-mono text-[9px] text-slate-500">v2.0</span>
      </div>

      {/* Settings Options */}
      <div className="p-5 space-y-5 flex-1 overflow-y-auto">
        {/* Game Mode selection */}
        <div className="space-y-2 pb-4 border-b border-slate-800/60">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">Game Mode Speed</label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['casual', 'classic', 'expert'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onSettingsChange({ ...settings, gameMode: mode })}
                className={`py-2 px-1 rounded-xl text-[10px] font-mono font-bold uppercase border transition cursor-pointer ${
                  settings.gameMode === mode
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-950 text-slate-500 border-slate-900 hover:text-slate-400'
                }`}
              >
                {mode === 'casual' ? '👶 Casual' : mode === 'classic' ? '🕹️ Classic' : '⚡ Expert'}
              </button>
            ))}
          </div>
          <span className="text-[9px] text-slate-500 font-mono block">
            {settings.gameMode === 'casual' && "• Slower constant speed, perfect for kids & seniors."}
            {settings.gameMode === 'classic' && "• Standard speeds, increases level by level."}
            {settings.gameMode === 'expert' && "• Fast play! Starts at Level 5."}
          </span>
        </div>

        {/* Visual Theme Selection */}
        <div className="space-y-2 pb-4 border-b border-slate-800/60">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">Visual Theme</label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['neon', 'arcade', 'candy'] as const).map((t) => (
              <button
                key={t}
                onClick={() => onSettingsChange({ ...settings, visualTheme: t })}
                className={`py-2 px-1 rounded-xl text-[10px] font-mono font-bold uppercase border transition cursor-pointer ${
                  settings.visualTheme === t
                    ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/40 shadow-[0_0_8px_rgba(217,70,239,0.15)]'
                    : 'bg-slate-950 text-slate-500 border-slate-900 hover:text-slate-400'
                }`}
              >
                {t === 'neon' ? '🌌 Neon' : t === 'arcade' ? '👾 Retro' : '🍬 Candy'}
              </button>
            ))}
          </div>
          <span className="text-[9px] text-slate-500 font-mono block">
            {settings.visualTheme === 'neon' && "• Fluorescent space glowing blocks."}
            {settings.visualTheme === 'arcade' && "• 1980s flat bold colors & crisp edges."}
            {settings.visualTheme === 'candy' && "• Sweet glossy round bubbles."}
          </span>
        </div>

        {/* Voice Assistant Toggle */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
          <div className="space-y-0.5">
            <label className="text-xs font-bold text-slate-200 font-sans block">Voice Companion</label>
            <span className="text-[10px] text-slate-400 font-mono block">Speak encouragement & state cues</span>
          </div>
          <button
            id="toggle_voice_btn"
            onClick={() => onSettingsChange({ ...settings, voiceAssist: !settings.voiceAssist })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition ${
              settings.voiceAssist
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-400'
            }`}
          >
            {settings.voiceAssist ? 'ENABLED' : 'MUTED'}
          </button>
        </div>

        {/* Webcam hardware toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-xs font-bold text-slate-200 font-sans block">AI Webcam Detection</label>
            <span className="text-[10px] text-slate-400 font-mono block">Enable camera hand tracking</span>
          </div>
          <button
            id="toggle_camera_btn"
            onClick={toggleCamera}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition ${
              settings.cameraEnabled
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20'
                : 'bg-slate-950 text-slate-500 border border-slate-800 hover:text-slate-400'
            }`}
          >
            {settings.cameraEnabled ? (
              <>
                <Video className="h-3.5 w-3.5" />
                ACTIVE
              </>
            ) : (
              <>
                <VideoOff className="h-3.5 w-3.5" />
                MUTED
              </>
            )}
          </button>
        </div>

        {/* Camera Mirroring toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-xs font-bold text-slate-200 font-sans block">Mirror Image</label>
            <span className="text-[10px] text-slate-400 font-mono block">Match screen coordinates to body</span>
          </div>
          <button
            id="toggle_mirror_btn"
            disabled={!settings.cameraEnabled}
            onClick={toggleMirror}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition disabled:opacity-30 disabled:cursor-not-allowed ${
              settings.mirrorCamera
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20'
                : 'bg-slate-950 text-slate-500 border border-slate-800 hover:text-slate-400'
            }`}
          >
            <FlipHorizontal className="h-3.5 w-3.5" />
            {settings.mirrorCamera ? 'MIRRORED' : 'STANDARD'}
          </button>
        </div>

        {/* Dynamic sensitivity tuning */}
        <div className="space-y-2 border-t border-slate-800/60 pt-4">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-slate-200 font-sans block">Hand Sensitivity</label>
              <span className="text-[10px] text-slate-400 font-mono block">Adjust gesture trigger distance</span>
            </div>
            <span className="font-mono text-xs text-cyan-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              Lvl {settings.sensitivity}
            </span>
          </div>
          <input
            id="sensitivity_slider"
            type="range"
            min="1"
            max="5"
            value={settings.sensitivity}
            onChange={handleSensitivityChange}
            className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[8px] font-mono text-slate-500">
            <span>STABLE (1)</span>
            <span>STANDARD (3)</span>
            <span>RAPID (5)</span>
          </div>
        </div>

        {/* Audio settings */}
        <div className="space-y-3.5 border-t border-slate-800/60 pt-4">
          {/* Sound FX */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-slate-200 font-sans block">Sound Effects</label>
              <span className="text-[10px] text-slate-400 font-mono block">Arcade beep/blast audio cues</span>
            </div>
            <button
              id="toggle_sound_btn"
              onClick={toggleSound}
              className={`p-2 rounded-lg border transition ${
                settings.soundEnabled
                  ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20 hover:bg-fuchsia-500/20'
                  : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-400'
              }`}
            >
              {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>

          {/* Synth Ambient Music */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-slate-200 font-sans block">Synthwave Music</label>
              <span className="text-[10px] text-slate-400 font-mono block">Live synthesized background loop</span>
            </div>
            <button
              id="toggle_music_btn"
              onClick={toggleMusic}
              className={`p-2 rounded-lg border transition ${
                settings.musicEnabled
                  ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20 hover:bg-fuchsia-500/20'
                  : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-400'
              }`}
            >
              {settings.musicEnabled ? <Music className="h-4 w-4 text-fuchsia-400 animate-pulse" /> : <Music2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard guide footer */}
      <div className="p-3.5 bg-slate-950 border-t border-slate-800/60 text-[9px] font-mono text-slate-500 space-y-1">
        <div className="flex items-center gap-1 text-slate-400 font-bold">
          <HelpCircle className="h-3 w-3" />
          <span>KEYBOARD OVERRIDES</span>
        </div>
        <p className="leading-relaxed">
          [Left/A] [Right/D] to Slide • [Up/W] to Rotate • [Down/S] Soft Drop • [Space] Hard Drop • [P] Pause Game
        </p>
      </div>
    </div>
  );
}
