import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function getUserIdFromRequest(request: NextRequest): string | null {
  try {
    const token = request.cookies.get('portal-token')?.value;
    if (!token) return null;

    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const data = JSON.parse(decoded);
    return data.userId;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
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
    const userId = getUserIdFromRequest(request);
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