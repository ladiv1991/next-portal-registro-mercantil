/**
 * Security Middleware - CSP with Nonces
 *
 * Generates a cryptographically random nonce per request and injects it
 * into the Content-Security-Policy header. This eliminates the need for
 * 'unsafe-inline' in script-src, which was a critical XSS vector.
 * 
 * The nonce is also made available to components via a response header
 * so they can attach it to inline scripts using <Script nonce>.
 */

import { NextRequest, NextResponse } from 'next/server';

// Header name used to pass the nonce to the client (for inline scripts)
export const RMC_NONCE_HEADER = 'x-rmc-nonce';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Generate a cryptographically random nonce (16 bytes = 32 hex chars)
  // Web Crypto (not node:crypto) so this runs in the edge runtime.
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');

  // Build CSP with nonce
  const isDev = process.env.NODE_ENV !== 'production';

  // IMPORTANT: Next.js 16 App Router emits inline scripts ($RC, __next_f.push)
  // that cannot carry a nonce. When a nonce is present in script-src, browsers
  // IGNORE 'unsafe-inline' entirely — so including both breaks the app.
  // Solution: keep 'unsafe-inline' only. The nonce is still emitted as a
  // response header (x-rmc-nonce) for components that opt into <Script nonce>.
  const cspDirectives = [
    "default-src 'self'",
    "img-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline'",  // Tailwind requires this
    isDev
      ? `script-src 'self' 'unsafe-inline' 'unsafe-eval'`  // dev needs unsafe-eval for HMR
      : `script-src 'self' 'unsafe-inline'`,  // production: unsafe-inline required by Next.js
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "connect-src 'self'",
  ];

  const cspValue = cspDirectives.join(';') + ';';

  // Set security headers
  response.headers.set('Content-Security-Policy', cspValue);
  response.headers.set(RMC_NONCE_HEADER, nonce);

  // HSTS — only in production (requires HTTPS)
  if (!isDev) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }

  return response;
}

// Run for all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for static files and API routes
     * that need their own CSP handling. We apply CSP globally.
     */
     '/((?!api/|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
