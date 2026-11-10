import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { getRateLimitStore } from '@/lib/rate-limiter';

/**
 * GET /api/cms/admin/rate-limits/status
 * Muestra el estado actual de todos los rate limits activos.
 */
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json(
      { success: false, error: 'No autorizado.' },
      { status: 403 },
    );
  }

  const store = getRateLimitStore();
  const now = Date.now();

  const entries = [];
  for (const [key, entry] of store.entries()) {
    entries.push({
      key,
      count: entry.count,
      max: key.startsWith('search:') ? 3 : key.startsWith('inquiries:') ? 10 : null,
      resetAt: entry.resetAt,
      remainingMs: Math.max(0, entry.resetAt - now),
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      total: entries.length,
      active: entries.filter(e => e.remainingMs > 0),
      expired: entries.filter(e => e.remainingMs === 0),
      entries,
    },
  });
}
