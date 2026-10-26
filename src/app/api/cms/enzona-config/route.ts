import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';

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
    const message = error instanceof Error ? error.message : 'Error al obtener configuración';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const message = error instanceof Error ? error.message : 'Error al guardar configuración';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function PUT(request: NextRequest) {
  return POST(request);
}