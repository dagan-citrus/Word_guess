let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function tone(
  frequency: number,
  type: OscillatorType,
  gain: number,
  duration: number,
): void {
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g);
    g.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = frequency;
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // ignore
  }
}

/** Short metronome tick. urgent = last 3 seconds */
export function playTick(urgent = false): void {
  tone(urgent ? 1200 : 750, 'square', urgent ? 0.35 : 0.18, urgent ? 0.1 : 0.08);
}

/** End-of-turn buzzer */
export function playBuzzer(): void {
  tone(180, 'sawtooth', 0.5, 0.9);
}

/** Warm up the audio context on first user interaction */
export function wakeAudio(): void {
  getCtx();
}
