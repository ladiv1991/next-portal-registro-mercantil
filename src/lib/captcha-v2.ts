/**
 * CAPTCHA v2 — Alfanumérico complejo con distorsiones avanzadas
 *
 * Sustituye al captcha matemático simple (fácil para OCR/IA).
 * Distorsiones aplicadas:
 *   - Rotación aleatoria por carácter (±30°)
 *   - Skew/traslación diagonal por carácter
 *   - Desplazamiento vertical por carácter
 *   - Tamaño variable por carácter
 *   - Color HSL variable por carácter
 *   - Opacidad variable por carácter
 *   - Fondo con textura de puntos sutiles
 *   - Líneas de ruido cruzadas (10-18)
 *   - Ondulaciones sinusoidales horizontales (3-5)
 *   - Puntos de ruido densos (30-60)
 *   - Arcos punteados de confusión (2-5)
 *   - Líneas de tachado / subrayado por carácter
 *   - Carácter ambiguo eliminado (0/O/1/l/I)
 *
 * Estado servidor: Map<id, entry> con TTL 5 min. Single-use.
 * Case-sensitive: la respuesta debe coincidir exactamente en mayúsculas/minúsculas.
 */

import crypto from 'node:crypto';

interface CaptchaEntry {
  answer: string;
  createdAt: number;
}

const store = new Map<string, CaptchaEntry>();
const TTL_MS = 5 * 60 * 1000;

export function sweepCaptcha(): void {
  const now = Date.now();
  for (const [id, entry] of store) {
    if (now - entry.createdAt > TTL_MS) store.delete(id);
  }
}

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}

/** Characters kept: no 0/O/1/l/I (ambiguous pairs), but keeps mixed case A-Z a-z */
const SAFE_CHARS = '23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';

function randomChars(len: number): string {
  let s = '';
  for (let i = 0; i < len; i++) s += SAFE_CHARS[randInt(0, SAFE_CHARS.length - 1)];
  return s;
}

// ---------------------------------------------------------------------------
// SVG helpers
// ---------------------------------------------------------------------------

function svgLine(x1: number, y1: number, x2: number, y2: number,
  color: string, width: number, opacity: number): string {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" `
       + `stroke="${color}" stroke-width="${width}" opacity="${opacity}"/>`;
}

function svgCircle(cx: number, cy: number, r: number,
  color: string, opacity: number): string {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="${opacity}"/>`;
}

function svgEllipse(cx: number, cy: number, rx: number, ry: number,
  color: string, opacity: number): string {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" `
       + `fill="none" stroke="${color}" stroke-width="0.8" opacity="${opacity}"/>`;
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

export interface CaptchaResult {
  id: string;
  svg: string;
  /** Length of the challenge string (for client reference) */
  length: number;
}

export function generateCaptchaV2(): CaptchaResult {
  const chars = randomChars(randInt(5, 6));
  const answer = chars;
  const W = 260, H = 80;
  const baseFontSize = randInt(28, 36);

  // ---- Background texture (subtle dot pattern) ----
  const bgDots = Array.from({ length: 80 }, () => {
    const cx = randInt(0, W), cy = randInt(0, H);
    const r = rand(0.3, 0.8);
    return svgCircle(cx, cy, r, '#c0c8d4', rand(0.08, 0.18));
  }).join('\n    ');

  // ---- Individual character elements with per-char distortion ----
  const charElements = chars.split('').map((ch, i) => {
    const rot = rand(-30, 30);           // wider rotation range
    const tx = rand(-4, 4);              // horizontal skew offset
    const ty = randInt(-10, 10);         // vertical offset
    const skew = rand(-15, 15);          // diagonal skew degrees
    const fs = baseFontSize + randInt(-5, 5);  // size variation
    const opacity = rand(0.65, 1.0);
    const fillHue = randInt(0, 360);
    const fillSat = randInt(40, 80);
    const fillLight = randInt(30, 60);       // moderate contrast: lighter chars on light bg
    const fontWeight = randInt(400, 900);

    // X position: spread chars across the width with some overlap
    const slotWidth = (W - 40) / Math.max(chars.length, 1);
    const elemX = 18 + i * slotWidth + randInt(-5, 5);

    // Inter-character overlap effect: each char slightly offset on Y relative to neighbors
    const neighborShift = Math.sin(i * 1.7) * randInt(-6, 6);

    return `<g transform="translate(${elemX},${ty + neighborShift}) rotate(${rot}) skewX(${skew})">
      <text x="${tx}" y="${fs}" font-family="'Courier New', monospace"
            font-size="${fs}" font-weight="${fontWeight}"
            fill="hsl(${fillHue}, ${fillSat}%, ${fillLight}%)"
            opacity="${opacity}">${ch}</text>
    </g>`;
  }).join('\n    ');

  // ---- Noise lines (crossing, not parallel) ----
  const noiseLines = Array.from({ length: randInt(10, 18) }, () => {
    const x1 = randInt(0, W), y1 = randInt(0, H);
    const x2 = randInt(0, W), y2 = randInt(0, H);
    // Ensure lines cross the character area more often
    const color = `hsl(${randInt(0, 360)},${randInt(30, 70)}%,${randInt(20, 50)}%)`;
    return svgLine(x1, y1, x2, y2, color, rand(0.4, 2.0), rand(0.12, 0.4));
  }).join('\n    ');

  // ---- Wave paths (multiple sinusoidal干扰) ----
  const wavePaths = Array.from({ length: randInt(3, 5) }, (_, idx) => {
    const baseY = randInt(10, H - 10);
    const freq = rand(0.05, 0.15);
    const amp = rand(6, 20);
    const points = Array.from({ length: 16 }, (_, i) => {
      const px = i * (W / 15);
      const py = baseY + Math.sin(px * freq + idx * 2.1) * amp;
      return `${px.toFixed(1)},${py.toFixed(1)}`;
    });
    const color = `hsl(${randInt(0, 360)},${randInt(30, 60)}%,${randInt(30, 55)}%)`;
    return `<polyline points="${points.join(' ')}" fill="none" stroke="${color}" `
         + `stroke-width="${rand(0.5, 1.5)}" opacity="${rand(0.2, 0.45)}"/>`;
  }).join('\n    ');

  // ---- Noise dots (dense) ----
  const noiseDots = Array.from({ length: randInt(30, 60) }, () => {
    const cx = randInt(0, W), cy = randInt(0, H);
    const r = rand(0.4, 2.5);
    const color = `hsl(${randInt(0, 360)},${randInt(30, 60)}%,${randInt(25, 55)}%)`;
    return svgCircle(cx, cy, r, color, rand(0.2, 0.5));
  }).join('\n    ');

  // ---- Random arcs / ellipses for extra confusion ----
  const arcs = Array.from({ length: randInt(2, 5) }, () => {
    const cx = randInt(20, W - 20), cy = randInt(10, H - 10);
    const rx = randInt(12, 40), ry = randInt(6, 25);
    const color = `hsl(${randInt(0, 360)},${randInt(20, 50)}%,${randInt(35, 55)}%)`;
    return svgEllipse(cx, cy, rx, ry, color, rand(0.12, 0.35));
  }).join('\n    ');

  // ---- Character-specific strike-through / underline overlays ----
  const overlays = chars.split('').map((_, i) => {
    if (Math.random() > 0.5) return '';
    const slotWidth = (W - 40) / Math.max(chars.length, 1);
    const cx = 18 + i * slotWidth + slotWidth / 2 + randInt(-3, 3);
    const cy = H / 2 + randInt(-4, 4);
    const color = `hsl(${randInt(0, 360)},40%,${randInt(30, 50)}%)`;
    const isStrike = Math.random() > 0.5;
    if (isStrike) {
      // Horizontal line through character
      return svgLine(cx - 12, cy, cx + 12, cy, color, rand(0.8, 1.5), rand(0.3, 0.55));
    } else {
      // Wavy underline
      const pts = Array.from({ length: 6 }, (_, j) => {
        const px = cx - 12 + j * 5;
        const py = cy + 8 + Math.sin(j * 1.5) * 2;
        return `${px},${py}`;
      });
      return `<polyline points="${pts.join(' ')}" fill="none" stroke="${color}" `
           + `stroke-width="${rand(0.6, 1.2)}" opacity="${rand(0.3, 0.5)}"/>`;
    }
  }).join('\n    ');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f0f4f8"/>
      <stop offset="100%" stop-color="#dde4ed"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
    ${bgDots}
    ${noiseLines}
    ${wavePaths}
    ${arcs}
    ${overlays}
    ${noiseDots}
    ${charElements}
</svg>`;

  const id = crypto.randomBytes(16).toString('hex');
  store.set(id, { answer, createdAt: Date.now() });
  if (store.size > 500) sweepCaptcha();
  return { id, svg, length: chars.length };
}

// ---------------------------------------------------------------------------
// Verify
// ---------------------------------------------------------------------------

export function verifyCaptchaV2(id: string, answer: string): boolean {
  if (!id || typeof answer !== 'string') return false;
  const entry = store.get(id);
  if (!entry) return false;
  store.delete(id); // anti-replay
  if (Date.now() - entry.createdAt > TTL_MS) return false;
  // EXACT match — case sensitive, no trimming to prevent bypass attempts
  return answer === entry.answer;
}

export function captchaStoreSizeV2(): number {
  return store.size;
}
