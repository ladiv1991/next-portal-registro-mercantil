import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    if (!body.status) {
      return NextResponse.json(
        { success: false, error: 'El campo status es requerido' },
        { status: 400 }
      );
    }

    const validStatuses = ['new', 'read', 'replied', 'closed'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: 'Estado inválido' },
        { status: 400 }
      );
    }

    const inquiry = await db.inquiry.update({
      where: { id },
      data: { status: body.status },
    });

    return NextResponse.json({ success: true, data: inquiry });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}