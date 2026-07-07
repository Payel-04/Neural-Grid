/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, ArrowRight, RotateCw, ArrowDown, Hand, RefreshCcw, ArrowUp } from 'lucide-react';
import { GestureState } from '../types';

interface GestureGuidesProps {
  currentGesture: GestureState;
}

export default function GestureGuides({ currentGesture }: GestureGuidesProps) {
  const guides = [
    {
      id: 'left',
      name: 'Slide Left',
      gesture: 'Steer Left',
      icon: <ArrowLeft className="h-4 w-4" />,
      colorClass: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5',
      glowClass: 'shadow-[0_0_15px_rgba(34,197,94,0.3)] border-emerald-400 bg-emerald-500/10',
      instruction: 'Move palm LEFT of center anchor',
      tip: 'The farther left you go, the faster it slides.',
    },
    {
      id: 'right',
      name: 'Slide Right',
      gesture: 'Steer Right',
      icon: <ArrowRight className="h-4 w-4" />,
      colorClass: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5',
      glowClass: 'shadow-[0_0_15px_rgba(34,197,94,0.3)] border-emerald-400 bg-emerald-500/10',
      instruction: 'Move palm RIGHT of center anchor',
      tip: 'The farther right you go, the faster it slides.',
    },
    {
      id: 'rotate',
      name: 'Rotate Block',
      gesture: 'Pinch (Rotate)',
      icon: <RotateCw className="h-4 w-4 animate-spin-slow" />,
      colorClass: 'border-purple-500/30 text-purple-400 bg-purple-500/5',
      glowClass: 'shadow-[0_0_15px_rgba(168,85,247,0.3)] border-purple-400 bg-purple-500/10',
      instruction: 'Pinch THUMB & INDEX fingertip together',
      tip: 'Pinch briefly to rotate 90 degrees clockwise.',
    },
    {
      id: 'drop',
      name: 'Hard Drop',
      gesture: 'Closed Fist (Drop)',
      icon: <ArrowDown className="h-4 w-4 animate-bounce" />,
      colorClass: 'border-rose-500/30 text-rose-400 bg-rose-500/5',
      glowClass: 'shadow-[0_0_15px_rgba(239,68,68,0.3)] border-rose-400 bg-rose-500/10',
      instruction: 'Make a tight CLOSED FIST',
      tip: 'Hold a fist to drop blocks down instantly.',
    },
    {
      id: 'hold',
      name: 'Hold / Swap Piece',
      gesture: 'Raise Hand (Hold)',
      icon: <RefreshCcw className="h-4 w-4" />,
      colorClass: 'border-orange-500/30 text-orange-400 bg-orange-500/5',
      glowClass: 'shadow-[0_0_15px_rgba(249,115,22,0.3)] border-orange-400 bg-orange-500/10',
      instruction: 'Raise hand HIGH above center anchor',
      tip: 'Swap active piece. Key: C or Shift (Once per turn)',
    },
  ];

  return (
    <div id="gesture_guides_component" className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl h-full">
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Hand className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-semibold tracking-wide text-slate-200 uppercase font-sans">
            Gesture Training Center
          </h2>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-500">
          <span>ACTIVE:</span>
          <span className={`font-bold uppercase ${currentGesture.handDetected ? 'text-emerald-400' : 'text-slate-500'}`}>
            {currentGesture.handDetected ? 'Hand Tracked' : 'No Hand'}
          </span>
        </div>
      </div>

      {/* Guide Cards */}
      <div className="p-4 grid grid-cols-1 gap-2.5 flex-1 overflow-y-auto max-h-[300px] md:max-h-none">
        {guides.map((item) => {
          const isActive = currentGesture.handDetected && currentGesture.currentGesture === item.gesture;

          return (
            <div
              key={item.id}
              className={`flex items-start gap-3.5 p-3 rounded-xl border transition-all duration-200 leading-relaxed ${
                isActive ? item.glowClass : 'bg-slate-950/20 border-slate-800/80 text-slate-300'
              }`}
            >
              {/* Icon Container */}
              <div
                className={`flex items-center justify-center h-8 w-8 rounded-lg border shrink-0 transition-colors ${
                  isActive 
                    ? 'bg-white text-slate-950 border-white' 
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {item.icon}
              </div>

              {/* Text Info */}
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold font-sans tracking-wide ${isActive ? 'text-white' : 'text-slate-200'}`}>
                    {item.name}
                  </span>
                  {isActive && (
                    <span className="text-[9px] font-mono font-black tracking-widest text-white animate-pulse">
                      DETECTOR CAPTURED
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-mono leading-normal">
                  {item.instruction}
                </p>
                <p className="text-[9px] text-slate-500 font-sans italic pt-0.5">
                  {item.tip}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Calibration feedback bar */}
      <div className="p-3 bg-slate-950/40 border-t border-slate-800/60 flex items-center justify-between text-[9px] font-mono text-slate-500">
        <div className="flex gap-4">
          <span>Pinch Raw: <span className={currentGesture.isPinching ? 'text-purple-400 font-bold' : 'text-slate-500'}>
            {currentGesture.isPinching ? 'Pinch!' : 'No'}
          </span></span>
          <span>Fist Raw: <span className={currentGesture.isFist ? 'text-rose-400 font-bold' : 'text-slate-500'}>
            {currentGesture.isFist ? 'Fist!' : 'No'}
          </span></span>
        </div>
        <span>1:1 CAMERA SYNC</span>
      </div>
    </div>
  );
}
