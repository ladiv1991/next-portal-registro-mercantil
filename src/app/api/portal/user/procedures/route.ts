import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

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