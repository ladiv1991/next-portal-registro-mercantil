import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPortalUserId } from '@/lib/portal-auth';

export async function GET(request: NextRequest) {
  try {
    const userId = getPortalUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
    }

    const requests = await db.informationRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener solicitudes';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getPortalUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
    }

    const { subject, message, attachments } = await request.json();

    const newRequest = await db.informationRequest.create({
      data: {
        userId,
        subject,
        message,
        attachments: attachments || [],
        status: 'pending',
      },
    });

    return NextResponse.json({
      success: true,
      data: newRequest,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear solicitud';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}