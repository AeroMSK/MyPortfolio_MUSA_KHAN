"use client";

import { useEffect, useRef } from 'react';

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;

#define NUM_COLORS 8
uniform vec4 u_colors[NUM_COLORS];
uniform int u_colors_length;
uniform float u_seed;
uniform float u_speed;
uniform float u_scale;
uniform float u_turbAmp;
uniform float u_turbFreq;
uniform float u_turbIter;
uniform float u_waveFreq;
uniform float u_distBias;
uniform float u_dither;
uniform float u_ditherMode;
uniform float u_exposure;
uniform float u_contrast;
uniform float u_saturation;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

const float GOLDEN_ANGLE = 2.3999632;
const float TAU = 6.28318530;

uvec3 hash3(uvec3 v) {
  v = v * 1664525u + 1013904223u;
  v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
  v ^= v >> 16u;
  v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
  return v;
}

vec3 seedRandom(float sv) {
  uvec3 s = uvec3(
    floatBitsToUint(sv),
    floatBitsToUint(sv * 1.5 + 7.31),
    floatBitsToUint(sv * 2.7 + 13.37)
  );
  return vec3(hash3(s)) / float(0xFFFFFFFFu);
}

vec3 toLinear(vec3 c) { return pow(c, vec3(2.2)); }
vec3 toSrgb(vec3 c) { return pow(clamp(c, 0.0, 1.0), vec3(0.4545)); }

vec3 linearToOklab(vec3 c) {
  float l = pow(max(0.4122214708*c.r + 0.5363325363*c.g + 0.0514459929*c.b, 0.0), 1.0/3.0);
  float m = pow(max(0.2119034982*c.r + 0.6806995451*c.g + 0.1073969566*c.b, 0.0), 1.0/3.0);
  float s = pow(max(0.0883024619*c.r + 0.2817188376*c.g + 0.6299787005*c.b, 0.0), 1.0/3.0);
  return vec3(
    0.2104542553*l + 0.7936177850*m - 0.0040720468*s,
    1.9779984951*l - 2.4285922050*m + 0.4505937099*s,
    0.0259040371*l + 0.7827717662*m - 0.8086757660*s
  );
}

vec3 oklabToLinear(vec3 c) {
  float l = c.x + 0.3963377774*c.y + 0.2158037573*c.z;
  float m = c.x - 0.1055613458*c.y - 0.0638541728*c.z;
  float s = c.x - 0.0894841775*c.y - 1.2914855480*c.z;
  l = l*l*l; m = m*m*m; s = s*s*s;
  return vec3(
    +4.0767416621*l - 3.3077115913*m + 0.2309699292*s,
    -1.2684380046*l + 2.6097574011*m - 0.3413193965*s,
    -0.0041960863*l - 0.7034186147*m + 1.7076147010*s
  );
}

vec3 oklabToLch(vec3 lab) { return vec3(lab.x, length(lab.yz), atan(lab.z, lab.y)); }
vec3 lchToOklab(vec3 lch) { return vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z)); }

vec3 mixLch(vec3 a, vec3 b, float t) {
  vec3 la = oklabToLch(a), lb = oklabToLch(b);
  if (la.y < 0.05) la.z = lb.z;
  if (lb.y < 0.05) lb.z = la.z;
  float dh = lb.z - la.z;
  if (dh >  3.14159265) dh -= TAU;
  if (dh < -3.14159265) dh += TAU;
  return lchToOklab(vec3(mix(la.x, lb.x, t), mix(la.y, lb.y, t), la.z + dh * t));
}

vec3 getColor(int idx) {
  int i = clamp(idx, 0, u_colors_length - 1);
  return u_colors[i].rgb;
}

vec3 paletteN(float t, int count) {
  if (count < 2) return toLinear(getColor(0));
  float seg = 1.0 / float(count - 1);
  t = clamp(t, 0.0, 1.0);
  int idx = min(int(floor(t / seg)), count - 2);
  float lt = clamp((t - float(idx) * seg) / seg, 0.0, 1.0);
  return oklabToLinear(mixLch(
    linearToOklab(toLinear(getColor(idx))),
    linearToOklab(toLinear(getColor(idx + 1))),
    lt
  ));
}

float IGN(vec2 uv) { return fract(52.9829189 * fract(dot(uv, vec2(0.06711056, 0.00583715)))); }

float getDither(vec2 I, float mode) {
  if (mode < 0.5) return 0.5;
  if (mode < 1.5) return IGN(I);
  return fract(sin(dot(I, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 applyCS(vec3 rgb, float contrast, float sat) {
  vec3 lab = linearToOklab(rgb);
  float C = length(lab.yz), h = atan(lab.z, lab.y);
  lab.x = clamp((lab.x - 0.5) * contrast + 0.5, 0.0, 1.0);
  C *= sat;
  lab.y = C * cos(h);
  lab.z = C * sin(h);
  return oklabToLinear(lab);
}

vec3 softGamutMap(vec3 rgb) {
  if (min(rgb.r, min(rgb.g, rgb.b)) >= 0.0 && max(rgb.r, max(rgb.g, rgb.b)) <= 1.0) return rgb;
  vec3 lab = linearToOklab(max(rgb, 0.0));
  float L = clamp(lab.x, 0.0, 1.0), C = length(lab.yz), h = atan(lab.z, lab.y);
  float mc = 0.4 * (1.0 - pow(abs(2.0 * L - 1.0), 2.0));
  if (C > mc * 0.7) {
    float k = mc * 0.7;
    C = k + (mc - k) * tanh((C - k) / (mc - k + 0.001));
  }
  return clamp(oklabToLinear(vec3(L, C * cos(h), C * sin(h))), 0.0, 1.0);
}

void main() {
  vec2 fragCoord = v_uv * u_resolution;
  vec2 r = u_resolution;
  vec2 p = (fragCoord * 2.0 - r) / r.y;

  vec3 s1 = seedRandom(u_seed);
  vec3 s2 = seedRandom(u_seed + 100.0);
  vec2 seedPhase = (s2.xy - 0.5) * TAU;

  float seedAngle = u_seed * GOLDEN_ANGLE;
  float cs = cos(seedAngle), sn = sin(seedAngle);
  p = mat2(cs, -sn, sn, cs) * p;

  float dither = getDither(floor(fragCoord / u_pixelRatio), u_ditherMode);
  float freq = 1.0 / max(u_turbFreq, 0.01);
  float totalVal = 0.0, totalWeight = 0.0;

  for (float i = 0.0; i < 4.0; i++) {
    float eph = i / 4.0;
    vec2 q = p * u_scale;
    float a = seedPhase.x, d = seedPhase.y;
    for (int j = 2; j < 13; j++) {
      if (j >= int(u_turbIter)) break;
      float fj = float(j);
      float t1 = u_time * 0.3 * u_speed;
      q += u_turbAmp * sin(q.yx / freq * fj + t1 + vec2(a, d) + s1.xy * fj) / fj;
      a += cos(fj + d * 1.2 + q.x * 2.0 - t1 + s2.z);
      d += sin(fj * q.y + a + s1.z + t1 + s2.y);
    }
    float v = 0.5 + 0.5 * sin(length(q.yx + vec2(a, d) * 0.2) * u_waveFreq + i * i + s1.x);
    float w = smoothstep(0.0, 0.5, eph) * smoothstep(1.0, 0.5, eph);
    totalVal += v * w;
    totalWeight += w;
  }

  float val = clamp((totalVal / totalWeight - 0.3) / 0.4, 0.0, 1.0);
  val = pow(val, exp(-u_distBias));
  val = clamp(val + (dither - 0.5) * u_dither, 0.0, 1.0);

  vec3 col = paletteN(val, u_colors_length) * u_exposure;
  col = softGamutMap(applyCS(col, u_contrast, u_saturation));
  fragColor = vec4(toSrgb(col), 1.0);
}
`;

const VERTEX_SHADER = `#version 300 es
precision mediump float;
in vec2 aPos;
out vec2 v_uv;
void main() {
  v_uv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

function hexToRgb01(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b, 1];
}

/**
 * GradientCanvas
 *
 * A WebGL2 animated gradient using turbulence noise + Oklab color mixing.
 * Extracted from the Claret Framer template footer animation.
 *
 * @param {string[]}  colors      - Array of hex colors (2–8), palette mapped through Oklab/LCH
 * @param {number}    seed        - Random seed, changes the shape of the animation
 * @param {number}    speed       - Animation speed (default 0.27)
 * @param {number}    scale       - Noise zoom level (default 0.36)
 * @param {number}    turbAmp     - Turbulence amplitude / warp strength (default 0.25)
 * @param {number}    turbFreq    - Turbulence frequency (default 0.1)
 * @param {number}    turbIter    - Turbulence iterations, more = more detail (default 10)
 * @param {number}    waveFreq    - Wave frequency mapped over noise (default 3)
 * @param {number}    distBias    - Distribution bias, affects contrast curve (default 0)
 * @param {number}    dither      - Dither strength, reduces banding (default 0.2)
 * @param {number}    ditherMode  - 0=off, 1=smooth IGN, 2=grain (default 1)
 * @param {number}    exposure    - Output exposure multiplier (default 1.1)
 * @param {number}    contrast    - Oklab contrast (default 1.1)
 * @param {number}    saturation  - Oklab saturation (default 1.0)
 * @param {string}    className   - CSS class on the canvas element
 * @param {object}    style       - Inline styles merged onto the canvas element
 *
 * Usage:
 *   <GradientCanvas style={{ width: '100%', height: '400px' }} />
 *
 *   <GradientCanvas
 *     colors={['#000000', '#4f46e5', '#1e1b4b', '#0f0e2e']}
 *     speed={0.5}
 *     waveFreq={5}
 *     style={{ width: '100%', height: '300px', borderRadius: 12 }}
 *   />
 */
export default function GradientCanvas({
  colors      = ['#070707', '#1D1F22', '#111214', '#0B0B0D', '#161719'],
  seed        = 462,
  speed       = 0.27,
  scale       = 0.36,
  turbAmp     = 0.25,
  turbFreq    = 0.1,
  turbIter    = 10,
  waveFreq    = 3,
  distBias    = 0,
  dither      = 0.2,
  ditherMode  = 1,
  exposure    = 1.1,
  contrast    = 1.1,
  saturation  = 1.0,
  className   = '',
  style       = {},
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef    = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const lastFrameRef = useRef(performance.now());
  const inViewRef = useRef(true);
  const pageVisibleRef = useRef(true);
  const isMobileRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const gl = canvas.getContext('webgl2');
    if (!gl) {
      console.warn('GradientCanvas: WebGL2 not supported');
      return;
    }

    const mkShader = (type: number, src: string): WebGLShader => {
      const s = gl.createShader(type);
      if (!s) throw new Error('Failed to create shader');
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('GradientCanvas shader error:', gl.getShaderInfoLog(s));
      }
      return s;
    };

    const prog = gl.createProgram();
    if (!prog) throw new Error('Failed to create program');
    gl.attachShader(prog, mkShader(gl.VERTEX_SHADER,   VERTEX_SHADER));
    gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(prog, name);
    const MAX_COLORS = 8;

    const drawFrame = (t: number) => {
      gl.viewport(0, 0, canvas.width, canvas.height);

      const flat: number[] = [];
      for (let i = 0; i < MAX_COLORS; i++) {
        flat.push(...(i < colors.length ? hexToRgb01(colors[i]) : [0, 0, 0, 1]));
      }
      gl.uniform4fv(u('u_colors'), new Float32Array(flat));
      gl.uniform1i(u('u_colors_length'), Math.min(colors.length, MAX_COLORS));
      gl.uniform1f(u('u_seed'),        seed);
      gl.uniform1f(u('u_speed'),       speed);
      gl.uniform1f(u('u_scale'),       scale);
      gl.uniform1f(u('u_turbAmp'),     turbAmp);
      gl.uniform1f(u('u_turbFreq'),    turbFreq);
      gl.uniform1f(u('u_turbIter'),    turbIter);
      gl.uniform1f(u('u_waveFreq'),    waveFreq);
      gl.uniform1f(u('u_distBias'),    distBias);
      gl.uniform1f(u('u_dither'),      dither);
      gl.uniform1f(u('u_ditherMode'),  ditherMode);
      gl.uniform1f(u('u_exposure'),    exposure);
      gl.uniform1f(u('u_contrast'),    contrast);
      gl.uniform1f(u('u_saturation'),  saturation);
      gl.uniform1f(u('u_time'),        t);
      gl.uniform2f(u('u_resolution'),  canvas.width, canvas.height);
      gl.uniform1f(u('u_pixelRatio'),  dpr);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const stopLoop = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const tick = (now) => {
      elapsedRef.current += now - lastFrameRef.current;
      lastFrameRef.current = now;
      drawFrame(elapsedRef.current / 1000);

      if (inViewRef.current && pageVisibleRef.current && !isMobileRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };

    const startLoop = () => {
      if (!inViewRef.current || !pageVisibleRef.current || isMobileRef.current || rafRef.current !== null) return;
      lastFrameRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    };

    drawFrame(elapsedRef.current / 1000);

    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        if (inViewRef.current && pageVisibleRef.current) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.01 }
    );
    io.observe(canvas);

    const onVisibilityChange = () => {
      pageVisibleRef.current = !document.hidden;
      if (inViewRef.current && pageVisibleRef.current) {
        startLoop();
      } else {
        stopLoop();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const onMediaChange = (e) => {
      isMobileRef.current = e.matches;
      if (!isMobileRef.current && inViewRef.current && pageVisibleRef.current) {
        startLoop();
      } else {
        stopLoop();
      }
    };
    mediaQuery.addEventListener('change', onMediaChange);
    isMobileRef.current = mediaQuery.matches;

    startLoop();

    return () => {
      stopLoop();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      mediaQuery.removeEventListener('change', onMediaChange);
      ro.disconnect();
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, [
    colors, seed, speed, scale, turbAmp, turbFreq, turbIter,
    waveFreq, distBias, dither, ditherMode, exposure, contrast, saturation,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
    />
  );
}