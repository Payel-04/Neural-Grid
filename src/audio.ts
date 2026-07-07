/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicInterval: any = null;
  private currentTempo = 110; // BPM
  private isMusicPlaying = false;
  private stepCount = 0;
  private soundEnabled = true;
  private musicEnabled = false;

  constructor() {
    // Lazy initialize when first action is performed to bypass browser autoplay policies
  }

  private init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.15, this.ctx.currentTime); // Low moderate volume
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }

  private resumeContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playMove() {
    if (!this.soundEnabled) return;
    this.resumeContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playRotate() {
    if (!this.soundEnabled) return;
    this.resumeContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playHold() {
    if (!this.soundEnabled) return;
    this.resumeContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(250, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playDrop() {
    if (!this.soundEnabled) return;
    this.resumeContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playLineClear(linesCount: number) {
    if (!this.soundEnabled) return;
    this.resumeContext();
    if (!this.ctx || !this.masterGain) return;

    // Multi-tone chord depending on number of lines cleared
    const baseFreqs = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    const count = Math.min(linesCount, 4);

    for (let i = 0; i < count; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreqs[i] * 1.5, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreqs[i] * 3, this.ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime + (i * 0.05));
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

      // Low pass filter to make it sound richer and warmer
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(this.ctx.currentTime + (i * 0.03));
      osc.stop(this.ctx.currentTime + 0.5);
    }
  }

  playLevelUp() {
    if (!this.soundEnabled) return;
    this.resumeContext();
    if (!this.ctx || !this.masterGain) return;

    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, index) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.1);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime + index * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + index * 0.1 + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(this.ctx.currentTime + index * 0.1);
      osc.stop(this.ctx.currentTime + index * 0.1 + 0.25);
    });
  }

  playGameOver() {
    if (!this.soundEnabled) return;
    this.resumeContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 1.2);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 1.2);
  }

  private startMusic() {
    if (this.isMusicPlaying) return;
    this.resumeContext();
    if (!this.ctx) return;

    this.isMusicPlaying = true;
    this.stepCount = 0;

    const stepDuration = 60 / this.currentTempo / 2; // Eighth notes

    const playStep = () => {
      if (!this.musicEnabled || !this.ctx || !this.masterGain) {
        this.isMusicPlaying = false;
        return;
      }

      const time = this.ctx.currentTime;
      const currentStep = this.stepCount % 16;

      // 16-step Synthwave / Cyberpunk bassline pattern
      // Keys: A minor (Am, G, F, E)
      let bassFreq = 110; // A2
      if (this.stepCount < 16) {
        // Am (A2)
        bassFreq = 55.0; // A1
      } else if (this.stepCount < 32) {
        // C (C2)
        bassFreq = 65.41; // C2
      } else if (this.stepCount < 48) {
        // F (F2)
        bassFreq = 43.65; // F1
      } else {
        // E (E2)
        bassFreq = 41.20; // E1
      }

      // Add octave jumps or rhythmic variations
      const octaveMultiplier = (currentStep % 4 === 1 || currentStep % 4 === 3) ? 2 : 1;
      const freq = bassFreq * octaveMultiplier;

      // Bass synth
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      // Filter envelope for classic "synthwave pluck"
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, time);
      filter.frequency.exponentialRampToValueAtTime(700, time + 0.05);
      filter.frequency.exponentialRampToValueAtTime(150, time + stepDuration - 0.01);

      // Rhythm: off-beats are slightly louder
      const volume = (currentStep % 2 === 1) ? 0.07 : 0.04;
      gain.gain.setValueAtTime(volume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + stepDuration - 0.01);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + stepDuration - 0.005);

      // Play a subtle neon chord synth pad on step 0 and 8
      if (currentStep === 0 || currentStep === 8) {
        const chordNotes = this.stepCount < 16 
          ? [220.00, 261.63, 329.63] // Am (A3, C4, E4)
          : this.stepCount < 32
          ? [261.63, 329.63, 392.00] // C (C4, E4, G4)
          : this.stepCount < 48
          ? [174.61 * 2, 220.00 * 2, 261.63 * 2] // F (F4, A4, C5)
          : [164.81 * 2, 207.65 * 2, 246.94 * 2]; // E (E4, G#4, B4)

        chordNotes.forEach((f) => {
          if (!this.ctx || !this.masterGain) return;
          const chordOsc = this.ctx.createOscillator();
          const chordGain = this.ctx.createGain();
          const chordFilter = this.ctx.createBiquadFilter();

          chordOsc.type = 'sine';
          chordOsc.frequency.setValueAtTime(f, time);

          chordFilter.type = 'lowpass';
          chordFilter.frequency.setValueAtTime(800, time);

          chordGain.gain.setValueAtTime(0.015, time);
          chordGain.gain.exponentialRampToValueAtTime(0.001, time + stepDuration * 4 - 0.1);

          chordOsc.connect(chordFilter);
          chordFilter.connect(chordGain);
          chordGain.connect(this.masterGain);

          chordOsc.start(time);
          chordOsc.stop(time + stepDuration * 4 - 0.05);
        });
      }

      this.stepCount = (this.stepCount + 1) % 64;
      
      // Schedule the next step slightly before the current one finishes
      this.musicInterval = setTimeout(playStep, stepDuration * 1000);
    };

    playStep();
  }

  private stopMusic() {
    if (this.musicInterval) {
      clearTimeout(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
  }
}

class SpeechEngine {
  private enabled = false;

  constructor() {
    // Warm up speech system if available
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
      }
    } catch (_) {}
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  speak(text: string) {
    if (!this.enabled) return;
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const engVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('google')) || 
                         voices.find(v => v.lang.startsWith('en')) || 
                         voices[0];
        if (engVoice) {
          utterance.voice = engVoice;
        }
        utterance.rate = 1.15; // upbeat, cheerful tempo
        utterance.pitch = 1.1;  // slightly friendly/cheerier pitch
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn("Speech Synthesis failed:", e);
    }
  }
}

export const audio = new SoundEngine();
export const speech = new SpeechEngine();
