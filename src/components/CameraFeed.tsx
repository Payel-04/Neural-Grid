/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RefreshCw, Sliders, ShieldAlert, CheckCircle, VideoOff } from 'lucide-react';
import { CalibrationData, GameSettings, GestureState } from '../types';
import { DEFAULT_CALIBRATION } from '../constants';

interface CameraFeedProps {
  onGestureChange: (gesture: GestureState) => void;
  calibration: CalibrationData;
  onCalibrationChange: (cal: CalibrationData) => void;
  settings: GameSettings;
}

export default function CameraFeed({
  onGestureChange,
  calibration,
  onCalibrationChange,
  settings,
}: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activeGesture, setActiveGesture] = useState<string>('Neutral');
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationCountdown, setCalibrationCountdown] = useState<number | null>(null);
  const [calibrationSamples, setCalibrationSamples] = useState<{ x: number; y: number }[]>([]);

  // Sound effects feedback for pinch/fist
  const lastGestureRef = useRef<string>('Neutral');

  // Trigger gesture updates
  const updateGestureState = (state: GestureState) => {
    onGestureChange(state);
    setActiveGesture(state.currentGesture);
  };

  useEffect(() => {
    let active = true;
    let isDestroyed = false;
    let checkInterval: any;

    const initMediaPipe = () => {
      const win = window as any;
      if (!win.Hands) {
        // MediaPipe scripts might still be loading, retry in 500ms
        checkInterval = setTimeout(initMediaPipe, 500);
        return;
      }

      try {
        if (!settings.cameraEnabled) {
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setCameraError(null);

        // Guard against Emscripten/Vite arguments collision error
        if (win.arguments !== undefined) {
          try {
            delete win.arguments;
          } catch (e) {
            win.arguments = undefined;
          }
        }

        // Initialize MediaPipe Hands with stable standard CDN assets
        const hands = new win.Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.65,
          minTrackingConfidence: 0.65,
        });

        hands.onResults((results: any) => {
          if (!isDestroyed && active) {
            onResults(results);
          }
        });
        handsRef.current = hands;

        // Initialize Webcam Stream via standard getUserMedia (More robust than win.Camera)
        if (videoRef.current) {
          navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 480 },
              height: { ideal: 360 },
              facingMode: 'user'
            },
            audio: false
          })
          .then((stream) => {
            if (!active || isDestroyed) {
              stream.getTracks().forEach(track => track.stop());
              return;
            }

            streamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              
              // Ensure video plays smoothly
              videoRef.current.onloadedmetadata = () => {
                if (!active || isDestroyed) return;
                videoRef.current?.play()
                  .then(() => {
                    if (active && !isDestroyed) setIsLoading(false);
                  })
                  .catch((playErr) => {
                    console.error("Camera video play failed:", playErr);
                    if (active && !isDestroyed) setIsLoading(false); // resolve loading anyway
                  });
              };
            }

            // Start standard requestAnimationFrame processing loop
            let lastProcessTime = 0;
            const processFrame = async () => {
              if (isDestroyed || !active) return;
              if (!settings.cameraEnabled) return;

              const now = performance.now();
              // Cap processing to ~30 FPS to prevent overheating/high CPU
              if (now - lastProcessTime >= 33) {
                if (videoRef.current && videoRef.current.readyState >= 2 && handsRef.current) {
                  try {
                    await handsRef.current.send({ image: videoRef.current });
                    lastProcessTime = now;
                  } catch (err) {
                    // Ignore frame-skip or initialization errors gracefully
                  }
                }
              }
              requestAnimationFrame(processFrame);
            };
            requestAnimationFrame(processFrame);
          })
          .catch((err: any) => {
            console.error("Native webcam stream acquisition failed:", err);
            if (active && !isDestroyed) {
              setCameraError("Webcam access denied or blocked by iframe permissions. Keyboard controls are active!");
              setIsLoading(false);
            }
          });
        }
      } catch (err: any) {
        console.error("MediaPipe initialization failed:", err);
        if (active && !isDestroyed) {
          setCameraError("Failed to initialize gesture recognition. Keyboard controls are active!");
          setIsLoading(false);
        }
      }
    };

    initMediaPipe();

    return () => {
      active = false;
      isDestroyed = true;
      clearTimeout(checkInterval);
      
      const camera = cameraRef.current;
      const hands = handsRef.current;
      const stream = streamRef.current;
      
      cameraRef.current = null;
      handsRef.current = null;
      streamRef.current = null;

      if (stream) {
        try {
          stream.getTracks().forEach(track => track.stop());
        } catch (e) {
          console.warn("Error stopping stream tracks", e);
        }
      }

      if (camera) {
        try {
          camera.stop();
        } catch (e) {
          console.warn("Error stopping camera", e);
        }
      }

      if (hands) {
        try {
          hands.close();
        } catch (e) {
          console.warn("Error closing hands", e);
        }
      }
    };
  }, [settings.cameraEnabled]);

  // Calibration routine handler
  useEffect(() => {
    if (calibrationCountdown === null) return;

    if (calibrationCountdown > 0) {
      const timer = setTimeout(() => {
        setCalibrationCountdown(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (calibrationCountdown === 0) {
      // Complete calibration based on collected hand samples
      if (calibrationSamples.length > 0) {
        const sumX = calibrationSamples.reduce((acc, p) => acc + p.x, 0);
        const sumY = calibrationSamples.reduce((acc, p) => acc + p.y, 0);
        const avgX = sumX / calibrationSamples.length;
        const avgY = sumY / calibrationSamples.length;

        onCalibrationChange({
          ...calibration,
          centerX: avgX,
          centerY: avgY,
        });
      }
      setIsCalibrating(false);
      setCalibrationCountdown(null);
      setCalibrationSamples([]);
    }
  }, [calibrationCountdown, calibrationSamples]);

  // Core callback when MediaPipe recognizes hands
  const onResults = (results: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and match video aspect ratio
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Check if hand landmarks exist
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      updateGestureState({
        currentGesture: 'No Hand Detected',
        confidence: 0,
        handDetected: false,
        xOffset: 0,
        yOffset: 0,
        rawX: calibration.centerX,
        rawY: calibration.centerY,
        isPinching: false,
        isFist: false,
        handX: calibration.centerX,
        handY: calibration.centerY,
      });

      // Draw neutral guide lines even with no hand
      drawGuides(ctx, canvas.width, canvas.height, null);
      return;
    }

    const landmarks = results.multiHandLandmarks[0];

    // Landmark indexes
    // 0: Wrist, 4: Thumb Tip, 8: Index Tip, 12: Middle Tip, 16: Ring Tip, 20: Pinky Tip
    // 5, 9, 13, 17: MCP Knuckles
    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const palmCenter = landmarks[9]; // Middle MCP is a great palm anchor

    // Hand raw position (0-1)
    const handX = palmCenter.x;
    const handY = palmCenter.y;

    // Record sample if currently calibrating
    if (isCalibrating && calibrationCountdown !== null && calibrationCountdown > 0) {
      setCalibrationSamples(prev => [...prev, { x: handX, y: handY }]);
    }

    // Adjust sensitivity scaling
    const sensitivityFactor = 1 + (settings.sensitivity - 3) * 0.2; // 0.6x to 1.4x scaling

    // 1. Calculate Pinch Distance (Distance between thumb and index finger tip)
    const dxPinch = thumbTip.x - indexTip.x;
    const dyPinch = thumbTip.y - indexTip.y;
    const dzPinch = thumbTip.z - indexTip.z;
    const pinchDist = Math.sqrt(dxPinch * dxPinch + dyPinch * dyPinch + dzPinch * dzPinch);
    const isPinching = pinchDist < (calibration.pinchThreshold * sensitivityFactor);

    // 2. Calculate Fist Distance (Average distance of finger tips to palmCenter)
    const fingerTips = [indexTip, middleTip, ringTip, pinkyTip];
    const knuckles = [landmarks[5], landmarks[9], landmarks[13], landmarks[17]];

    let fistDistSum = 0;
    for (let i = 0; i < fingerTips.length; i++) {
      const dx = fingerTips[i].x - knuckles[i].x;
      const dy = fingerTips[i].y - knuckles[i].y;
      const dz = fingerTips[i].z - knuckles[i].z;
      fistDistSum += Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    const avgFistDist = fistDistSum / fingerTips.length;
    const isFist = avgFistDist < (calibration.fistThreshold * sensitivityFactor);

    // 3. Steering Zone offset (Mirrored or Normal)
    // Center point is calibrated centerX
    // We scale the offset so that small movements can comfortably reach left/right thresholds
    const steerDeadzone = 0.05 / sensitivityFactor;
    const steerMax = 0.18 / sensitivityFactor;

    let deltaX = handX - calibration.centerX;
    // Mirror adjustment
    if (settings.mirrorCamera) {
      deltaX = -deltaX;
    }

    // Normalize offset to -1 (Full Left) to 1 (Full Right)
    let xOffset = 0;
    if (Math.abs(deltaX) > steerDeadzone) {
      const sign = Math.sign(deltaX);
      const absOffset = (Math.abs(deltaX) - steerDeadzone) / (steerMax - steerDeadzone);
      xOffset = sign * Math.min(Math.max(absOffset, 0), 1);
    }

    const deltaY = handY - calibration.centerY;
    let yOffset = Math.min(Math.max(deltaY / 0.15, -1), 1);

    // Determine current gesture string
    let currentGesture = 'Neutral';
    if (isFist) {
      currentGesture = 'Closed Fist (Drop)';
    } else if (isPinching) {
      currentGesture = 'Pinch (Rotate)';
    } else if (yOffset < -0.6) {
      currentGesture = 'Raise Hand (Hold)';
    } else if (xOffset < -0.4) {
      currentGesture = 'Steer Left';
    } else if (xOffset > 0.4) {
      currentGesture = 'Steer Right';
    }

    // Trigger state change up
    updateGestureState({
      currentGesture,
      confidence: 1.0,
      handDetected: true,
      xOffset,
      yOffset,
      rawX: handX,
      rawY: handY,
      isPinching,
      isFist,
      handX,
      handY,
    });

    // Draw modern skeletal overlay on canvas
    drawHandOverlay(ctx, landmarks, canvas.width, canvas.height, currentGesture, isPinching, isFist);

    // Draw visual guides / steering zones
    drawGuides(ctx, canvas.width, canvas.height, { x: handX, y: handY }, xOffset);
  };

  // Draw the skeleton
  const drawHandOverlay = (
    ctx: CanvasRenderingContext2D,
    landmarks: any[],
    width: number,
    height: number,
    gesture: string,
    isPinching: boolean,
    isFist: boolean
  ) => {
    // Canvas coordinate converter
    const getCoords = (lm: any) => {
      let rx = lm.x;
      if (settings.mirrorCamera) {
        rx = 1 - rx;
      }
      return {
        x: rx * width,
        y: lm.y * height,
      };
    };

    // Connections to draw lines
    const fingerConnections = [
      [0, 1, 2, 3, 4],       // Thumb
      [0, 5, 6, 7, 8],       // Index
      [9, 10, 11, 12],       // Middle
      [13, 14, 15, 16],      // Ring
      [0, 17, 18, 19, 20],   // Pinky
      [5, 9, 13, 17],        // Knuckle line
    ];

    // Determine colors based on gesture state
    let strokeStyle = 'rgba(0, 240, 240, 0.7)'; // Cyan default
    let glowStyle = 'rgba(0, 240, 240, 0.4)';
    let nodeStyle = '#00f0f0';

    if (isFist) {
      strokeStyle = 'rgba(239, 68, 68, 0.8)'; // Neon Red
      glowStyle = 'rgba(239, 68, 68, 0.5)';
      nodeStyle = '#ef4444';
    } else if (isPinching) {
      strokeStyle = 'rgba(168, 85, 247, 0.8)'; // Neon Purple
      glowStyle = 'rgba(168, 85, 247, 0.5)';
      nodeStyle = '#a855f7';
    } else if (gesture.includes('Hold')) {
      strokeStyle = 'rgba(251, 146, 60, 0.8)'; // Neon Orange / Amber
      glowStyle = 'rgba(251, 146, 60, 0.5)';
      nodeStyle = '#fb923c';
    } else if (gesture.includes('Left') || gesture.includes('Right')) {
      strokeStyle = 'rgba(34, 197, 94, 0.8)'; // Neon Green
      glowStyle = 'rgba(34, 197, 94, 0.5)';
      nodeStyle = '#22c55e';
    }

    ctx.save();

    // Set line glow
    ctx.shadowColor = nodeStyle;
    ctx.shadowBlur = 10;

    // Draw bones
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    fingerConnections.forEach(path => {
      ctx.beginPath();
      const startPoint = getCoords(landmarks[path[0]]);
      ctx.moveTo(startPoint.x, startPoint.y);

      for (let i = 1; i < path.length; i++) {
        const nextPoint = getCoords(landmarks[path[i]]);
        ctx.lineTo(nextPoint.x, nextPoint.y);
      }
      ctx.strokeStyle = strokeStyle;
      ctx.stroke();
    });

    // Draw nodes
    landmarks.forEach((lm, index) => {
      const pt = getCoords(lm);
      ctx.beginPath();
      // Make finger tips larger
      const radius = [4, 8, 12, 16, 20].includes(index) ? 6 : 4;
      ctx.arc(pt.x, pt.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = nodeStyle;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Draw circle visual indicators around action points
    if (isPinching) {
      const thumbPt = getCoords(landmarks[4]);
      ctx.beginPath();
      ctx.arc(thumbPt.x, thumbPt.y, 25, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.restore();
  };

  // Draw HUD style layout lines (steering zones)
  const drawGuides = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    handPt: { x: number; y: number } | null,
    xOffset: number = 0
  ) => {
    ctx.save();

    // 1. Draw central calibration crosshair anchor
    const calX = (settings.mirrorCamera ? 1 - calibration.centerX : calibration.centerX) * width;
    const calY = calibration.centerY * height;

    ctx.beginPath();
    ctx.arc(calX, calY, 8, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Thin grid crosshair lines
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(calX - 40, calY);
    ctx.lineTo(calX + 40, calY);
    ctx.moveTo(calX, calY - 40);
    ctx.lineTo(calX, calY + 40);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Draw steering zones bar at bottom of camera feed
    const barY = height - 35;
    const barHeight = 16;
    const barWidth = width * 0.8;
    const barX = (width - barWidth) / 2;

    // Draw background tracks for Left, Neutral, Right
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, barHeight, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    // Draw division lines (Left Zone, Neutral Zone, Right Zone boundaries)
    // Left threshold: -0.4, Right threshold: 0.4
    const divLeft = barX + barWidth * 0.35;
    const divRight = barX + barWidth * 0.65;

    ctx.beginPath();
    ctx.moveTo(divLeft, barY);
    ctx.lineTo(divLeft, barY + barHeight);
    ctx.moveTo(divRight, barY);
    ctx.lineTo(divRight, barY + barHeight);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label Zones
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = xOffset < -0.4 ? '#22c55e' : 'rgba(255, 255, 255, 0.4)';
    ctx.fillText('◀ LEFT', barX + barWidth * 0.175, barY - 6);

    ctx.fillStyle = Math.abs(xOffset) <= 0.4 ? '#a855f7' : 'rgba(255, 255, 255, 0.4)';
    ctx.fillText('NEUTRAL', barX + barWidth * 0.5, barY - 6);

    ctx.fillStyle = xOffset > 0.4 ? '#22c55e' : 'rgba(255, 255, 255, 0.4)';
    ctx.fillText('RIGHT ▶', barX + barWidth * 0.825, barY - 6);

    // 3. Draw slider handle representing current hand position
    if (handPt) {
      let normalizedHandX = handPt.x;
      if (settings.mirrorCamera) {
        normalizedHandX = 1 - normalizedHandX;
      }

      // Project hand X position into the bar range
      // Keep it constrained to bar boundaries
      const sliderX = barX + (normalizedHandX) * barWidth;
      const constrainedX = Math.max(barX, Math.min(sliderX, barX + barWidth));

      // Draw a glowing bar filling from center to current position
      const barCenter = barX + barWidth / 2;
      ctx.beginPath();
      ctx.moveTo(barCenter, barY + barHeight / 2);
      ctx.lineTo(constrainedX, barY + barHeight / 2);
      ctx.strokeStyle = Math.abs(xOffset) > 0.4 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(168, 85, 247, 0.6)';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Handle thumb
      ctx.shadowColor = Math.abs(xOffset) > 0.4 ? '#22c55e' : '#a855f7';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(constrainedX, barY + barHeight / 2, 8, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    ctx.restore();
  };

  const startCalibration = () => {
    setIsCalibrating(true);
    setCalibrationCountdown(3);
    setCalibrationSamples([]);
  };

  return (
    <div id="camera_module_container" className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl h-full">
      {/* Module Title bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${settings.cameraEnabled && !cameraError ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${settings.cameraEnabled && !cameraError ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          </span>
          <h2 className="text-sm font-semibold tracking-wide text-slate-200 uppercase font-sans">
            AI Vision Input
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-slate-400 border border-slate-800 rounded px-2 py-0.5 bg-slate-900">
            {activeGesture}
          </span>
        </div>
      </div>

      {/* Camera/Status Canvas viewport */}
      <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden min-h-[220px]">
        {/* Real-time webcam video feed */}
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none ${settings.mirrorCamera ? '-scale-x-100' : ''}`}
          playsInline
          autoPlay
          muted
          width="480"
          height="360"
        />

        {/* Real-time feedback Canvas drawing hand overlays */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full object-cover z-10 pointer-events-none ${settings.mirrorCamera ? '-scale-x-100' : ''}`}
          width="480"
          height="360"
        />

        {/* Loading HUD overlays */}
        {isLoading && settings.cameraEnabled && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-20 gap-3">
            <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
            <p className="text-xs font-mono tracking-wider text-cyan-300">
              CONNECTING CAMERA...
            </p>
          </div>
        )}

        {/* Camera disabled or offline notice */}
        {!settings.cameraEnabled && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-20 p-6 text-center gap-4">
            <VideoOff className="h-12 w-12 text-slate-500" />
            <div>
              <p className="text-sm font-semibold text-slate-300">Webcam Feed Paused</p>
              <p className="text-xs text-slate-500 mt-1 max-w-[220px] mx-auto">
                Turn on the camera in Settings. Keyboard Mode controls are fully active.
              </p>
            </div>
          </div>
        )}

        {/* Error notification fallback */}
        {cameraError && settings.cameraEnabled && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 z-20 p-6 text-center gap-3">
            <ShieldAlert className="h-10 w-10 text-amber-500" />
            <div>
              <p className="text-xs font-semibold text-slate-200">Webcam Access Failed</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[220px] mx-auto">
                Ensure camera permissions are enabled in your browser or try refreshing. Keyboard controls are active!
              </p>
            </div>
          </div>
        )}

        {/* Calibration Countdown overlay */}
        {isCalibrating && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center z-30 gap-2">
            <span className="text-4xl font-bold text-cyan-400 animate-bounce">
              {calibrationCountdown}
            </span>
            <p className="text-xs font-mono tracking-wider text-slate-300 text-center px-4">
              Hold hand in comfortable NEUTRAL position
            </p>
          </div>
        )}
      </div>

      {/* Control Actions / Calibration Info bar */}
      <div className="p-4 bg-slate-950/90 border-t border-slate-800/80 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[11px] font-mono text-slate-400 leading-relaxed">
            <div>Center Anchor: <span className="text-cyan-400">({calibration.centerX.toFixed(2)}, {calibration.centerY.toFixed(2)})</span></div>
            <div>Mode: <span className={`${cameraError || !settings.cameraEnabled ? 'text-amber-500' : 'text-emerald-400'}`}>{cameraError || !settings.cameraEnabled ? 'Keyboard Fallback' : 'Webcam Gestures'}</span></div>
          </div>

          <button
            id="calibrate_btn"
            disabled={!settings.cameraEnabled || !!cameraError || isLoading}
            onClick={startCalibration}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-sans bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <RefreshCw className="h-3 w-3" />
            Calibrate Center
          </button>
        </div>

        {/* Short Calibration Tip */}
        <div className="text-[10px] text-slate-500 font-sans border-t border-slate-800/40 pt-2 flex items-start gap-1">
          <span className="text-cyan-400 font-bold font-mono">TIP:</span>
          <span>Center calibration resets the resting spot of your hand. Re-calibrate if blocks move on their own.</span>
        </div>
      </div>
    </div>
  );
}
