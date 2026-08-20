import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { z } from 'zod';

const createMenuSchema = z.object({
  label: z.string().min(1, 'La etiqueta es requerida').max(100),
  icon: z.string().min(1, 'El ícono es requerido').max(50),
  sectionId: z.string().optional(),
  order: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
});

// GET /api/menus - Return all visible menu items ordered by order
export async function GET() {
  try {
    const menus = await db.menuItem.findMany({
      where: { visible: true },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ success: true, data: menus });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/menus - Create new menu item (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const parsed = createMenuSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' },
        { status: 400 }
      );
    }

    const { label, icon, sectionId, order, visible } = parsed.data;

    // Check sectionId uniqueness if provided
    if (sectionId) {
      const existing = await db.menuItem.findUnique({ where: { sectionId } });
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'El sectionId ya existe' },
          { status: 409 }
        );
      }
    }

    // Default order to max + 1
    let menuOrder = order;
    if (menuOrder === undefined) {
      const maxMenu = await db.menuItem.findFirst({
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      menuOrder = (maxMenu?.order ?? -1) + 1;
    }

    const menu = await db.menuItem.create({
      data: {
        label,
        icon,
        sectionId: sectionId || null,
        order: menuOrder,
        visible: visible ?? true,
      },
    });

    return NextResponse.json({ success: true, data: menu }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
