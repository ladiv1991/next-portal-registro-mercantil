import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * OAuth callback de ENZONA
 * ENZONA redirige aquí después de autenticación exitosa
 * Query params: code, state
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.redirect(
        new URL('/auth/login?error=missing_code', request.url)
      );
    }

    // Verificar state para CSRF protection
    const savedState = request.cookies.get('enzona_state')?.value;
    if (state !== savedState) {
      return NextResponse.redirect(
        new URL('/auth/login?error=invalid_state', request.url)
      );
    }

    // Obtener token de ENZONA (aquí iría la llamada real a ENZONA)
    const enzonaConfig = await db.enzonaConfig.findUnique({
      where: { id: 'default' },
    });

    if (!enzonaConfig) {
      return NextResponse.redirect(
        new URL('/auth/login?error=config_missing', request.url)
      );
    }

    // TODO: Implementar intercambio de code por token con ENZONA API
    // const tokenResponse = await fetch(`${enzonaConfig.apiUrl}/oauth/token`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     code,
    //     client_id: enzonaConfig.consumerKey,
    //     client_secret: enzonaConfig.consumerSecret,
    //     grant_type: 'authorization_code',
    //   }),
    // });

    // Para este demo, usamos datos mock
    const mockToken = 'mock_token_' + code;
    const mockUserData = {
      id: 'enzona_' + Math.random().toString(36).substr(2, 9),
      email: `user_${code.substring(0, 8)}@enzona.cu`,
      name: 'Usuario ENZONA',
      phone: '+53712345678',
      identityCard: '12345678901',
    };

    // Crear o actualizar usuario
    const user = await db.portalUser.upsert({
      where: { email: mockUserData.email },
      update: {
        enzonaId: mockUserData.id,
        enzonaToken: mockToken,
        lastLogin: new Date(),
        isVerified: true,
      },
      create: {
        email: mockUserData.email,
        name: mockUserData.name,
        phone: mockUserData.phone,
        identityCard: mockUserData.identityCard,
        enzonaId: mockUserData.id,
        enzonaToken: mockToken,
        role: 'user',
        isVerified: true,
      },
    });

    // Crear sesión JWT
    const token = Buffer.from(
      JSON.stringify({
        userId: user.id,
        email: user.email,
        role: user.role,
        type: 'portal',
      })
    ).toString('base64');

    // Redirigir a dashboard con token
    const response = NextResponse.redirect(
      new URL('/portal/dashboard', request.url)
    );

    response.cookies.set('portal-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60,
    });

    // Limpiar state cookie
    response.cookies.set('enzona_state', '', { maxAge: 0 });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error en autenticación';
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(message)}`, request.url)
    );
  }
}