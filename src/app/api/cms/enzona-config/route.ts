import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export async function GET() {
  try {
    await requireAuth();

    const config = await db.enzonaConfig.findUnique({
      where: { id: 'default' },
    });

    if (!config) {
      return NextResponse.json({ success: false, error: 'Configuración no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener configuración';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const data = await request.json();

    const config = await db.enzonaConfig.create({
      data: {
        id: 'default',
        ...data,
      },
    });

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear configuración';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}