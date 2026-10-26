import { NextRequest, NextResponse } from 'next/server';
import { checkOrigin } from '@/lib/origin-check';

export async function POST(request: NextRequest) {
  if (!checkOrigin(request)) {
    return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
  }

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