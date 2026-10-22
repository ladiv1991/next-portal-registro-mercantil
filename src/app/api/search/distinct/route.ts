import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [provinces, types, statuses] = await Promise.all([
      db.$queryRaw<{ province: string }[]>`
        SELECT DISTINCT province FROM "SearchableName"
        WHERE visible = true AND province IS NOT NULL AND province != ''
        ORDER BY province
      `,
      db.$queryRaw<{ type: string }[]>`
        SELECT DISTINCT type FROM "SearchableName"
        WHERE visible = true ORDER BY type
      `,
      db.$queryRaw<{ status: string }[]>`
        SELECT DISTINCT status FROM "SearchableName"
        WHERE visible = true ORDER BY status
      `,
    ]);

    return NextResponse.json({
      success: true,
      data: {
        provinces: provinces.map(r => r.province),
        types: types.map(r => r.type),
        statuses: statuses.map(r => r.status),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error obteniendo filtros' },
      { status: 500 }
    );
  }
}

