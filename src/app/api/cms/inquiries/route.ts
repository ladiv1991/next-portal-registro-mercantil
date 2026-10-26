import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
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