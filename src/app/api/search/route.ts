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

    if (!rawQuery.trim()) {
      return NextResponse.json({ success: true, data: [] });
    }

    const normalizedQuery = rawQuery
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!normalizedQuery) {
      return NextResponse.json({ success: true, data: [] });
    }

    const conditions: Prisma.Sql[] = [
      Prisma.sql`visible = true`,
      Prisma.sql`(LOWER(REGEXP_REPLACE(name, '[[:punct:]]', '', 'g')) LIKE ${`%${normalizedQuery}%`} OR LOWER(REGEXP_REPLACE(nire, '[[:punct:]]', '', 'g')) LIKE ${`%${normalizedQuery}%`})`,
    ];
    if (province) conditions.push(Prisma.sql`province = ${province}`);
    if (type) conditions.push(Prisma.sql`type = ${type}`);
    if (status) conditions.push(Prisma.sql`status = ${status}`);

    const results = await db.$queryRaw<{
      id: string; name: string; nire: string; type: string;
      province: string; status: string; visible: boolean;
    }>(Prisma.sql`
      SELECT id, name, nire, type, province, status, visible
      FROM "SearchableName"
      WHERE ${Prisma.sql`${conditions.join(Prisma.sql` AND `)}`}
      ORDER BY "createdAt" DESC
      LIMIT 50
    `);

    return NextResponse.json({ success: true, data: { results } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error en búsqueda';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
