// Simplified Texas state outline as normalized 2D coordinates (x: -1..1, y: -1..1)
// Roughly traces the recognizable outline: panhandle top, east border down to gulf,
// south tip, west border up to el paso, back north along NM/CO border.
export const TEXAS_OUTLINE = [
  [-0.55, 0.95],   // NW panhandle corner
  [-0.10, 0.95],   // NE panhandle (OK border)
  [-0.10, 0.78],   // panhandle drop
  [ 0.10, 0.78],
  [ 0.18, 0.72],   // red river bend
  [ 0.32, 0.62],
  [ 0.42, 0.55],
  [ 0.50, 0.45],
  [ 0.55, 0.30],
  [ 0.62, 0.18],
  [ 0.70, 0.05],   // texarkana area
  [ 0.72, -0.10],
  [ 0.65, -0.22],  // east tx down
  [ 0.55, -0.35],
  [ 0.48, -0.48],
  [ 0.42, -0.58],
  [ 0.35, -0.68],  // sabine pass
  [ 0.18, -0.65],  // gulf coast curve
  [-0.02, -0.75],  // corpus
  [-0.20, -0.92],  // brownsville (south tip)
  [-0.35, -0.95],
  [-0.50, -0.85],  // rio grande
  [-0.62, -0.72],
  [-0.72, -0.55],
  [-0.80, -0.38],
  [-0.88, -0.20],
  [-0.92, -0.02],
  [-0.95, 0.18],   // el paso point
  [-0.85, 0.30],
  [-0.78, 0.42],   // west tx jog
  [-0.78, 0.55],
  [-0.82, 0.70],
  [-0.82, 0.95],   // up to NM/panhandle base
  [-0.55, 0.95]    // close
];

// Sample N points along the outline (linear interp between vertices)
export function sampleTexas(n, scale = 1, offsetY = 0) {
  const pts = [];
  // Total perimeter
  let total = 0;
  const segLengths = [];
  for (let i = 0; i < TEXAS_OUTLINE.length - 1; i++) {
    const [x1, y1] = TEXAS_OUTLINE[i];
    const [x2, y2] = TEXAS_OUTLINE[i + 1];
    const d = Math.hypot(x2 - x1, y2 - y1);
    segLengths.push(d);
    total += d;
  }
  const step = total / n;
  let acc = 0;
  let segIdx = 0;
  for (let i = 0; i < n; i++) {
    const target = i * step;
    while (segIdx < segLengths.length - 1 && acc + segLengths[segIdx] < target) {
      acc += segLengths[segIdx];
      segIdx++;
    }
    const segT = (target - acc) / segLengths[segIdx];
    const [x1, y1] = TEXAS_OUTLINE[segIdx];
    const [x2, y2] = TEXAS_OUTLINE[segIdx + 1];
    const x = (x1 + (x2 - x1) * segT) * scale;
    const y = (y1 + (y2 - y1) * segT) * scale + offsetY;
    // Add a small jitter so the outline isn't perfectly clean
    pts.push([x + (Math.random() - 0.5) * 0.02, y + (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.04]);
  }
  return pts;
}
