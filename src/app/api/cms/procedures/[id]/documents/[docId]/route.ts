import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { checkOrigin } from '@/lib/origin-check';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; docId: string }> }) {
  try {
    if (!checkOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
    }

    await requireAuth();
    const { id, docId } = await params;

    const doc = await db.procedureDocument.findFirst({
      where: { id: docId, procedureId: id },
    });

    if (!doc) {
      return NextResponse.json({ success: false, error: 'Documento no encontrado' }, { status: 404 });
    }

    await db.procedureDocument.delete({ where: { id: docId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}
