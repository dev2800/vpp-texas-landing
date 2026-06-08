// Exploded view: Sonnen battery components slide out along axes, label lines draw in.
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { tryRenderer, hideCanvasWithFallback } from './webglGuard.js';

const COMPONENTS = [
  { name: 'CASING',     benefit: 'Aircraft-grade aluminum. Dust- and rodent-sealed.',     axis: [0, 0, -2.2] },
  { name: 'INVERTER',   benefit: 'Smart 5kW bidirectional. Pure sine wave to your home.', axis: [-2.6, 0.6, 0] },
  { name: 'CELL STACK', benefit: '10,000-cycle LiFePO₄. No cobalt. No fire risk.',         axis: [2.6, -0.4, 0] },
  { name: 'CONTROL UNIT', benefit: 'AI-managed dispatch. Always picks the best price.',   axis: [0, 2.2, 0.4] },
  { name: 'COMMS MODULE', benefit: 'Encrypted LTE. Updates roll out overnight.',          axis: [0, -2.2, 0.4] }
];

export function initBatteryExplode({ reducedMotion }) {
  const canvas = document.getElementById('batteryCanvas');
  const section = document.querySelector('.section--battery');
  if (!canvas || !section) return;

  const renderer = tryRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  if (!renderer) {
    hideCanvasWithFallback(canvas, 'radial-gradient(ellipse at center, rgba(0,212,255,0.12), transparent 70%)');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  scene.add(new THREE.AmbientLight(0xb0c8ff, 0.4));
  const key = new THREE.PointLight(0x00d4ff, 2.2, 18);
  key.position.set(3, 4, 5);
  scene.add(key);
  const warm = new THREE.PointLight(0xffaa00, 1.4, 18);
  warm.position.set(-3, -2, 3);
  scene.add(warm);

  const group = new THREE.Group();
  scene.add(group);

  // Core: same battery as hero, scaled
  const W = 0.9, H = 1.4, D = 0.5;
  const bodyGeo = new THREE.BoxGeometry(W * 2, H * 2, D * 2);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x12182a, metalness: 0.8, roughness: 0.35 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(body);

  const edgeMat = new THREE.LineBasicMaterial({
    color: 0x00d4ff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending
  });
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(bodyGeo), edgeMat);
  group.add(edges);

  // Create component meshes (each a smaller box) at center initially
  const partMeshes = COMPONENTS.map((c, i) => {
    const sw = 0.35, sh = 0.35, sd = 0.2;
    const partGeo = new THREE.BoxGeometry(sw, sh, sd);
    const partMat = new THREE.MeshStandardMaterial({
      color: 0x1c2438,
      metalness: 0.75,
      roughness: 0.3,
      emissive: i === 0 ? 0x00d4ff : (i % 2 ? 0x00d4ff : 0xffaa00),
      emissiveIntensity: 0.25
    });
    const m = new THREE.Mesh(partGeo, partMat);
    m.userData = { axis: c.axis, name: c.name, benefit: c.benefit, idx: i };
    group.add(m);
    return m;
  });

  // Build label overlays (HTML)
  const labelLayer = document.createElement('div');
  labelLayer.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
  canvas.parentElement.style.position = 'relative';
  canvas.parentElement.appendChild(labelLayer);

  const labels = COMPONENTS.map((c, i) => {
    const wrap = document.createElement('div');
    wrap.style.cssText = `
      position:absolute; opacity:0; transform: translate(-50%, -50%);
      transition: opacity 0.4s; pointer-events: none; max-width: 220px;`;
    wrap.innerHTML = `
      <div style="
        font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.24em;
        color:#00d4ff;margin-bottom:4px;font-weight:600;">${c.name}</div>
      <div style="font-size:12px;color:#f0f4ff;line-height:1.4;opacity:0.85;">${c.benefit}</div>
    `;
    labelLayer.appendChild(wrap);
    return wrap;
  });

  // Resize
  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);

  // State: 0 = sealed, 1 = fully exploded
  let explodeState = 0;

  ScrollTrigger.create({
    trigger: section,
    pin: '.battery__pin',
    start: 'top top',
    end: '+=600',
    scrub: 1.2,
    onUpdate: (self) => {
      // 0..0.3 = explode out, 0.3..0.7 = hold, 0.7..1 = reassemble
      const p = self.progress;
      let e;
      if (p < 0.4) e = p / 0.4;
      else if (p > 0.7) e = 1 - (p - 0.7) / 0.3;
      else e = 1;
      explodeState = Math.max(0, Math.min(1, e));
    }
  });

  // Pinch gesture support
  let pinchActive = false;
  let pinchStart = 0;
  let pinchExplode = 0;
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      pinchActive = true;
      pinchStart = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchExplode = explodeState;
    }
  }, { passive: true });
  canvas.addEventListener('touchmove', (e) => {
    if (pinchActive && e.touches.length === 2) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      explodeState = Math.max(0, Math.min(1, pinchExplode + (d - pinchStart) / 200));
    }
  }, { passive: true });
  canvas.addEventListener('touchend', () => { pinchActive = false; });

  // Render loop
  const clock = new THREE.Clock();
  const tmpV = new THREE.Vector3();

  const tick = () => {
    const t = clock.getElapsedTime();
    group.rotation.y = t * 0.18;
    group.rotation.x = Math.sin(t * 0.4) * 0.12;

    // Position parts based on explode state
    partMeshes.forEach((m, i) => {
      const [ax, ay, az] = m.userData.axis;
      m.position.set(ax * explodeState, ay * explodeState, az * explodeState);
      // Spin individual parts as they leave
      m.rotation.x = explodeState * Math.sin(t + i) * 0.4;
      m.rotation.y = explodeState * Math.cos(t * 0.7 + i) * 0.4;
      m.visible = explodeState > 0.01;
    });

    // Fade body when parts are out
    bodyMat.opacity = 1 - explodeState * 0.55;
    bodyMat.transparent = explodeState > 0.05;
    edgeMat.opacity = 0.6 * (1 - explodeState * 0.5);

    // Project label positions
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    partMeshes.forEach((m, i) => {
      const lbl = labels[i];
      if (explodeState > 0.4) {
        tmpV.copy(m.position).applyMatrix4(group.matrixWorld);
        tmpV.project(camera);
        const x = (tmpV.x * 0.5 + 0.5) * w;
        const y = (-tmpV.y * 0.5 + 0.5) * h;
        // Offset based on axis direction
        const [ax, ay] = m.userData.axis;
        const offX = ax >= 0 ? 80 : -80;
        const offY = ay >= 0 ? -40 : 40;
        lbl.style.left = (x + offX) + 'px';
        lbl.style.top = (y + offY) + 'px';
        lbl.style.opacity = ((explodeState - 0.4) / 0.6).toString();
      } else {
        lbl.style.opacity = '0';
      }
    });

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };
  tick();
}
