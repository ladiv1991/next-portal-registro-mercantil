import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { createPortalUserSchema } from '@/lib/cms-schemas';
import bcrypt from 'bcryptjs';
import { checkOrigin } from '@/lib/origin-check';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    console.log('[DEBUG] requireAdmin succeeded');

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let users;
    if (search && search.trim()) {
      users = await db.portalUser.findMany({
        where: {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
          ],
        },
        omit: { passwordHash: true },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      users = await db.portalUser.findMany({
        omit: { passwordHash: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    }

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Permiso denegado' }, { status: 403 });
    }
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!checkOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
    }

    // Solo admin puede crear usuarios del portal (evita escalada de privilegios por editors)
    await requireAdmin();

    const body = await request.json();
    const validation = createPortalUserSchema.safeParse(body);
    if (!validation.success) {
      // Return structured field-level errors so the UI can highlight each invalid field
      const fieldErrors = validation.error.errors.map(e => ({
        field: e.path[0] as string,
        message: e.message,
      }));
      return NextResponse.json(
        { success: false, error: fieldErrors[0]?.message ?? 'Datos inválidos', fields: fieldErrors },
        { status: 400 },
      );
    }

    const data = validation.data;

    const roleExists = await db.userRole.findUnique({ where: { name: data.role } });
    if (!roleExists) {
      return NextResponse.json({ success: false, error: 'Rol no existe' }, { status: 400 });
    }

    const existing = await db.portalUser.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Ya existe un usuario con ese email' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await db.portalUser.create({
      data: {
        email: data.email,
        passwordHash: hashedPassword,
        name: data.name || null,
        phone: data.phone || null,
        role: data.role,
        isActive: data.isActive,
      },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Permiso denegado' }, { status: 403 });
    }
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}