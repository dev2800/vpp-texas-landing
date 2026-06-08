// Counts up [data-count] elements when they enter view, formatted appropriately.
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initCounters() {
  document.querySelectorAll('[data-count]').forEach((el) => {
    const raw = el.dataset.count;
    const target = parseFloat(raw);
    const decIdx = raw.indexOf('.');
    const decimals = decIdx >= 0 ? raw.length - decIdx - 1 : 0;
    const isInt = decimals === 0;
    let started = false;

    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      onEnter: () => {
        if (started) return;
        started = true;
        const start = performance.now();
        const dur = 1600;
        const tick = (now) => {
          const t = Math.min(1, (now - start) / dur);
          // ease out cubic
          const eased = 1 - Math.pow(1 - t, 3);
          const v = target * eased;
          el.textContent = isInt
            ? Math.round(v).toLocaleString()
            : v.toFixed(decimals);
          if (t < 1) requestAnimationFrame(tick);
          else el.textContent = isInt ? target.toLocaleString() : target.toFixed(decimals);
        };
        requestAnimationFrame(tick);
      }
    });
  });
}
