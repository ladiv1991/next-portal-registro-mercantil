import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { consumePasswordResetToken } from '@/lib/reset-token';

const schema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Datos inválidos' }, { status: 400 });

  const { token, email, password } = parsed.data;

  const user = await consumePasswordResetToken(token, email);
  if (!user) return NextResponse.json({ success: false, error: 'Token inválido o expirado' }, { status: 400 });

  const hashed = await hashPassword(password);
  await db.user.update({ where: { id: user.id }, data: { password: hashed } });

  return NextResponse.json({ success: true, message: 'Contraseña actualizada' });
}
