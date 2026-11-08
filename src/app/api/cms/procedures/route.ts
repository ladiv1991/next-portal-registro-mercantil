import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { handleCMSPost } from '@/lib/cms-handler';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const items = await db.procedure.findMany({
      orderBy: { order: 'asc' },
      include: { documents: { orderBy: { order: 'asc' } } },
    });
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return handleCMSPost(request, 'procedures');
}