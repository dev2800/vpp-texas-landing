// Stylized Texas grid map — Canvas2D nodes that cascade-flicker-and-die as user scrolls.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TEXAS_OUTLINE } from './texasShape.js';

export function initProblemGrid({ reducedMotion }) {
  const canvas = document.getElementById('problemCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const NODE_COUNT = 90;
  const nodes = [];
  // Seed nodes inside Texas bounding box; reject sample if outside polygon
  while (nodes.length < NODE_COUNT) {
    const x = Math.random() * 1.9 - 0.95;
    const y = Math.random() * 1.9 - 0.95;
    if (pointInPoly(x, y, TEXAS_OUTLINE)) {
      nodes.push({
        x, y,
        out: 0,       // 0 = alive, 1 = dark
        flicker: Math.random()
      });
    }
  }

  // Connections: each node to ~2 nearest
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    const sorted = nodes
      .map((n, j) => ({ j, d: (n.x - nodes[i].x) ** 2 + (n.y - nodes[i].y) ** 2 }))
      .filter(o => o.j !== i)
      .sort((a, b) => a.d - b.d);
    edges.push([i, sorted[0].j]);
    edges.push([i, sorted[1].j]);
  }

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  let cascadeProgress = 0;

  ScrollTrigger.create({
    trigger: '#problem',
    start: 'top 80%',
    end: 'bottom 30%',
    scrub: true,
    onUpdate: (self) => {
      cascadeProgress = self.progress;
    }
  });

  // Outage propagation: each node has a "kill time" 0..1 based on x position (east → west cascade)
  nodes.forEach(n => {
    // Combine position-based timing with a random jitter
    const positional = (n.x + 1) / 2; // 0 = west, 1 = east
    n.killAt = 0.1 + positional * 0.7 + Math.random() * 0.2;
  });

  const txTransform = (x, y, w, h) => {
    const pad = 30;
    // map x:-1..1 to pad..w-pad, y:1..-1 (flip) to pad..h-pad
    const px = pad + ((x + 1) / 2) * (w - pad * 2);
    const py = pad + ((1 - (y + 1) / 2)) * (h - pad * 2);
    return [px, py];
  };

  const draw = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    // Background grid lines
    ctx.strokeStyle = 'rgba(107, 122, 153, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 32) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
    }
    for (let i = 0; i < h; i += 32) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
    }

    // Texas outline
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    TEXAS_OUTLINE.forEach(([x, y], i) => {
      const [px, py] = txTransform(x, y, w, h);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.stroke();

    // Edges
    edges.forEach(([a, b]) => {
      const na = nodes[a], nb = nodes[b];
      const alive = (1 - na.out) * (1 - nb.out);
      if (alive < 0.05) return;
      const [ax, ay] = txTransform(na.x, na.y, w, h);
      const [bx, by] = txTransform(nb.x, nb.y, w, h);
      ctx.strokeStyle = `rgba(0, 212, 255, ${0.18 * alive})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    });

    // Nodes
    const t = performance.now() / 1000;
    nodes.forEach(n => {
      const targetOut = cascadeProgress > n.killAt ? 1 : 0;
      n.out += (targetOut - n.out) * 0.07;
      const [px, py] = txTransform(n.x, n.y, w, h);
      const alive = 1 - n.out;
      const flicker = 0.7 + Math.sin(t * 4 + n.flicker * 20) * 0.3;
      const radius = 2 + alive * 2;
      const color = alive > 0.5
        ? `rgba(0, 212, 255, ${alive * flicker})`
        : `rgba(255, 90, 60, ${(1 - alive) * 0.7})`;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowBlur = alive > 0.5 ? 12 : 0;
      ctx.shadowColor = '#00d4ff';
      ctx.fill();
      ctx.shadowBlur = 0;

      if (alive < 0.3 && Math.random() < 0.005) {
        // Spark/flicker
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 170, 0, 0.4)';
        ctx.fill();
      }
    });

    requestAnimationFrame(draw);
  };

  if (!reducedMotion) draw();
  else {
    // Static render once
    cascadeProgress = 0.6;
    draw();
  }
}

function pointInPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
