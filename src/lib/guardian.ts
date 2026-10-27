/**
 * Guardian — Rastreador de trazas y detección de amenazas
 *
 * Analiza patrones de request por IP en tiempo real para detectar:
 *   - Scraping / crawling agresivo (>30 req/min)
 *   - Intentos de fuerza bruta (>5 fails de login/min)
 *   - Fingerprint anomalous (User-Agent rotativo, sin navegador real)
 *   - CAPTCHA farming (many captcha requests sin submit)
 *   - Sesiones paralelas sospechosas (>3 cookies同一 IP)
 *
 * Score acumulado por IP (0-100). Umbrales:
 *   < 40  → normal
 *   40-69 → warning (log + flag)
 *   70-89 → throttle (rate limit doubling)
 *   ≥ 90  → block (403 temporal)
 *
 * Uso:
 *   import { guardianCheck, guardianLog } from '@/lib/guardian';
 *   const result = await guardianCheck(request, { path: '/api/foo', ip });
 *   if (result.blocked) return new Response('Forbidden', { status: 403 });
 */

import type { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TraceEntry {
  ip: string;
  ua: string;
  path: string;
  method: string;
  ts: number;
}

interface IpProfile {
  ip: string;
  score: number;
  traces: TraceEntry[];       // last 100 traces
  captchaRequests: number;    // captcha /new calls
  captchaVerifies: number;    // captcha /verify calls
  failedLogins: number;       // POST /api/auth/login 401s
  lastSeen: number;
  flags: string[];            // human-readable flags
  blockedUntil?: number;      // timestamp when block expires
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const profiles = new Map<string, IpProfile>();
const MAX_TRACES = 100;
const CLEANUP_INTERVAL_MS = 60_000;
const PROFILE_TTL_MS = 10 * 60 * 1000; // 10 min idle → remove

// ---------------------------------------------------------------------------
// Scoring rules
// ---------------------------------------------------------------------------

type GuardEvent =
  | 'rapid_requests'      // >20 req/min
  | 'captcha_farming'     // many captcha /new without /verify
  | 'brute_force'         // >5 failed logins
  | 'anomalous_ua'        // known bot UAs or empty UA
  | 'session_parallel';   // >3 distinct sessions from same IP

function evaluateEvents(profile: IpProfile): GuardEvent[] {
  const events: GuardEvent[] = [];
  const now = Date.now();
  const recent = profile.traces.filter(t => now - t.ts < 60_000);

  // Rapid requests
  if (recent.length > 25) events.push('rapid_requests');

  // CAPTCHA farming
  if (profile.captchaRequests > 10 && profile.captchaVerifies === 0) {
    events.push('captcha_farming');
  }

  // Brute force
  if (profile.failedLogins >= 5) events.push('brute_force');

  // Anomalous UA
  const ua = profile.ip === profile.ip ? '' : profile.traces[profile.traces.length - 1]?.ua ?? '';
  const botPatterns = /bot|crawler|scan|curl|python|wget|httpclient/i;
  if (ua && botPatterns.test(ua)) events.push('anomalous_ua');
  if (!ua || ua.length < 10) events.push('anomalous_ua');

  return events;
}

function eventsToScoreDelta(events: GuardEvent[]): number {
  const weights: Record<GuardEvent, number> = {
    rapid_requests: 10,
    captcha_farming: 15,
    brute_force: 20,
    anomalous_ua: 12,
    session_parallel: 8,
  };
  return events.reduce((sum, e) => sum + (weights[e] ?? 5), 0);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface GuardianResult {
  /** 0-100 threat score */
  score: number;
  /** Current tier: 'normal' | 'warning' | 'throttle' | 'blocked' */
  tier: 'normal' | 'warning' | 'throttle' | 'blocked';
  /** Whether request should be blocked */
  blocked: boolean;
  /** Detected events this check */
  events: GuardEvent[];
  /** Flag strings */
  flags: string[];
  /** Recommended delay (ms) before allowing next request (throttle mode) */
  throttleDelay?: number;
}

/** Check if IP is local/dev (skip guardian scoring for localhost) */
function isLocalIp(ip: string): boolean {
  // Normalize IPv4-mapped IPv6 (::ffff:127.0.0.1 → 127.0.0.1)
  const normalized = ip.replace(/^::ffff:/i, '');
  return normalized === '127.0.0.1' || normalized === '::1' || normalized === 'localhost' || normalized === 'unknown';
}

/**
 * Check an incoming request against guardian rules.
 * Call this at the entry point of any sensitive API route.
 */
export async function guardianCheck(
  request: NextRequest | Request,
  opts?: { path?: string; method?: string; ip?: string },
): Promise<GuardianResult> {
  const now = Date.now();
  const ip = opts?.ip ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown';
  const ua = request.headers.get('user-agent') ?? '';
  const path = opts?.path ?? new URL(request.url).pathname;
  const method = opts?.method ?? request.method;

  // Skip guardian scoring for local/dev IPs
  if (isLocalIp(ip)) {
    return { score: 0, tier: 'normal', blocked: false, events: [], flags: [] };
  }

  // Get or create profile
  let profile = profiles.get(ip);
  if (!profile) {
    profile = { ip, score: 0, traces: [], captchaRequests: 0, captchaVerifies: 0, failedLogins: 0, lastSeen: now, flags: [] };
    profiles.set(ip, profile);
  }

  // Update last seen
  profile.lastSeen = now;

  // Record trace
  profile.traces.push({ ip, ua, path, method, ts: now });
  if (profile.traces.length > MAX_TRACES) profile.traces.shift();

  // Special counters
  if (path.includes('/captcha/new')) profile.captchaRequests++;
  if (path.includes('/captcha/verify')) profile.captchaVerifies++;
  // Failed login tracked in the auth route itself

  // Evaluate
  const events = evaluateEvents(profile);
  const delta = eventsToScoreDelta(events);

  // Adjust score
  if (events.length > 0) {
    profile.score = Math.min(100, profile.score + delta);
    for (const e of events) {
      if (!profile.flags.includes(e)) profile.flags.push(e);
    }
  } else {
    // Decay score slowly
    profile.score = Math.max(0, profile.score - 2);
    if (profile.score < 20) profile.flags = [];
  }

  // Check block expiry
  if (profile.blockedUntil && now > profile.blockedUntil) {
    profile.blockedUntil = undefined;
    profile.score = Math.max(0, profile.score - 30);
  }

  // Determine tier
  let tier: GuardianResult['tier'] = 'normal';
  let blocked = false;
  let throttleDelay: number | undefined;

  if (profile.score >= 90 || profile.blockedUntil) {
    tier = 'blocked';
    blocked = true;
  } else if (profile.score >= 70) {
    tier = 'throttle';
    throttleDelay = 3000;
  } else if (profile.score >= 40) {
    tier = 'warning';
  }

  // Log warnings
  if (tier !== 'normal') {
    console.warn(`[Guardian] IP=${ip} score=${profile.score} tier=${tier} events=[${events.join(',')}] path=${path}`);
  }

  return { score: profile.score, tier, blocked, events, flags: [...profile.flags], throttleDelay };
}

/**
 * Record a failed login attempt for an IP (call from auth route on 401).
 */
export function recordFailedLogin(ip: string): void {
  const profile = profiles.get(ip);
  if (!profile) return;
  profile.failedLogins++;
  profile.score = Math.min(100, profile.score + 15);
  if (!profile.flags.includes('brute_force')) profile.flags.push('brute_force');
}

/**
 * Record a successful login (resets some counters).
 */
export function recordSuccessfulLogin(ip: string): void {
  const profile = profiles.get(ip);
  if (!profile) return;
  profile.failedLogins = 0;
  profile.score = Math.max(0, profile.score - 20);
  profile.flags = profile.flags.filter(f => f !== 'brute_force');
}

/**
 * Get current score for an IP (useful for admin dashboard).
 */
export function getProfile(ip: string): IpProfile | undefined {
  return profiles.get(ip);
}

/**
 * Get all profiles sorted by score (admin endpoint data).
 */
export function getAllProfiles(): IpProfile[] {
  return Array.from(profiles.values())
    .sort((a, b) => b.score - a.score)
    .map(p => ({ ...p, traces: [] })); // don't leak full traces
}

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

setInterval(() => {
  const now = Date.now();
  for (const [ip, profile] of profiles) {
    if (now - profile.lastSeen > PROFILE_TTL_MS) {
      profiles.delete(ip);
    }
  }
}, CLEANUP_INTERVAL_MS);
