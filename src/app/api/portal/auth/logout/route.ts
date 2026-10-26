import { NextResponse } from 'next/server';
import { checkOrigin } from '@/lib/origin-check';

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Clear the portal token cookie
  response.cookies.set('portal-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
  });

  return response;
}