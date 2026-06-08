// Tiny helper: try to construct a WebGLRenderer, return null on failure.
// Caller hides the canvas + falls back to CSS.
import * as THREE from 'three';

let _supported = null;

export function isWebGLSupported() {
  if (_supported !== null) return _supported;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    _supported = !!gl;
  } catch (e) {
    _supported = false;
  }
  return _supported;
}

export function tryRenderer(opts) {
  if (!isWebGLSupported()) return null;
  try {
    return new THREE.WebGLRenderer(opts);
  } catch (e) {
    console.warn('WebGL renderer creation failed', e);
    return null;
  }
}

export function hideCanvasWithFallback(canvas, fallbackBg) {
  if (!canvas) return;
  if (fallbackBg) canvas.style.background = fallbackBg;
  canvas.style.opacity = '0.5';
}
