import { NextResponse } from 'next/server';

/**
 * Shared anti-bot helpers for public form submissions.
 *
 * Defense layers (inexpensive, no external services):
 * 1. Honeypot — a hidden field that real users never touch. If filled, the
 *    submission is silently discarded (200 generic response so bots cannot
 *    distinguish the rule).
 * 2. Timing — the form records the render timestamp client-side; submissions
 *    arriving faster than MIN_SUBMIT_MS are rejected as automated.
 * 3. CAPTCHA — `src/lib/captcha.ts` challenge/verify, consumed single-use.
 */

export const HONEYPOT_FIELD = 'website';
export const MIN_SUBMIT_MS = 3_000;

export interface AntiBotPayload {
  [HONEYPOT_FIELD]?: string;
  captchaId?: string;
  captchaAnswer?: string;
  submittedAt?: string; // ISO timestamp captured when the form mounted
}

/**
 * Returns a human-readable rejection reason, or null if the submission
 * passes the honeypot + timing checks. The caller is still responsible for
 * verifying the CAPTCHA separately.
 */
export function checkAntiBot(body: AntiBotPayload): string | null {
  const honeypot = body[HONEYPOT_FIELD];
  if (honeypot && typeof honeypot === 'string' && honeypot.trim().length > 0) {
    // Honeypot hit — return empty string as sentinel so the caller can
    // distinguish "bot caught" from "all clear" (both are falsy otherwise).
    return '';
  }

  const submittedAt = body.submittedAt;
  if (submittedAt) {
    const t = new Date(submittedAt).getTime();
    if (!Number.isNaN(t)) {
      const elapsed = Date.now() - t;
      if (elapsed < MIN_SUBMIT_MS) {
        return 'Envío demasiado rápido. Por favor, espere unos segundos.';
      }
    }
  }

  return null;
}

/**
 * Build a generic 200 response for honeypot hits so automated scanners
 * cannot fingerprint the rejection.
 */
export function botOkResponse() {
  return NextResponse.json(
    { success: true, message: 'Gracias, su solicitud ha sido recibida.' },
    { status: 200 },
  );
}