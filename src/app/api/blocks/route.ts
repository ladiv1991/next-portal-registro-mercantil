import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, getAuthUser } from '@/lib/api-auth';
import { z } from 'zod';
import { checkOrigin } from '@/lib/origin-check';

const createBlockSchema = z.object({
  pageId: z.string().min(1, 'El pageId es requerido'),
  type: z.string().min(1, 'El tipo es requerido').max(100),
  title: z.string().max(200).optional(),
  content: z.string().optional(),
  order: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
});

// GET /api/blocks - Return blocks (optionally filtered by pageId).
// Unauthenticated callers only see visible blocks; admins see everything.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');

    let user: Awaited<ReturnType<typeof getAuthUser>> = null;
    try {
      user = await getAuthUser();
    } catch {
      user = null;
    }

    const where: Record<string, unknown> = {};
    if (pageId) where.pageId = pageId;
    // Hide invisible blocks from non-admin public consumers.
    if (!user || user.role !== 'admin') {
      where.visible = true;
    }

    const blocks = await db.block.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        page: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: blocks });
  } catch (error) {
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}

// POST /api/blocks - Create new block (admin only)
export async function POST(request: NextRequest) {
  try {
    if (!checkOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
    }

    await requireAdmin();

    const body = await request.json();
    const parsed = createBlockSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' },
        { status: 400 }
      );
    }

    const { pageId, type, title, content, order, visible } = parsed.data;

    // Verify page exists
    const page = await db.page.findUnique({ where: { id: pageId } });
    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Página no encontrada' },
        { status: 404 }
      );
    }

    // Default order to max + 1 for this page
    let blockOrder = order;
    if (blockOrder === undefined) {
      const maxBlock = await db.block.findFirst({
        where: { pageId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      blockOrder = (maxBlock?.order ?? -1) + 1;
    }

    const block = await db.block.create({
      data: {
        pageId,
        type,
        title: title || null,
        content: content || null,
        order: blockOrder,
        visible: visible ?? true,
      },
    });

    return NextResponse.json({ success: true, data: block }, { status: 201 });
  } catch (error) {
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}
