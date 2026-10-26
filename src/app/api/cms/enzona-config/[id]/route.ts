import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { checkOrigin } from '@/lib/origin-check';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!checkOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
    }

    await requireAuth();
    const { id } = await params;

    const data = await request.json();

    const config = await db.enzonaConfig.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar configuración';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}