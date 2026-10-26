import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { checkOrigin } from '@/lib/origin-check';

export async function GET(request: NextRequest) {
  try {
    if (!checkOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
    }
    await requireAuth();

    const inquiries = await db.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: inquiries });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}