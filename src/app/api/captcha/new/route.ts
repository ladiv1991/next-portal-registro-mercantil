import { NextResponse } from 'next/server';
import { generateCaptcha } from '@/lib/captcha';
import { rateLimit } from '@/lib/rate-limiter';

// GET /api/captcha/new — issue a fresh challenge (no auth, no cache)
export async function GET(request: Request) {
  // Rate limiting: max 20 solicitudes por IP cada 60 segundos
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  const allowed = await rateLimit(`captcha:${ip}`, { max: 20, windowMs: 60_000 });
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: 'Demasiados intentos. Inténtelo más tarde.' },
      { status: 429 },
    );
  }

  const { id, svg } = generateCaptcha();
  return NextResponse.json({ success: true, id, svg }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
    },
  });
}