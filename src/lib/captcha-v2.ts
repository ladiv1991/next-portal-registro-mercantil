/**
 * CAPTCHA v2 — Alfanumérico complejo (SVG)
 *
 * Sustituye al captcha matemático simple (fácil para OCR/IA).
 * Distorsiones aplicadas:
 *   - Rotación aleatoria por carácter
 *   - Desplazamiento vertical por carácter
 *   - Tamaño variable por carácter
 *   - Color HSL variable por carácter
 *   - Líneas de ruido (6-12) con opacidad
 *   - Ondulaciones horizontales (wave paths)
 *   - Puntos de ruido (15-30)
 *   - Carácter ambiguo eliminado (0/O/1/l/I)
 *
 * Estado servidor: Map<id, entry> con TTL 5 min. Single-use.
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

/** Characters that don't look alike: no 0/O/1/l/I */
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
  const W = 220, H = 72;
  const baseFontSize = randInt(26, 32);

  // ---- Individual character elements with per-char distortion ----
  const charElements = chars.split('').map((ch, i) => {
    const rot = rand(-20, 20);
    const ty = randInt(-8, 8);
    const fs = baseFontSize + randInt(-4, 4);
    const opacity = rand(0.72, 1);
    const fillHue = randInt(0, 360);
    const fillLight = randInt(12, 32);
    // X position: spread chars across the width
    const slotWidth = (W - 30) / chars.length;
    const elemX = 12 + i * slotWidth + randInt(-3, 3);
    return `<g transform="translate(${elemX},${ty}) rotate(${rot})">
      <text x="0" y="${fs}" font-family="'Courier New', monospace" font-size="${fs}"
            font-weight="bold" fill="hsl(${fillHue},50%,${fillLight}%)" opacity="${opacity}">${ch}</text>
    </g>`;
  }).join('\n    ');

  // ---- Noise lines ----
  const noiseLines = Array.from({ length: randInt(8, 14) }, () => {
    const x1 = randInt(0, W), y1 = randInt(0, H);
    const x2 = randInt(0, W), y2 = randInt(0, H);
    const color = `hsl(${randInt(0, 360)},${randInt(30, 60)}%,${randInt(25, 50)}%)`;
    return svgLine(x1, y1, x2, y2, color, rand(0.5, 1.8), rand(0.15, 0.45));
  }).join('\n    ');

  // ---- Wave paths (sinusoidal干扰) ----
  const wavePaths = Array.from({ length: randInt(2, 4) }, (_, idx) => {
    const baseY = randInt(12, H - 12);
    const points = Array.from({ length: 12 }, (_, i) => {
      const px = i * (W / 11);
      const py = baseY + Math.sin(i * 0.7 + idx * 1.5) * rand(8, 16);
      return `${px.toFixed(1)},${py.toFixed(1)}`;
    });
    const color = `hsl(${randInt(0, 360)},40%,${randInt(35, 55)}%)`;
    return `<polyline points="${points.join(' ')}" fill="none" stroke="${color}" `
         + `stroke-width="${rand(0.6, 1.2)}" opacity="${rand(0.25, 0.5)}"/>`;
  }).join('\n    ');

  // ---- Noise dots ----
  const noiseDots = Array.from({ length: randInt(20, 40) }, () => {
    const cx = randInt(0, W), cy = randInt(0, H);
    const r = rand(0.5, 2.2);
    const color = `hsl(${randInt(0, 360)},40%,${randInt(30, 55)}%)`;
    return svgCircle(cx, cy, r, color, rand(0.25, 0.55));
  }).join('\n    ');

  // ---- Random arcs for extra confusion ----
  const arcs = Array.from({ length: randInt(1, 3) }, () => {
    const cx = randInt(20, W - 20), cy = randInt(10, H - 10);
    const r = randInt(15, 35);
    const color = `hsl(${randInt(0, 360)},30%,${randInt(40, 55)}%)`;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" `
         + `stroke-width="${rand(0.5, 1)}" opacity="${rand(0.15, 0.3)}" `
         + `stroke-dasharray="${randInt(3, 8)},${randInt(2, 6)}"/>`;
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
    ${noiseLines}
    ${wavePaths}
    ${arcs}
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
  return answer.trim().toLowerCase() === entry.answer.toLowerCase();
}

export function captchaStoreSizeV2(): number {
  return store.size;
}
