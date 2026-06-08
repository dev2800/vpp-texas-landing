// Web Audio low-frequency ambient hum that shifts pitch with scroll.
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initAudio() {
  const btn = document.getElementById('audioToggle');
  if (!btn) return;

  let ctx, osc, gain, filter;
  let enabled = false;

  const start = () => {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 60;

    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = 92;

    filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 180;

    gain = ctx.createGain();
    gain.gain.value = 0.0;

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc2.start();

    // Fade in
    const t = ctx.currentTime;
    gain.gain.linearRampToValueAtTime(0.06, t + 1.2);
  };

  const stop = () => {
    if (!ctx) return;
    const t = ctx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.linearRampToValueAtTime(0, t + 0.4);
    setTimeout(() => {
      try { osc.stop(); } catch (e) {}
      try { ctx.close(); } catch (e) {}
      ctx = null;
    }, 500);
  };

  btn.addEventListener('click', () => {
    enabled = !enabled;
    btn.setAttribute('aria-pressed', enabled.toString());
    if (enabled) start();
    else stop();
  });

  // Shift frequency with scroll progress
  let last = 0;
  window.addEventListener('scroll', () => {
    if (!ctx || !enabled) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    const target = 50 + p * 60;
    const fTarget = 140 + p * 240;
    const now = performance.now();
    if (now - last < 60) return;
    last = now;
    const t = ctx.currentTime;
    osc.frequency.linearRampToValueAtTime(target, t + 0.4);
    filter.frequency.linearRampToValueAtTime(fTarget, t + 0.4);
  }, { passive: true });
}
