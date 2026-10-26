import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { z } from 'zod';
import { checkOrigin } from '@/lib/origin-check';

const updatePageSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug inválido').optional(),
  description: z.string().max(1000).nullable().optional(),
  visible: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

// GET /api/pages/[id] - Return page with all blocks
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const page = await db.page.findUnique({
      where: { id },
      include: {
        blocks: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Página no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: page });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT /api/pages/[id] - Update page (admin only)
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

    const existing = await db.page.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Página no encontrada' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = updatePageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check slug uniqueness if being changed
    if (data.slug && data.slug !== existing.slug) {
      const duplicate = await db.page.findUnique({ where: { slug: data.slug } });
      if (duplicate) {
        return NextResponse.json(
          { success: false, error: 'El slug ya existe' },
          { status: 409 }
        );
      }
    }

    const page = await db.page.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: page });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : message.includes('not found') ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

// DELETE /api/pages/[id] - Delete page with cascade (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!checkOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
    }

    await requireAdmin();
    const { id } = await params;

    const existing = await db.page.findUnique({
      where: { id },
      include: { _count: { select: { blocks: true } } },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Página no encontrada' },
        { status: 404 }
      );
    }

    // Cascade delete handled by Prisma schema
    const page = await db.page.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: {
        ...page,
        deletedBlocksCount: existing._count.blocks,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : message.includes('not found') ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
