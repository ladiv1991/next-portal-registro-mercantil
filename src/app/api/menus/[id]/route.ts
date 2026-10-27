import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { z } from 'zod';
import { checkOrigin } from '@/lib/origin-check';

const updateMenuSchema = z.object({
  label: z.string().min(1).max(100).optional(),
  icon: z.string().min(1).max(50).optional(),
  sectionId: z.string().nullable().optional(),
  order: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
});

// PUT /api/menus/[id] - Update menu item (admin only)
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

    const existing = await db.menuItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Elemento del menú no encontrado' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = updateMenuSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check sectionId uniqueness if being changed
    if (data.sectionId !== undefined && data.sectionId !== null && data.sectionId !== existing.sectionId) {
      const duplicate = await db.menuItem.findUnique({ where: { sectionId: data.sectionId } });
      if (duplicate) {
        return NextResponse.json(
          { success: false, error: 'El sectionId ya existe' },
          { status: 409 }
        );
      }
    }

    const menu = await db.menuItem.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: menu });
  } catch (error) {
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}

// DELETE /api/menus/[id] - Delete menu item (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!checkOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
    }

    await requireAdmin();
    const { id } = await params;

    const existing = await db.menuItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Elemento del menú no encontrado' },
        { status: 404 }
      );
    }

    const menu = await db.menuItem.delete({ where: { id } });

    return NextResponse.json({ success: true, data: menu });
  } catch (error) {
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}
