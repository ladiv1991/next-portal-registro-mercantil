/**
 * Simple same-origin check for cookie-authenticated Route Handlers.
 *
 * Server Actions have built-in CSRF protection (Origin header check).
 * Route Handlers do NOT — this provides defense in depth for endpoints
 * that rely on cookie auth and mutate state.
 *
 * Usage in any POST/PUT/PATCH/DELETE handler:
 *   import { checkOrigin } from '@/lib/origin-check';
 *   if (!checkOrigin(request)) return new Response('Forbidden', { status: 403 });
 */

export function checkOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // Allow requests without Origin (e.g., curl, internal)

  const allowed = new Set<string>([
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || '',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3008',
  ].filter(Boolean));

  return allowed.has(origin);
}
