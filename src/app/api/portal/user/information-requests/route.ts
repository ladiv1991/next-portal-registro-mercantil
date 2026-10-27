import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPortalUserId } from '@/lib/portal-auth';
import { checkOrigin } from '@/lib/origin-check';

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
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!checkOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
    }

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
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}