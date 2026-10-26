/**
 * Local CAPTCHA provider (no third-party service required).
 *
 * Generates a math-expression challenge rendered as inline SVG.
 * No font files — uses only system-availible SVG text elements, so it
 * works under Turbopack's virtual filesystem on Windows.
 *
 * The expected answer is stored server-side in an in-memory Map with a
 * 5-minute TTL, so the client never sees the plaintext answer — only
 * an opaque `id` used to look it up on submit.
 *
 * Anti-replay: each id is single-use (deleted on first verify attempt).
 */

import crypto from 'node:crypto';

interface CaptchaEntry {
  answer: string;
  createdAt: number;
}

const store = new Map<string, CaptchaEntry>();
const TTL_MS = 5 * 60 * 1000; // 5 minutes

/** Remove expired entries. */
export function sweepCaptcha(): void {
  const now = Date.now();
  for (const [id, entry] of store) {
    if (now - entry.createdAt > TTL_MS) store.delete(id);
  }
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function svgText(x: number, y: number, text: string, attrs = ''): string {
  // Escape XML entities
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<text x="${x}" y="${y}" font-family="monospace" font-size="36" font-weight="bold" fill="#1a1a1a" ${attrs}>${escaped}</text>`;
}

/**
 * Generate a new challenge.
 * Returns `{ id, svg }`. The SVG is rendered server-side so no external
 * network call is required.
 */
export function generateCaptcha(): { id: string; svg: string } {
  // Math expression captcha: "a + b = ?"
  const a = randInt(1, 20);
  const b = randInt(1, 20);
  const answer = String(a + b);
  const expression = `${a} + ${b}`;

  // Add subtle noise lines (SVG paths)
  const noiseLines = Array.from({ length: 3 }, () => {
    const x1 = randInt(5, 180);
    const y1 = randInt(10, 60);
    const x2 = randInt(5, 180);
    const y2 = randInt(10, 60);
    const color = `hsl(${randInt(0, 360)}, 30%, ${randInt(40, 70)}%)`;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.5" opacity="0.4"/>`;
  }).join('\n    ');

  // Add a few random dots for noise
  const noiseDots = Array.from({ length: 8 }, () => {
    const cx = randInt(5, 190);
    const cy = randInt(5, 65);
    const r = randInt(1, 2);
    const color = `hsl(${randInt(0, 360)}, 40%, ${randInt(40, 70)}%)`;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="0.5"/>`;
  }).join('\n    ');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="70" viewBox="0 0 200 70">
  <rect width="200" height="70" fill="#f8fafc"/>
    ${noiseLines}
    ${noiseDots}
  ${svgText(15, 48, expression)}
  ${svgText(155, 48, '?', 'fill="#9ca3af"')}
</svg>`;

  const id = crypto.randomBytes(16).toString('hex');
  store.set(id, { answer, createdAt: Date.now() });

  // Cap memory growth: sweep opportunistically.
  if (store.size > 500) sweepCaptcha();

  return { id, svg };
}

/**
 * Verify a submitted answer. Single-use: the id is removed on first attempt
 * so a token cannot be replayed.
 *
 * Returns `true` only when the answer matches and the entry is still within TTL.
 */
export function verifyCaptcha(id: string, answer: string): boolean {
  if (!id || typeof answer !== 'string') return false;

  const entry = store.get(id);
  if (!entry) return false;

  // Always consume the token (anti-replay), even on failure.
  store.delete(id);

  if (Date.now() - entry.createdAt > TTL_MS) return false;

  return answer.trim() === entry.answer;
}

export function captchaStoreSize(): number {
  return store.size;
}
