import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPortalUserId } from '@/lib/portal-auth';

export async function GET(request: NextRequest) {
  try {
    const userId = getPortalUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
    }

    const procedures = await db.userProcedure.findMany({
      where: { userId },
      orderBy: { requestDate: 'desc' },
    });

    return NextResponse.json({
      success: true,
      procedures,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener trámites';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}