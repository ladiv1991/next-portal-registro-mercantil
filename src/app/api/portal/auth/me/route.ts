import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('portal-token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.type !== 'portal') {
      return NextResponse.json({ success: false, error: 'Token inválido' }, { status: 401 });
    }

    // Get user with active subscriptions
    const user = await db.portalUser.findUnique({
      where: { id: decoded.userId },
      include: {
        subscriptions: {
          include: {
            plan: true,
          },
          where: {
            isActive: true,
            paymentStatus: 'completed',
            endDate: {
              gt: new Date(),
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptions: user.subscriptions,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Token inválido' }, { status: 401 });
  }
}