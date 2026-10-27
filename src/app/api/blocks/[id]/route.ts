import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { z } from 'zod';
import { checkOrigin } from '@/lib/origin-check';

const updateBlockSchema = z.object({
  type: z.string().min(1).max(100).optional(),
  title: z.string().max(200).nullable().optional(),
  content: z.string().nullable().optional(),
  order: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
});

// PUT /api/blocks/[id] - Update block (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!checkOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
    }

    await requireAdmin();
    const { id } = await params;

    const existing = await db.block.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Bloque no encontrado' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = updateBlockSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' },
        { status: 400 }
      );
    }

    const block = await db.block.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, data: block });
  } catch (error) {
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}

// DELETE /api/blocks/[id] - Delete block (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!checkOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
    }

    await requireAdmin();
    const { id } = await params;

    const existing = await db.block.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Bloque no encontrado' },
        { status: 404 }
      );
    }

    const block = await db.block.delete({ where: { id } });

    return NextResponse.json({ success: true, data: block });
  } catch (error) {
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}
