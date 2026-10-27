import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';

export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.userId,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}
