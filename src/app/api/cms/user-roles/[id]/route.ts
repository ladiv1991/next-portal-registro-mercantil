import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    const { name, description, permissions } = await request.json();

    const role = await db.userRole.update({
      where: { id: params.id },
      data: {
        name,
        description,
        permissions,
      },
    });

    return NextResponse.json({ success: true, data: role });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar rol';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    // Verificar que no sea un rol por defecto
    const role = await db.userRole.findUnique({
      where: { id: params.id },
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
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar rol';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}