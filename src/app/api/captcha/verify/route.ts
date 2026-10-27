import { NextResponse } from 'next/server';
import { verifyCaptchaV2 } from '@/lib/captcha-v2';
import { guardianCheck } from '@/lib/guardian';

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