import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('q') || '';

    if (!rawQuery.trim()) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Normalize query: remove punctuation and convert to lowercase
    const normalizedQuery = rawQuery
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') // Remove common punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    if (!normalizedQuery) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Use raw SQL for case-insensitive search with normalized text
    const searchPattern = `%${normalizedQuery}%`;
    const results = await db.$queryRaw`
      SELECT id, name, nire, type, province, status, visible, "createdAt", "updatedAt"
      FROM "SearchableName"
      WHERE visible = true AND (
        LOWER(REGEXP_REPLACE(name, '[[:punct:]]', '', 'g')) LIKE ${searchPattern} OR
        LOWER(REGEXP_REPLACE(nire, '[[:punct:]]', '', 'g')) LIKE ${searchPattern}
      )
      ORDER BY "createdAt" DESC
      LIMIT 50
    `;

    return NextResponse.json({ success: true, data: { results } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error en búsqueda';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
