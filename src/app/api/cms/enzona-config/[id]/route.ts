import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    const data = await request.json();

    const config = await db.enzonaConfig.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar configuración';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}