type AudioContextLike = AudioContext;

let audioContext: AudioContextLike | null = null;

const isBrowser = () => typeof window !== "undefined";

function getAudioContext(): AudioContextLike | null {
  if (!isBrowser()) return null;
  if (audioContext) return audioContext;

  const AudioContextImpl = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextImpl) return null;

  audioContext = new AudioContextImpl();
  return audioContext;
}

async function resumeIfNeeded(ctx: AudioContextLike) {
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      // Browser autoplay policy: resume may fail without a user gesture.
    }
  }
}

function safeDisconnect(node: AudioNode | null) {
  try {
    node?.disconnect();
  } catch {
    // no-op
  }
}

export function playClick() {
  const ctx = getAudioContext();
  if (!ctx) return;

  void resumeIfNeeded(ctx).then(() => {
    const now = ctx.currentTime;

    const out = ctx.createGain();
    out.gain.setValueAtTime(1, now);
    out.connect(ctx.destination);

    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.0001, now);
    clickGain.gain.exponentialRampToValueAtTime(0.11, now + 0.008);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);
    clickGain.connect(out);

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(10, now);
    filter.connect(clickGain);

    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.06);
    osc.connect(filter);

    osc.start(now);
    osc.stop(now + 0.09);

    osc.onended = () => {
      safeDisconnect(osc);
      safeDisconnect(filter);
      safeDisconnect(clickGain);
      safeDisconnect(out);
    };
  });
}

export function playSuccess() {
  const ctx = getAudioContext();
  if (!ctx) return;

  void resumeIfNeeded(ctx).then(() => {
    const now = ctx.currentTime;

    const out = ctx.createGain();
    out.gain.setValueAtTime(1, now);
    out.connect(ctx.destination);

    const highPass = ctx.createBiquadFilter();
    highPass.type = "highpass";
    highPass.frequency.setValueAtTime(240, now);
    highPass.Q.setValueAtTime(0.8, now);
    highPass.connect(out);

    const chord = [523.25, 659.25, 783.99]; // C5, E5, G5
    const oscillators = chord.map((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(i === 0 ? -6 : i === 1 ? 4 : 8, now);
      return osc;
    });

    const mix = ctx.createGain();
    mix.gain.setValueAtTime(0.18, now);
    mix.connect(highPass);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.exponentialRampToValueAtTime(1, now + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    env.connect(mix);

    for (const osc of oscillators) {
      osc.connect(env);
      osc.start(now);
      osc.stop(now + 0.95);
    }

    oscillators[0].onended = () => {
      for (const osc of oscillators) safeDisconnect(osc);
      safeDisconnect(env);
      safeDisconnect(mix);
      safeDisconnect(highPass);
      safeDisconnect(out);
    };
  });
}

/**
* Start a repeating critical alarm. Call the returned function to stop it (e.g., in effect cleanup).
*/
export function playAlert(): () => void {
  const ctx = getAudioContext();
  if (!ctx) return () => {};

  let stopped = false;
  let initialized = false;
  let interval: ReturnType<typeof setInterval> | null = null;
  let out: GainNode | null = null;
  let lowPass: BiquadFilterNode | null = null;
  let gate: GainNode | null = null;
  let osc: OscillatorNode | null = null;
  let sub: OscillatorNode | null = null;

  const stop = () => {
    if (stopped) return;
    stopped = true;
    if (interval) clearInterval(interval);
    interval = null;

    if (!initialized) return;

    if (!gate || !osc || !sub) return;
    const now = ctx.currentTime;

    gate.gain.cancelScheduledValues(now);
    gate.gain.setValueAtTime(gate.gain.value, now);
    gate.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.stop(now + 0.07);
    sub.stop(now + 0.07);

    sub.onended = () => {
      safeDisconnect(sub);
      safeDisconnect(osc);
      safeDisconnect(gate);
      safeDisconnect(lowPass);
      safeDisconnect(out);
    };
  };

  void resumeIfNeeded(ctx).then(() => {
    if (stopped) return;

    initialized = true;

    out = ctx.createGain();
    out.gain.setValueAtTime(0.85, ctx.currentTime);
    out.connect(ctx.destination);

    lowPass = ctx.createBiquadFilter();
    lowPass.type = "lowpass";
    lowPass.frequency.setValueAtTime(1200, ctx.currentTime);
    lowPass.Q.setValueAtTime(0.7, ctx.currentTime);
    lowPass.connect(out);

    gate = ctx.createGain();
    gate.gain.setValueAtTime(0.0001, ctx.currentTime);
    gate.connect(lowPass);

    osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.connect(gate);

    sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.setValueAtTime(60, ctx.currentTime);
    sub.connect(gate);

    const pulse = () => {
      if (!gate || !osc || stopped) return;
      const now = ctx.currentTime;
      const start = now + 0.01;
      const end = start + 0.16;

      osc.frequency.setValueAtTime(95, start);
      osc.frequency.exponentialRampToValueAtTime(160, start + 0.08);
      osc.frequency.exponentialRampToValueAtTime(105, end);

      gate.gain.cancelScheduledValues(start);
      gate.gain.setValueAtTime(0.0001, start);
      gate.gain.exponentialRampToValueAtTime(0.22, start + 0.01);
      gate.gain.exponentialRampToValueAtTime(0.0001, end);
    };

    osc.start();
    sub.start();
    pulse();
    interval = setInterval(pulse, 420);
  });

  return stop;
}
