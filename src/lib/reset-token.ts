import crypto from 'node:crypto';
import { db } from './db';

const TOKEN_TTL_MS = 1000 * 60 * 60; // 1 h

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function createPasswordResetToken(userId: string, email: string) {
  const token = generateResetToken();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
  await db.passwordResetToken.create({
    data: { userId, email, token, expiresAt },
  });
  return token;
}

export async function consumePasswordResetToken(token: string, email: string) {
  const record = await db.passwordResetToken.findFirst({
    where: { token, email, used: false },
  });
  if (!record) return null;
  if (record.expiresAt.getTime() < Date.now()) return null;
  if (record.email !== email) return null;
  await db.passwordResetToken.update({
    where: { id: record.id },
    data: { used: true },
  });
  const user = await db.user.findUnique({ where: { id: record.userId } });
  if (!user) return null;
  if (user.email !== email) return null;
  return user;
}
