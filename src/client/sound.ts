// Synthesized sound effects (no audio files). Audio starts only after the first tap or key press.

import { store } from "./util";

let ac: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let enabled = store.get("db.sound", true);

export const sound = {
  get on() {
    return enabled;
  },
  set(on: boolean) {
    enabled = on;
    store.set("db.sound", on);
    if (on) unlock();
  },
};

export function unlock() {
  if (!enabled) return null;
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!ac) {
      ac = new Ctor();
      master = ac.createGain();
      // 1.5x the original level (sounds about 30% louder). A limiter after it stops overlapping
      // sounds from crackling on phone speakers.
      master.gain.value = 1.35;
      const limiter = ac.createDynamicsCompressor();
      limiter.threshold.value = -6;
      limiter.knee.value = 6;
      limiter.ratio.value = 12;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.15;
      master.connect(limiter);
      limiter.connect(ac.destination);
    }
    if (ac.state === "suspended") void ac.resume();
  } catch {
    ac = null;
  }
  return ac;
}

const ready = () => enabled && ac && master && ac.state === "running";

function tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.12, delay = 0, slideTo?: number, attack = 0.005) {
  if (!ready()) return;
  try {
    const t = ac!.currentTime + delay;
    const o = ac!.createOscillator();
    const g = ac!.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(master!);
    o.start(t);
    o.stop(t + dur + 0.05);
  } catch {
    /* ignore */
  }
}

/** Filtered noise: whooshes, drum hits. */
function hiss(dur: number, vol: number, from: number, to: number, delay = 0, q = 1.2) {
  if (!ready()) return;
  try {
    if (!noise) {
      noise = ac!.createBuffer(1, ac!.sampleRate, ac!.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t = ac!.currentTime + delay;
    const src = ac!.createBufferSource();
    src.buffer = noise;
    const f = ac!.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = q;
    f.frequency.setValueAtTime(from, t);
    f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ac!.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(master!);
    src.start(t);
    src.stop(t + dur + 0.05);
  } catch {
    /* ignore */
  }
}

const notes = (list: number[], step: number, type: OscillatorType, vol: number, len = 0.18) =>
  list.forEach((f, i) => tone(f, len, type, vol, i * step));

export const sfx = {
  /** Countdown tick. Urgent ticks in the last 3 seconds are higher and come in pairs. */
  tick: (urgent = false, soft = false) => {
    const k = soft ? 0.5 : 1;
    if (urgent) {
      tone(1568, 0.06, "square", 0.05 * k);
      tone(1568, 0.05, "square", 0.035 * k, 0.12);
    } else tone(1046, 0.05, "square", 0.035 * k);
  },
  /**
   * The race countdown (30 to 11 seconds left): a gentle wood-block tick-tock that starts very
   * quiet and grows a little. Players who already guessed hear it at half volume.
   */
  tock: (secLeft: number, soft = false) => {
    const grow = 1 - Math.max(0, Math.min(1, (secLeft - 11) / 19)); // 0 at 30s, 1 at 11s
    const vol = (0.022 + 0.022 * grow) * (soft ? 0.5 : 1);
    const hi = secLeft % 2 === 0;
    tone(hi ? 1180 : 880, 0.045, "triangle", vol, 0, hi ? 1000 : 760, 0.002);
    hiss(0.03, vol * 0.5, 3000, 2000, 0, 3);
  },
  /** The clock snapping down after the first correct guess: a quick winding whoosh and a clunk. */
  snap: () => {
    hiss(0.32, 0.12, 2600, 500, 0, 1.4);
    tone(988, 0.28, "triangle", 0.07, 0, 330);
    tone(196, 0.16, "sine", 0.14, 0.26, 150);
  },
  /** Half-time style warning bell when 30 seconds are left. */
  warn: () => { tone(880, 0.5, "sine", 0.08); tone(1320, 0.5, "sine", 0.05, 0.02); },
  correct: () => notes([784, 988, 1175, 1568], 0.075, "triangle", 0.15, 0.24),
  otherCorrect: () => { tone(988, 0.11, "triangle", 0.08); tone(1318, 0.16, "triangle", 0.07, 0.08); },
  veryClose: () => { tone(660, 0.12, "sine", 0.09); tone(880, 0.18, "sine", 0.09, 0.1); },
  warm: () => tone(587, 0.16, "sine", 0.07),
  hint: () => notes([1760, 2093, 2637], 0.05, "sine", 0.05, 0.12),
  timeUp: () => { tone(196, 0.5, "sawtooth", 0.08); tone(147, 0.55, "sawtooth", 0.06, 0.05); },
  allGuessed: () => notes([523, 659, 784, 1046, 1318], 0.07, "triangle", 0.12, 0.22),
  nobody: () => { tone(392, 0.3, "triangle", 0.09, 0); tone(370, 0.3, "triangle", 0.09, 0.3); tone(349, 0.3, "triangle", 0.09, 0.6); tone(330, 0.7, "triangle", 0.09, 0.9, 300); },
  yourTurn: () => notes([523, 659, 784], 0.1, "triangle", 0.13, 0.2),
  roundStart: () => { hiss(0.35, 0.12, 400, 2600); tone(110, 0.25, "sine", 0.2, 0.05, 70); tone(110, 0.3, "sine", 0.2, 0.32, 70); },
  shuffle: () => hiss(0.45, 0.1, 600, 3200, 0, 0.9),
  rankUp: () => tone(523, 0.35, "triangle", 0.1, 0, 1046),
  rankDown: () => tone(440, 0.35, "triangle", 0.06, 0, 300),
  pick: () => tone(1046, 0.06, "triangle", 0.08),
  join: () => tone(880, 0.08, "sine", 0.05),
  leave: () => tone(523, 0.12, "sine", 0.05, 0, 392),
  drumroll: (secs = 1.6) => {
    if (!ready()) return;
    const hits = Math.floor(secs / 0.045);
    for (let i = 0; i < hits; i++) hiss(0.06, 0.05 + (i / hits) * 0.08, 1800, 1200, i * 0.045, 2);
  },
  fanfare: () => {
    notes([523, 659, 784, 1046], 0.12, "triangle", 0.13, 0.22);
    tone(1318, 0.7, "triangle", 0.12, 0.5);
    tone(1046, 0.7, "triangle", 0.08, 0.5);
    hiss(0.6, 0.06, 3000, 6000, 0.5);
  },
};

export function buzz(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}
