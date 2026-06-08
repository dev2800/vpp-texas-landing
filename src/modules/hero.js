import * as THREE from 'three';
import { gsap } from 'gsap';
import { godRaysFrag, fullscreenVert } from '../shaders/godRays.frag.js';
import { sampleTexas } from './texasShape.js';

const isMobile = window.matchMedia('(max-width: 880px)').matches;
const PARTICLE_COUNT = isMobile ? 1400 : 2800;

export function initHero({ reducedMotion }) {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const size = () => ({ w: canvas.clientWidth, h: canvas.clientHeight });
  let { w, h } = size();
  renderer.setSize(w, h, false);

  // Scenes — one for background (ortho fullscreen quad), one for 3D
  const bgScene = new THREE.Scene();
  const bgCamera = new THREE.Camera();
  const bgUniforms = {
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(w, h) },
    uCool: { value: new THREE.Color(0x00d4ff) },
    uWarm: { value: new THREE.Color(0xffaa00) }
  };
  const bgMat = new THREE.ShaderMaterial({
    vertexShader: fullscreenVert,
    fragmentShader: godRaysFrag,
    uniforms: bgUniforms,
    depthWrite: false
  });
  const bgQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
  bgScene.add(bgQuad);

  // 3D scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  camera.position.set(0, 0, 6);

  // Lights
  const amb = new THREE.AmbientLight(0xa0c8ff, 0.5);
  scene.add(amb);
  const keyLight = new THREE.PointLight(0x00d4ff, 2.4, 14);
  keyLight.position.set(2, 3, 4);
  scene.add(keyLight);
  const rim = new THREE.PointLight(0xffaa00, 1.2, 16);
  rim.position.set(-3, -1, 2);
  scene.add(rim);

  // ===== PARTICLES =====
  const positions = new Float32Array(PARTICLE_COUNT * 3);     // current
  const origin = new Float32Array(PARTICLE_COUNT * 3);        // center spawn
  const explode = new Float32Array(PARTICLE_COUNT * 3);       // explosion targets (random sphere)
  const texasTargets = new Float32Array(PARTICLE_COUNT * 3);
  const batteryTargets = new Float32Array(PARTICLE_COUNT * 3);
  const seeds = new Float32Array(PARTICLE_COUNT);

  const txPoints = sampleTexas(PARTICLE_COUNT, 1.4, 0);
  // battery surface — point cloud around a rounded box
  const batW = 1.0, batH = 1.6, batD = 0.55;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // start at center
    origin[i * 3 + 0] = (Math.random() - 0.5) * 0.05;
    origin[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
    origin[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
    positions[i * 3 + 0] = origin[i * 3 + 0];
    positions[i * 3 + 1] = origin[i * 3 + 1];
    positions[i * 3 + 2] = origin[i * 3 + 2];
    // explosion target: random unit sphere * radius
    const phi = Math.random() * Math.PI * 2;
    const cosTh = (Math.random() - 0.5) * 2;
    const sinTh = Math.sqrt(1 - cosTh * cosTh);
    const r = 2.6 + Math.random() * 1.0;
    explode[i * 3 + 0] = Math.cos(phi) * sinTh * r;
    explode[i * 3 + 1] = Math.sin(phi) * sinTh * r;
    explode[i * 3 + 2] = cosTh * r;
    // texas
    texasTargets[i * 3 + 0] = txPoints[i][0];
    texasTargets[i * 3 + 1] = txPoints[i][1];
    texasTargets[i * 3 + 2] = txPoints[i][2];
    // battery surface
    const face = Math.floor(Math.random() * 6);
    let bx, by, bz;
    const u = Math.random() - 0.5;
    const v = Math.random() - 0.5;
    if (face === 0) { bx = batW; by = u * batH; bz = v * batD; }
    else if (face === 1) { bx = -batW; by = u * batH; bz = v * batD; }
    else if (face === 2) { by = batH; bx = u * batW; bz = v * batD; }
    else if (face === 3) { by = -batH; bx = u * batW; bz = v * batD; }
    else if (face === 4) { bz = batD; bx = u * batW; by = v * batH; }
    else { bz = -batD; bx = u * batW; by = v * batH; }
    batteryTargets[i * 3 + 0] = bx;
    batteryTargets[i * 3 + 1] = by;
    batteryTargets[i * 3 + 2] = bz;
    seeds[i] = Math.random();
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0xeaf6ff,
    size: 0.04,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // ===== BATTERY MESH (hidden initially) =====
  const batteryGroup = new THREE.Group();
  batteryGroup.scale.set(0, 0, 0);
  scene.add(batteryGroup);

  const bodyGeo = new THREE.BoxGeometry(batW * 2, batH * 2, batD * 2, 1, 1, 1);
  // chamfer feel via wireframe edges
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x161b27,
    metalness: 0.85,
    roughness: 0.32,
    envMapIntensity: 1.0
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  batteryGroup.add(body);

  // Glowing seam edges
  const edges = new THREE.EdgesGeometry(bodyGeo);
  const edgeMat = new THREE.LineBasicMaterial({
    color: 0x00d4ff,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
  });
  const edgeLines = new THREE.LineSegments(edges, edgeMat);
  batteryGroup.add(edgeLines);

  // Sonnen logo stripe — a thin emissive panel on front
  const stripeGeo = new THREE.PlaneGeometry(batW * 1.4, batH * 0.06);
  const stripeMat = new THREE.MeshStandardMaterial({
    color: 0x00d4ff,
    emissive: 0x00d4ff,
    emissiveIntensity: 1.4,
    transparent: true,
    opacity: 0.95
  });
  const stripe = new THREE.Mesh(stripeGeo, stripeMat);
  stripe.position.set(0, batH * 0.4, batD + 0.001);
  batteryGroup.add(stripe);

  const stripe2 = stripe.clone();
  stripe2.position.set(0, -batH * 0.4, batD + 0.001);
  stripe2.material = stripeMat.clone();
  stripe2.material.color = new THREE.Color(0xffaa00);
  stripe2.material.emissive = new THREE.Color(0xffaa00);
  batteryGroup.add(stripe2);

  // Center "S" indicator
  const indicatorGeo = new THREE.CircleGeometry(0.18, 24);
  const indicatorMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x00d4ff,
    emissiveIntensity: 1.0
  });
  const indicator = new THREE.Mesh(indicatorGeo, indicatorMat);
  indicator.position.set(0, 0, batD + 0.002);
  batteryGroup.add(indicator);

  // ===== HOUSE ORBIT RING =====
  const ringGroup = new THREE.Group();
  ringGroup.position.set(0, -2.4, 0);
  scene.add(ringGroup);
  const NUM_HOUSES = 12;
  const houses = [];
  const RING_R = 3.5;
  for (let i = 0; i < NUM_HOUSES; i++) {
    const angle = (i / NUM_HOUSES) * Math.PI * 2;
    const houseGeo = new THREE.IcosahedronGeometry(0.08, 0);
    const houseMat = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.7,
      metalness: 0.6,
      roughness: 0.3
    });
    const house = new THREE.Mesh(houseGeo, houseMat);
    house.position.set(Math.cos(angle) * RING_R, 0, Math.sin(angle) * RING_R * 0.4);
    house.userData = { angle, baseY: 0 };
    ringGroup.add(house);
    houses.push(house);
  }
  // Connecting trail lines
  const lineGeo = new THREE.BufferGeometry();
  const linePts = new Float32Array(NUM_HOUSES * 3);
  for (let i = 0; i < NUM_HOUSES; i++) {
    const angle = (i / NUM_HOUSES) * Math.PI * 2;
    linePts[i * 3 + 0] = Math.cos(angle) * RING_R;
    linePts[i * 3 + 1] = 0;
    linePts[i * 3 + 2] = Math.sin(angle) * RING_R * 0.4;
  }
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePts, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x00d4ff,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending
  });
  const ring = new THREE.LineLoop(lineGeo, lineMat);
  ringGroup.add(ring);
  ringGroup.visible = false;
  ringGroup.scale.set(0.8, 0.8, 0.8);

  // ===== ANIMATION STATE =====
  // morph 0 = origin, 1 = explode, 2 = texas, 3 = battery
  const state = { morph: 0, particleOpacity: 1, batteryScale: 0, ringOpacity: 0 };

  const morphTo = (target, targets, duration) => {
    return gsap.to({ t: state.morph }, {
      t: target,
      duration,
      ease: 'power3.inOut',
      onUpdate() {
        const t = this.targets()[0].t;
        // Determine which 2 targets to blend
        let a, b, lerp;
        if (t < 1) { a = origin; b = explode; lerp = t; }
        else if (t < 2) { a = explode; b = texasTargets; lerp = t - 1; }
        else { a = texasTargets; b = batteryTargets; lerp = t - 2; }
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const i3 = i * 3;
          positions[i3] = a[i3] + (b[i3] - a[i3]) * lerp;
          positions[i3 + 1] = a[i3 + 1] + (b[i3 + 1] - a[i3 + 1]) * lerp;
          positions[i3 + 2] = a[i3 + 2] + (b[i3 + 2] - a[i3 + 2]) * lerp;
        }
        pGeo.attributes.position.needsUpdate = true;
        state.morph = t;
      }
    });
  };

  // Orchestrated awakening
  if (!reducedMotion) {
    const tl = gsap.timeline({ delay: 0.4 });
    tl.add(() => {}, 0)
      .to(state, { particleOpacity: 1, duration: 0.3 }, 0)
      .add(morphTo(1, null, 0.7), 0.1)        // explode
      .add(morphTo(2, null, 1.0), '+=0.1')    // form Texas
      .to({}, { duration: 0.9 })              // hold Texas
      .add(morphTo(3, null, 1.2), '<')        // morph to battery cloud (overlaps)
      .to(pMat, { opacity: 0, duration: 0.8 }, '-=0.4')
      .to(batteryGroup.scale, { x: 1, y: 1, z: 1, duration: 1.2, ease: 'back.out(1.5)' }, '-=0.9')
      .to(ringGroup, {
        onStart() { ringGroup.visible = true; },
        duration: 0.01
      }, '-=1')
      .to(ringGroup.scale, { x: 1, y: 1, z: 1, duration: 1.6, ease: 'power3.out' }, '-=1')
      .to(lineMat, { opacity: 0.45, duration: 1 }, '-=1');
  } else {
    // Skip the whole animation — just show battery + ring
    batteryGroup.scale.set(1, 1, 1);
    pMat.opacity = 0;
    ringGroup.visible = true;
    ringGroup.scale.set(1, 1, 1);
  }

  // ===== PARALLAX (mouse + gyro) =====
  const target = { x: 0, y: 0 };
  window.addEventListener('mousemove', (e) => {
    target.x = (e.clientX / window.innerWidth - 0.5) * 2;
    target.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // iOS gyro permission on first tap
  let gyroEnabled = false;
  const enableGyro = async () => {
    if (gyroEnabled) return;
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const r = await DeviceOrientationEvent.requestPermission();
        if (r === 'granted') gyroEnabled = true;
      } catch (e) { /* ignore */ }
    } else if (window.DeviceOrientationEvent) {
      gyroEnabled = true;
    }
  };
  window.addEventListener('touchstart', enableGyro, { once: true, passive: true });
  window.addEventListener('deviceorientation', (e) => {
    if (!gyroEnabled) return;
    // beta = front/back tilt, gamma = left/right
    if (e.beta == null || e.gamma == null) return;
    target.x = Math.max(-1, Math.min(1, e.gamma / 30));
    target.y = Math.max(-1, Math.min(1, (e.beta - 30) / 40));
  }, { passive: true });

  // ===== RESIZE =====
  const onResize = () => {
    const { w: nw, h: nh } = size();
    w = nw; h = nh;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    bgUniforms.uRes.value.set(w, h);
  };
  window.addEventListener('resize', onResize);
  onResize();

  // ===== RENDER LOOP =====
  const clock = new THREE.Clock();
  let smoothedX = 0, smoothedY = 0;
  const render = () => {
    const t = clock.getElapsedTime();
    bgUniforms.uTime.value = t;

    smoothedX += (target.x - smoothedX) * 0.06;
    smoothedY += (target.y - smoothedY) * 0.06;

    // Battery rotation (0.3deg/frame at ~60fps → ~18deg/sec)
    batteryGroup.rotation.y += 0.005;
    // Parallax tilt toward cursor
    batteryGroup.rotation.x = smoothedY * 0.35;
    batteryGroup.rotation.y += smoothedX * 0.0008;

    // Indicator pulse
    indicator.material.emissiveIntensity = 0.7 + Math.sin(t * 2) * 0.4;
    stripe.material.emissiveIntensity = 1.0 + Math.sin(t * 1.3) * 0.5;

    // Houses orbit slowly + bob
    if (ringGroup.visible) {
      ringGroup.rotation.y = t * 0.12;
      ringGroup.position.y = -2.4 + Math.sin(t * 0.6) * 0.08;
      for (const h of houses) {
        h.material.emissiveIntensity = 0.6 + Math.sin(t * 1.5 + h.userData.angle * 4) * 0.4;
      }
      // Pulse trail line opacity
      lineMat.opacity = 0.35 + Math.sin(t * 1.8) * 0.15;
    }

    renderer.autoClear = true;
    renderer.render(bgScene, bgCamera);
    renderer.autoClear = false;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  };
  render();
}
