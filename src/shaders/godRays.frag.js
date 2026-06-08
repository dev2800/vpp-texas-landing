// Fragment shader for volumetric god-ray sweeps + starfield
export const godRaysFrag = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec3 uCool;
uniform vec3 uWarm;
varying vec2 vUv;

// Hash for stars
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float stars(vec2 uv, float density) {
  vec2 grid = floor(uv * density);
  vec2 f = fract(uv * density) - 0.5;
  float h = hash(grid);
  float size = step(0.985, h);
  float twinkle = 0.6 + 0.4 * sin(uTime * 2.0 + h * 24.0);
  float d = length(f);
  return size * smoothstep(0.05, 0.0, d) * twinkle;
}

void main() {
  vec2 uv = vUv;
  vec2 p = uv - 0.5;
  p.x *= uRes.x / uRes.y;

  // Background gradient — vignetted deep space
  float vignette = 1.0 - smoothstep(0.4, 1.2, length(p));
  vec3 bg = mix(vec3(0.020, 0.030, 0.060), vec3(0.030, 0.055, 0.110), vignette);

  // God rays — sweeping diagonal beams
  float t = uTime * 0.08;
  float beam1 = smoothstep(0.0, 0.5, sin((uv.x - uv.y * 0.5 + t) * 8.0));
  float beam2 = smoothstep(0.4, 0.95, sin((uv.x * 1.3 - uv.y + t * 0.7) * 6.0));
  float rays = beam1 * 0.18 + beam2 * 0.12;
  rays *= vignette;
  vec3 rayColor = mix(uCool, uWarm, sin(t * 1.5) * 0.5 + 0.5);

  // Stars (two layers)
  float s = stars(uv + vec2(0.0, t * 0.05), 80.0) * 0.9;
  s += stars(uv * 1.7 + vec2(t * 0.03, 0.0), 140.0) * 0.5;

  vec3 col = bg + rays * rayColor + vec3(s);
  gl_FragColor = vec4(col, 1.0);
}
`;

export const fullscreenVert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;
