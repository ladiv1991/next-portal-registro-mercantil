import { NextResponse } from 'next/server';
import { generateCaptcha } from '@/lib/captcha';

// GET /api/captcha/new — issue a fresh challenge (no auth, no cache)
export async function GET() {
  const { id, svg } = generateCaptcha();
  return NextResponse.json({ success: true, id, svg }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
    },
  });
}