import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { updatePortalUserSchema } from '@/lib/cms-schemas';
import bcrypt from 'bcryptjs';
import { checkOrigin } from '@/lib/origin-check';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!checkOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
    }

    await requireAuth();
    const { id } = await params;
    const body = await request.json();

    const validation = updatePortalUserSchema.safeParse(body);
    if (!validation.success) {
      const first = validation.error.errors[0];
      const msg = first?.message ?? 'Datos inválidos';
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    const data = { ...validation.data } as Record<string, unknown>;
    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password as string, 10);
      delete data.password;
    }

    const user = await db.portalUser.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!checkOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
    }

    await requireAuth();
    const { id } = await params;

    await db.portalUser.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}