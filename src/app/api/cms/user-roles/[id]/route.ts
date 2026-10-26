import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { updateUserRoleSchema } from '@/lib/cms-schemas';
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

    const validation = updateUserRoleSchema.safeParse(body);
    if (!validation.success) {
      const first = validation.error.errors[0];
      const msg = first?.message ?? 'Datos inválidos';
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    const role = await db.userRole.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json({ success: true, data: role });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar rol';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
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

    // Verificar que no sea un rol por defecto
    const role = await db.userRole.findUnique({
      where: { id },
    });

    if (!role) {
      return NextResponse.json({ success: false, error: 'Rol no encontrado' }, { status: 404 });
    }

    // No permitir eliminar roles del sistema
    if (['user', 'operator', 'admin'].includes(role.name)) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar un rol del sistema' },
        { status: 400 }
      );
    }

    await db.userRole.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar rol';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}