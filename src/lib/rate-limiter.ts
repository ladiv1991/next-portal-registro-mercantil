/**
 * Simple in-memory rate limiter for auth endpoints.
 *
 * ⚠️  In-memory = no compartido entre instancias/serverless.
 *     Para producción con múltiples workers, migrar a Redis o usar
 *     el rate limiter del host (Traefik, Cloudflare, etc).
 *
 * Uso:
 *   import { rateLimit } from '@/lib/rate-limiter';
 *   const ok = await rateLimit(key, { max: 5, windowMs: 60_000 });
 *   if (!ok) return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
 */

interface RateLimitConfig {
  max: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export async function rateLimit(
  key: string,
  config: RateLimitConfig,
): Promise<boolean> {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // First request or window expired — create fresh entry
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return true;
  }

  if (entry.count >= config.max) {
    return false; // Rate limit exceeded
  }

  entry.count += 1;
  return true;
}

/** Clean up stale entries to prevent memory leak */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 60_000);
