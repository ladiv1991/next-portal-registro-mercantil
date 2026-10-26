/**
 * Same-origin check for cookie-authenticated Route Handlers.
 *
 * Server Actions have built-in CSRF protection (Origin header check).
 * Route Handlers do NOT — this provides defense in depth for endpoints
 * that rely on cookie auth and mutate state.
 *
 * Usage in any POST/PUT/PATCH/DELETE handler:
 *   import { checkOrigin } from '@/lib/origin-check';
 *   if (!checkOrigin(request)) return new Response('Forbidden', { status: 403 });
 *
 * Or use the wrapper for automatic enforcement:
 *   import { withCsrfGuard } from '@/lib/origin-check';
 *   export const POST = withCsrfGuard(async (request) => { ... });
 */

import type { NextRequest } from 'next/server';

function getAllowedOrigins(): Set<string> {
  const origins = new Set<string>();

  // Primary app URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  if (appUrl) origins.add(appUrl);

  // Multi-domain support via PORTAL_DOMAINS
  const portalDomains = process.env.PORTAL_DOMAINS;
  if (portalDomains) {
    for (const domain of portalDomains.split(',').map(d => d.trim()).filter(Boolean)) {
      const scheme = process.env.PORTAL_SCHEME === 'https' ? 'https' : 'http';
      origins.add(`${scheme}://${domain}`);
    }
  }

  // Development origins (only in dev)
  if (process.env.NODE_ENV === 'development') {
    for (const port of ['3000', '3001', '3002', '3003', '3008']) {
      origins.add(`http://localhost:${port}`);
      origins.add(`http://127.0.0.1:${port}`);
    }
  }

  return origins;
}

const ALLOWED_ORIGINS = getAllowedOrigins();

export function checkOrigin(request: Request | NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false; // Reject requests without Origin — browsers always send it; scripts that omit it are external

  return ALLOWED_ORIGINS.has(origin);
}

/**
 * Wrapper that automatically applies CSRF Origin validation to mutating handlers.
 * Usage:
 *   export const POST = withCsrfGuard(async (request) => {
 *     // handler logic
 *   });
 */
export function withCsrfGuard<T extends (request: NextRequest) => Promise<Response>>(
  handler: T
): T {
  return (async (request: NextRequest) => {
    if (!checkOrigin(request)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Origen no permitido' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return handler(request);
  }) as T;
}