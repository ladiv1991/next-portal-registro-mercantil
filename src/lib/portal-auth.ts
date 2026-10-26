import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { NextRequest } from 'next/server';

export interface PortalTokenPayload {
  userId: string;
  email: string;
  type: 'portal';
}

function getJwtSecret(): string {
  // Fail closed when the deployment does not provide a strong signing secret.
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET debe estar definido y tener al menos 32 caracteres');
  }
  return secret;
}

export function generatePortalToken(payload: PortalTokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '8h' });
}

export function verifyPortalToken(token: string): PortalTokenPayload {
  const payload = jwt.verify(token, getJwtSecret());
  if (typeof payload !== 'object' || payload.type !== 'portal' || typeof payload.userId !== 'string') {
    throw new Error('Token portal inválido');
  }
  return payload as PortalTokenPayload;
}

export function requirePortalAuth(request: NextRequest): PortalTokenPayload {
  const token = request.cookies.get('portal-token')?.value;
  if (!token) throw new Error('No autorizado');
  try {
    return verifyPortalToken(token);
  } catch {
    throw new Error('Sesión portal inválida');
  }
}

export function getPortalUserId(request: NextRequest): string | null {
  const token = request.cookies.get('portal-token')?.value;
  if (!token) return null;
  try {
    return verifyPortalToken(token).userId;
  } catch {
    return null;
  }
}

export function verifyPortalPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}