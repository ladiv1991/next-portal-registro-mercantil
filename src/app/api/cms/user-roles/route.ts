import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export async function GET() {
  try {
    await requireAuth();

    const roles = await db.userRole.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, data: roles });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener roles';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const { name, description, permissions } = await request.json();

    const role = await db.userRole.create({
      data: {
        name,
        description,
        permissions,
      },
    });

    return NextResponse.json({ success: true, data: role });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear rol';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}