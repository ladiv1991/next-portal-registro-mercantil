import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { createPortalUserSchema } from '@/lib/cms-schemas';
import bcrypt from 'bcryptjs';
import { checkOrigin } from '@/lib/origin-check';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

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
        orderBy: { createdAt: 'desc' },
      });
    } else {
      users = await db.portalUser.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    }

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener usuarios';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!checkOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
    }

    await requireAuth();

    const body = await request.json();
    const validation = createPortalUserSchema.safeParse(body);
    if (!validation.success) {
      const first = validation.error.errors[0];
      const msg = first?.message ?? 'Datos inválidos';
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    const data = validation.data;

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
    const message = error instanceof Error ? error.message : 'Error al crear usuario';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}