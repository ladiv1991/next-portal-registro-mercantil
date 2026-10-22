import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('q') || '';
    const province = searchParams.get('province');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const normalizedQuery = rawQuery
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const conditions: Prisma.Sql[] = [
      Prisma.sql`visible = true`,
    ];

    if (normalizedQuery) {
      // Build LIKE patterns as Prisma params to avoid nested backtick parsing issues
      const likePattern = `%${normalizedQuery}%`;
      conditions.push(
        Prisma.sql`(LOWER(REGEXP_REPLACE(name, '[[:punct:]]', '', 'g')) LIKE ${likePattern} OR LOWER(REGEXP_REPLACE(nire, '[[:punct:]]', '', 'g')) LIKE ${likePattern})`
      );
    } else if (!province && !type && !status) {
      return NextResponse.json({ success: true, data: { results: [] } });
    }
    if (province) conditions.push(Prisma.sql`province = ${province}`);
    if (type) conditions.push(Prisma.sql`type = ${type}`);
    if (status) conditions.push(Prisma.sql`status = ${status}`);

    const whereClause = Prisma.join(conditions, ' AND ');
    const results = await db.$queryRaw<{
      id: string; name: string; nire: string; type: string;
      province: string; status: string; visible: boolean;
    }>(Prisma.sql`
      SELECT id, name, nire, type, province, status, visible
      FROM "SearchableName"
      WHERE ${whereClause}
      ORDER BY "createdAt" DESC
      LIMIT 50
    `);

    return NextResponse.json({ success: true, data: { results } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error en búsqueda';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
