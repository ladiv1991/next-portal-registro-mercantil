import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { createUserRoleSchema, updateUserRoleSchema } from '@/lib/cms-schemas';
import { checkOrigin } from '@/lib/origin-check';

export async function GET() {
  try {
    await requireAuth();

    const roles = await db.userRole.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, data: roles });
  } catch (error) {
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!checkOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
    }

    await requireAuth();
    const body = await request.json();

    const validation = createUserRoleSchema.safeParse(body);
    if (!validation.success) {
      const first = validation.error.errors[0];
      const msg = first?.message ?? 'Datos inválidos';
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    const role = await db.userRole.create({
      data: validation.data,
    });

    return NextResponse.json({ success: true, data: role });
  } catch (error) {
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}
