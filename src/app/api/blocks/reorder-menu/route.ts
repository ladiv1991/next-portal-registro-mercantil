import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { z } from 'zod';
import { checkOrigin } from '@/lib/origin-check';

const reorderMenuSchema = z.object({
  menuIds: z.array(z.string().min(1)).min(1, 'Se requiere al menos un elemento del menú'),
});

// PUT /api/blocks/reorder-menu - Reorder menu items (admin only)
export async function PUT(request: NextRequest) {
  try {
    if (!checkOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
    }

    await requireAdmin();

    const body = await request.json();
    const parsed = reorderMenuSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' },
        { status: 400 }
      );
    }

    const { menuIds } = parsed.data;

    // Update each menu item's order in a transaction
    await db.$transaction(
      menuIds.map((menuId, index) =>
        db.menuItem.update({
          where: { id: menuId },
          data: { order: index },
        })
      )
    );

    // Return updated menu items
    const menus = await db.menuItem.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ success: true, data: menus });
  } catch (error) {
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}
