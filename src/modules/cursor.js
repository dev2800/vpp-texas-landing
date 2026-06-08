// Custom glowing dot cursor + light trail (canvas overlay)
export function initCursor() {
  const canvas = document.getElementById('cursorCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0, h = 0;
  const resize = () => {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  const trail = [];
  const TRAIL_MAX = 14;
  let mx = w / 2, my = h / 2;
  let tx = mx, ty = my;
  let hovering = false;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  const checkHover = (e) => {
    const t = e.target;
    hovering = !!(t.closest('a, button, [data-magnetic]'));
  };
  window.addEventListener('mouseover', checkHover);
  window.addEventListener('mouseout', checkHover);

  const loop = () => {
    tx += (mx - tx) * 0.22;
    ty += (my - ty) * 0.22;

    trail.unshift({ x: tx, y: ty });
    if (trail.length > TRAIL_MAX) trail.length = TRAIL_MAX;

    ctx.clearRect(0, 0, w, h);

    // Trail
    for (let i = trail.length - 1; i >= 0; i--) {
      const p = trail[i];
      const t = i / trail.length;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2 + (1 - t) * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 212, 255, ${(1 - t) * 0.4})`;
      ctx.fill();
    }

    // Outer ring on hover
    if (hovering) {
      ctx.beginPath();
      ctx.arc(tx, ty, 22, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.65)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Core dot
    ctx.beginPath();
    ctx.arc(tx, ty, hovering ? 5 : 4, 0, Math.PI * 2);
    ctx.fillStyle = hovering ? '#ffaa00' : '#00d4ff';
    ctx.shadowBlur = 18;
    ctx.shadowColor = hovering ? '#ffaa00' : '#00d4ff';
    ctx.fill();
    ctx.shadowBlur = 0;

    requestAnimationFrame(loop);
  };
  loop();
}
