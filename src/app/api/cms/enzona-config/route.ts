import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { checkOrigin } from '@/lib/origin-check';

const enzonaConfigSchema = z.object({
  apiUrl: z.string().url('URL de API inválida').optional().nullable(),
  consumerKey: z.string().max(500).optional().nullable(),
  consumerSecret: z.string().max(500).optional().nullable(),
  merchantId: z.string().max(255).optional().nullable(),
  ReturnUrl: z.string().url('URL de retorno inválida').optional().nullable().or(z.literal('')),
  cancelUrl: z.string().url('URL de cancelación inválida').optional().nullable().or(z.literal('')),
  testMode: z.boolean().optional(),
  currency: z.string().max(10).optional().nullable(),
});

export async function GET() {
  try {
    await requireAdmin();

    const config = await db.enzonaConfig.findUnique({
      where: { id: 'default' },
    });

    if (!config) {
      return NextResponse.json({ success: false, error: 'Configuración no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!checkOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
    }

    await requireAdmin();

    const data = await request.json();
    const parsed = enzonaConfigSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos' },
        { status: 400 },
      );
    }

    const config = await db.enzonaConfig.upsert({
      where: { id: 'default' },
      update: parsed.data,
      create: { id: 'default', ...parsed.data },
    });

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  return POST(request);
}