import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
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
    const message = error instanceof Error ? error.message : 'Error';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
