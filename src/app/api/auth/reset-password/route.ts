import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { consumePasswordResetToken } from '@/lib/reset-token';
import { verifyCaptchaV2 } from '@/lib/captcha-v2';

const schema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  captchaId: z.string().min(1),
  captchaAnswer: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Datos inválidos' }, { status: 400 });

  const { token, email, password, captchaId, captchaAnswer } = parsed.data;

  if (!verifyCaptchaV2(captchaId, captchaAnswer)) {
    return NextResponse.json({ success: false, error: 'CAPTCHA inválido' }, { status: 400 });
  }

  const user = await consumePasswordResetToken(token, email);
  if (!user || user.email !== email) return NextResponse.json({ success: false, error: 'Token inválido o expirado' }, { status: 400 });

  const hashed = await hashPassword(password);
  await db.user.update({ where: { id: user.id }, data: { password: hashed } });

  return NextResponse.json({ success: true, message: 'Contraseña actualizada' });
}
