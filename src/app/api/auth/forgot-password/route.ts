import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { guardianCheck } from '@/lib/guardian';
import { checkOrigin } from '@/lib/origin-check';
import { rateLimit } from '@/lib/rate-limiter';
import { verifyCaptchaV2 } from '@/lib/captcha-v2';
import { createPasswordResetToken } from '@/lib/reset-token';
import { sendEmail } from '@/lib/email';

const schema = z.object({
  email: z.string().email(),
  captchaId: z.string().min(1),
  captchaAnswer: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const g = await guardianCheck(request, { path: '/api/auth/forgot-password', ip });
  if (g.blocked) return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 });

  if (!checkOrigin(request)) return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });

  const allowed = await rateLimit(`forgot:${ip}`, { max: 5, windowMs: 60_000 });
  if (!allowed) return NextResponse.json({ success: false, error: 'Demasiados intentos' }, { status: 429 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Datos inválidos' }, { status: 400 });

  const { email, captchaId, captchaAnswer } = parsed.data;

  if (!verifyCaptchaV2(captchaId, captchaAnswer)) {
    return NextResponse.json({ success: false, error: 'CAPTCHA inválido' }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    // don't leak existence
    return NextResponse.json({ success: true, message: 'Si el correo existe, se enviará un enlace de recuperación.' }, { status: 200 });
  }

  const token = await createPasswordResetToken(user.id, email);
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  try {
    await sendEmail({
      to: email,
      subject: 'Recuperación de contraseña - Registro Mercantil',
      html: `<p>Hola ${user.name || ''},</p><p>Haz clic para restablecer tu contraseña:</p><a href="${resetUrl}">Restablecer contraseña</a><p>Este enlace expira en 1 hora.</p>`,
    });
  } catch {
    // swallow email errors to avoid leaking
  }

  return NextResponse.json({ success: true, message: 'Si el correo existe, se enviará un enlace de recuperación.' });
}
