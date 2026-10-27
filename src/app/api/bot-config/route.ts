import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { checkOrigin } from '@/lib/origin-check';

export async function GET() {
  try {
    await requireAuth();
    let config = await db.botConfig.findUnique({ where: { id: 'default' } });

    // Create default config if it doesn't exist
    if (!config) {
      config = await db.botConfig.create({
        data: {
          id: 'default',
          systemPrompt: 'Eres un asistente virtual del Registro Mercantil de Cuba. Ayuda a los usuarios con información sobre trámites, normativas y servicios del registro.',
          temperature: 0.7,
          maxTokens: 2048,
          enabled: true,
        },
      });
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

    await requireAuth();
    const body = await request.json();

    const config = await db.botConfig.upsert({
      where: { id: 'default' },
      update: body,
      create: { id: 'default', ...body },
    });

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}
