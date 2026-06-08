// Animated Voronoi-style background for the stats section. WebGL fragment shader for performance.
import * as THREE from 'three';
import { fullscreenVert } from '../shaders/godRays.frag.js';
import { tryRenderer, hideCanvasWithFallback } from './webglGuard.js';

const voronoiFrag = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
varying vec2 vUv;

vec2 hash2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

// Returns vec3(d1, d2, cellId) where d1 = nearest dist, d2 = second nearest
vec3 voronoi(vec2 uv) {
  vec2 ip = floor(uv);
  vec2 fp = fract(uv);
  float d1 = 8.0, d2 = 8.0;
  float id = 0.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = hash2(ip + g);
      o = 0.5 + 0.5 * sin(uTime * 0.4 + 6.2831 * o);
      vec2 r = g + o - fp;
      float d = dot(r, r);
      if (d < d1) {
        d2 = d1;
        d1 = d;
        id = hash2(ip + g).x;
      } else if (d < d2) {
        d2 = d;
      }
    }
  }
  return vec3(sqrt(d1), sqrt(d2), id);
}

void main() {
  vec2 uv = vUv;
  uv.x *= uRes.x / uRes.y;
  vec2 p = uv * 6.0;
  vec3 v = voronoi(p);
  // Edge: d2 - d1 small => near border
  float edge = smoothstep(0.04, 0.0, v.y - v.x);

  vec3 cellCol = mix(vec3(0.020, 0.038, 0.078), vec3(0.030, 0.058, 0.118), v.z);
  vec3 edgeCol = vec3(0.0, 0.83, 1.0);
  vec3 col = mix(cellCol, edgeCol, edge);

  // Subtle interior shimmer
  col += 0.04 * vec3(sin(uTime + v.z * 12.0));
  gl_FragColor = vec4(col, 0.9);
}
`;

export function initVoronoi({ reducedMotion }) {
  const canvas = document.getElementById('voronoiCanvas');
  if (!canvas) return;
  if (reducedMotion) {
    canvas.style.background = 'radial-gradient(ellipse at center, rgba(0,212,255,0.10), transparent 70%)';
    return;
  }

  const renderer = tryRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: 'low-power'
  });
  if (!renderer) {
    hideCanvasWithFallback(canvas, 'radial-gradient(ellipse at center, rgba(0,212,255,0.10), transparent 70%)');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  const uniforms = {
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) }
  };
  const mat = new THREE.ShaderMaterial({
    vertexShader: fullscreenVert,
    fragmentShader: voronoiFrag,
    uniforms,
    transparent: true
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  scene.add(quad);

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w, h);
  };
  resize();
  window.addEventListener('resize', resize);

  let running = false;
  const obs = new IntersectionObserver((entries) => {
    running = entries[0].isIntersecting;
  }, { threshold: 0 });
  obs.observe(canvas);

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
