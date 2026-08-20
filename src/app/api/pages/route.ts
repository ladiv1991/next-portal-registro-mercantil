import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { z } from 'zod';

const createPageSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200),
  slug: z.string().min(1, 'El slug es requerido').max(200).regex(/^[a-z0-9-]+$/, 'El slug debe contener solo letras minúsculas, números y guiones'),
  description: z.string().max(1000).optional(),
  visible: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

// GET /api/pages - Return all pages with block count
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeBlocks = searchParams.get('includeBlocks') === 'true';

    const pages = await db.page.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { blocks: true },
        },
        ...(includeBlocks ? {
          blocks: {
            orderBy: { order: 'asc' },
          },
        } : {}),
      },
    });

    return NextResponse.json({ success: true, data: pages });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/pages - Create new page (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const parsed = createPageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' },
        { status: 400 }
      );
    }

    const { title, slug, description, visible, order } = parsed.data;

    // Check slug uniqueness
    const existing = await db.page.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'El slug ya existe' },
        { status: 409 }
      );
    }

    // Default order to max + 1
    let pageOrder = order;
    if (pageOrder === undefined) {
      const maxPage = await db.page.findFirst({
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      pageOrder = (maxPage?.order ?? -1) + 1;
    }

    const page = await db.page.create({
      data: {
        title,
        slug,
        description: description || null,
        visible: visible ?? true,
        order: pageOrder,
      },
    });

    return NextResponse.json({ success: true, data: page }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
