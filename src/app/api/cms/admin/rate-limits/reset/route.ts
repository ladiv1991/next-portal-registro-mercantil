import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { getRateLimitStore, clearAllRateLimits } from '@/lib/rate-limiter';

/**
 * POST /api/cms/admin/rate-limits/reset
 *
 * Limpia los contadores de rate limit por IP o todos. Solo accesible con auth de admin.
 * Uso:
 *   curl -X POST http://localhost:3003/api/cms/admin/rate-limits/reset \
 *        -H "Cookie: rmc-token=<admin-jwt>" \
 *        -d '{"ip":"::1"}'           → limpia una IP específica
 *   curl -X POST .../reset -d '{}' → limpia TODOS (modo production)
 */
export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json(
      { success: false, error: 'No autorizado. Se requiere rol de administrador.' },
      { status: 403 },
    );
  }

  let body: { ip?: string } = {};
  try {
    body = await request.json() as { ip?: string };
  } catch {
    // No body — clear all
  }

  const store = getRateLimitStore();
  const now = Date.now();

  if (body.ip) {
    // Clear specific IP search rate limit
    const key = `search:${body.ip}`;
    if (store.has(key)) {
      store.delete(key);
      console.info(`[Admin] Rate limit cleared for IP=${body.ip}`);
      return NextResponse.json({ success: true, message: `Rate limit limpiado para ${body.ip}` });
    }
    return NextResponse.json({ success: true, message: `IP ${body.ip} no tenía rate limit activo` });
  }

  // Clear ALL search rate limits
  let cleared = 0;
  for (const [key] of store.entries()) {
    if (key.startsWith('search:')) {
      store.delete(key);
      cleared++;
    }
  }
  console.info(`[Admin] Rate limits cleared: ${cleared} entries removed`);
  return NextResponse.json({ success: true, message: `${cleared} contador(es) de rate limit eliminado(s)` });
}
