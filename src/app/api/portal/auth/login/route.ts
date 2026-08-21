import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generatePortalToken, verifyPortalPassword } from '@/lib/portal-auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Find user
    const user = await db.portalUser.findUnique({
      where: { email },
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
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 401 }
      );
    }

    // Compare a per-user bcrypt hash; no shared password or development bypass is accepted.
    const isValidPassword = user.passwordHash
      ? await verifyPortalPassword(password, user.passwordHash)
      : false;

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    // Sign the session only after the password was verified.
    const token = generatePortalToken({ userId: user.id, email: user.email, type: 'portal' });

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptions: user.subscriptions,
      },
    });

    response.cookies.set('portal-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60, // 8 hours
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error en login';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}