// js/sound.js - tiny sounds, no files. WebAudio beeps only.
// Respects settings.sound (off by default). Keeps it gentle.
import { store } from "./store.js";

let ctx = null;
function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}
// Play a short note: freq, seconds, type, delay.
function note(freq, dur = 0.12, type = "sine", when = 0, vol = 0.12) {
  if (!store.settings.sound) return;
  try {
    const c = ac(), o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g); g.connect(c.destination);
    const t = c.currentTime + when;
    o.start(t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.stop(t + dur + 0.02);
  } catch (e) { /* silent on old phones */ }
}

export const sfx = {
  click() { note(600, 0.06, "triangle"); },
  cash() { note(880, 0.1); note(1320, 0.14, "sine", 0.08); },
  good() { note(523, 0.12); note(659, 0.12, "sine", 0.1); note(784, 0.2, "sine", 0.2); },
  bad() { note(220, 0.2, "sawtooth", 0, 0.05); },
  steam() { note(300, 0.3, "sine", 0, 0.04); },
  pop() { note(990, 0.08, "square", 0, 0.06); },
  win() { [523, 659, 784, 1046].forEach((f, i) => note(f, 0.18, "sine", i * 0.11)); }
};
