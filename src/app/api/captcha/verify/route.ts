import { NextResponse } from 'next/server';
import { verifyCaptcha } from '@/lib/captcha';
import { checkOrigin } from '@/lib/origin-check';

// POST /api/captcha/verify — single-use challenge verification
export async function POST(request: Request) {
  if (!checkOrigin(request)) {
    return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, answer } = body as { id?: string; answer?: string };

    const ok = verifyCaptcha(id ?? '', answer ?? '');

    return NextResponse.json({ success: true, valid: ok });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error al verificar CAPTCHA' },
      { status: 500 },
    );
  }
}
