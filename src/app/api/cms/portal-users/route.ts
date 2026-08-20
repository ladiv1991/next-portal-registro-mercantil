import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

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
            { identityCard: { contains: search, mode: 'insensitive' } },
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