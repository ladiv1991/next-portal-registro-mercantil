import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { z } from 'zod';
import { checkOrigin } from '@/lib/origin-check';

const reorderSchema = z.object({
  pageId: z.string().min(1, 'El pageId es requerido'),
  blockIds: z.array(z.string().min(1)).min(1, 'Se requiere al menos un bloque'),
});

// PUT /api/blocks/reorder - Reorder blocks within a page (admin only)
export async function PUT(request: NextRequest) {
  try {
    if (!checkOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
    }

    await requireAdmin();

    const body = await request.json();
    const parsed = reorderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' },
        { status: 400 }
      );
    }

    const { pageId, blockIds } = parsed.data;

    // Verify page exists
    const page = await db.page.findUnique({ where: { id: pageId } });
    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Página no encontrada' },
        { status: 404 }
      );
    }

    // Update each block's order in a transaction
    await db.$transaction(
      blockIds.map((blockId, index) =>
        db.block.update({
          where: { id: blockId },
          data: { order: index },
        })
      )
    );

    // Return updated blocks
    const blocks = await db.block.findMany({
      where: { pageId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ success: true, data: blocks });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : message.includes('not found') ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
