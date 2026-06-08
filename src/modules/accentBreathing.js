// Breathes --accent-primary between electric blue and warm amber on a 4s sinusoid.
const COOL = [0, 212, 255];
const WARM = [255, 170, 0];

export function initAccentBreathing() {
  const root = document.documentElement;
  const start = performance.now();
  const PERIOD = 4000;

  const lerp = (a, b, t) => Math.round(a + (b - a) * t);

  const tick = () => {
    const t = ((performance.now() - start) % PERIOD) / PERIOD;
    // Sinusoidal 0..1..0
    const s = (Math.sin(t * Math.PI * 2) + 1) / 2;
    const r = lerp(COOL[0], WARM[0], s);
    const g = lerp(COOL[1], WARM[1], s);
    const b = lerp(COOL[2], WARM[2], s);
    root.style.setProperty('--accent-primary', `rgb(${r}, ${g}, ${b})`);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
