import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

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

    // For now, we'll use a simple password check
    // In production, this should be properly hashed
    const isValidPassword = password === 'temp-password'; // TODO: Implement proper password hashing

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        type: 'portal',
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

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