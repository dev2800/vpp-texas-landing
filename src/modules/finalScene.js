// Final CTA background — the assembled grid, pulsing
import * as THREE from 'three';
import { fullscreenVert } from '../shaders/godRays.frag.js';
import { tryRenderer, hideCanvasWithFallback } from './webglGuard.js';

const finalFrag = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main() {
  vec2 uv = vUv;
  vec2 p = uv - 0.5;
  p.x *= uRes.x / uRes.y;
  float d = length(p);

  // Radial pulse
  float pulse = sin(uTime * 1.2 - d * 8.0) * 0.5 + 0.5;
  pulse *= smoothstep(1.2, 0.0, d);

  // Grid dots
  vec2 g = floor(uv * 32.0);
  float dot_v = 0.0;
  vec2 cell = fract(uv * 32.0) - 0.5;
  if (length(cell) < 0.08) {
    dot_v = 0.7 + 0.3 * sin(uTime * 1.5 + g.x * 0.5 + g.y * 0.3);
  }

  // Background
  vec3 bg = vec3(0.020, 0.030, 0.060);
  vec3 accent = mix(vec3(0.0, 0.83, 1.0), vec3(1.0, 0.67, 0.0), pulse);
  vec3 col = bg + pulse * 0.20 * accent + dot_v * 0.18 * accent;

  // Vignette
  col *= 1.0 - smoothstep(0.4, 1.0, d * 0.8);

  gl_FragColor = vec4(col, 1.0);
}
`;

export function initFinalScene({ reducedMotion }) {
  const canvas = document.getElementById('finalCanvas');
  if (!canvas) return;
  if (reducedMotion) {
    canvas.style.background = 'radial-gradient(circle at center, rgba(0,212,255,0.18), transparent 70%)';
    return;
  }

  const renderer = tryRenderer({
    canvas, antialias: false, alpha: false, powerPreference: 'low-power'
  });
  if (!renderer) {
    hideCanvasWithFallback(canvas, 'radial-gradient(circle at center, rgba(0,212,255,0.18), transparent 70%)');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  const uniforms = {
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) }
  };
  const mat = new THREE.ShaderMaterial({ vertexShader: fullscreenVert, fragmentShader: finalFrag, uniforms });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w, h);
  };
  resize();
  window.addEventListener('resize', resize);

  let running = false;
  new IntersectionObserver((entries) => {
    running = entries[0].isIntersecting;
  }, { threshold: 0 }).observe(canvas);

  const clock = new THREE.Clock();
  const tick = () => {
    if (running) {
      uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);
  };
  tick();
}
