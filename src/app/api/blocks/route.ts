import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { z } from 'zod';

const createBlockSchema = z.object({
  pageId: z.string().min(1, 'El pageId es requerido'),
  type: z.string().min(1, 'El tipo es requerido').max(100),
  title: z.string().max(200).optional(),
  content: z.string().optional(),
  order: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
});

// GET /api/blocks - Return blocks (optionally filtered by pageId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');

    const blocks = await db.block.findMany({
      where: pageId ? { pageId } : undefined,
      orderBy: { order: 'asc' },
      include: {
        page: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: blocks });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/blocks - Create new block (admin only)
export async function POST(request: NextRequest) {
  try {
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
    const message = error instanceof Error ? error.message : 'Error desconocido';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : message.includes('not found') ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
