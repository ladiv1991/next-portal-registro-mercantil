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
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}