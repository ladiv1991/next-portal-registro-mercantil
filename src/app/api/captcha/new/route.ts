import { NextResponse } from 'next/server';
import { generateCaptchaV2, verifyCaptchaV2 } from '@/lib/captcha-v2';
import { rateLimit } from '@/lib/rate-limiter';
import { guardianCheck } from '@/lib/guardian';

// GET /api/captcha/new — issue a fresh challenge (no auth, no cache)
export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  // Guardian check
  const g = await guardianCheck(request, { path: '/api/captcha/new', ip });
  if (g.blocked) {
    return NextResponse.json(
      { success: false, error: 'Acceso denegado. Contacte al administrador.' },
      { status: 403 },
    );
  }

  // Rate limiting
  const allowed = await rateLimit(`captcha:${ip}`, { max: 20, windowMs: 60_000 });
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: 'Demasiados intentos. Inténtelo más tarde.' },
      { status: 429 },
    );
  }

  const result = generateCaptchaV2();
  return NextResponse.json({
    success: true,
    id: result.id,
    svg: result.svg,
    type: 'alphanum',
    length: result.length,
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
    },
  });
}

// POST /api/captcha/verify — single-use challenge verification
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  const g = await guardianCheck(request, { path: '/api/captcha/verify', ip });
  if (g.blocked) {
    return NextResponse.json(
      { success: false, error: 'Acceso denegado. Contacte al administrador.' },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const { id, answer } = body as { id?: string; answer?: string };
    const ok = verifyCaptchaV2(id ?? '', answer ?? '');
    return NextResponse.json({ success: true, valid: ok });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error al verificar CAPTCHA' },
      { status: 500 },
    );
  }
}