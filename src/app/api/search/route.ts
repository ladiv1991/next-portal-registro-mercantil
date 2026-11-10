import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { verifyCaptchaV2 } from '@/lib/captcha-v2';
import { rateLimit } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('q') || '';
    const province = searchParams.get('province');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const captchaId = searchParams.get('captchaId') || '';
    const captchaAnswer = searchParams.get('captchaAnswer') || '';

    // CAPTCHA verification
    if (!verifyCaptchaV2(captchaId, captchaAnswer)) {
      return NextResponse.json(
        { success: false, error: 'Verificación de seguridad requerida' },
        { status: 400 },
      );
    }

    // Rate limiting: max 3 searches per IP per minute
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';
    const allowed = await rateLimit(`search:${ip}`, { max: 3, windowMs: 60_000 });
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Demasiadas búsquedas. Intente nuevamente en 1 minuto.' },
        { status: 429 },
      );
    }

    const normalizedQuery = rawQuery
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!normalizedQuery && !province && !type && !status) {
      return NextResponse.json({ success: true, data: { results: [] } });
    }

    // Build base conditions for all three queries
    const baseConditions: Prisma.Sql[] = [Prisma.sql`visible = true`];
    const likePattern = normalizedQuery ? `%${normalizedQuery}%` : null;

    if (likePattern) {
      baseConditions.push(
        Prisma.sql`(LOWER(REGEXP_REPLACE(name, '[[:punct:]]', '', 'g')) LIKE ${likePattern} OR LOWER(REGEXP_REPLACE(nire, '[[:punct:]]', '', 'g')) LIKE ${likePattern})`
      );
    }
    if (province) baseConditions.push(Prisma.sql`province = ${province}`);
    if (type) baseConditions.push(Prisma.sql`type = ${type}`);
    if (status) baseConditions.push(Prisma.sql`status = ${status}`);

    const whereClause = Prisma.join(baseConditions, ' AND ');

    // Three parallel queries — exactly 3 DB round-trips
    const [societies, procedures, regulations] = await Promise.all([
      // 1. Subjects / Sociedades (SearchableName)
      db.$queryRaw<{
        id: string; name: string; nire: string; type: string;
        province: string; status: string; visible: boolean;
        resultType: string;
      }>(Prisma.sql`
        SELECT id, name, nire, type, province, status, visible, 'sociedad' as "resultType"
        FROM "SearchableName"
        WHERE ${whereClause}
        ORDER BY "createdAt" DESC
        LIMIT 20
      `),

      // 2. Procedures / Trámites
      db.$queryRaw<{
        id: string; name: string; nire: string; type: string;
        province: string; status: string; visible: boolean;
        resultType: string;
      }>(Prisma.sql`
        SELECT id, title as name, '' as nire, 'Trámite' as type, '' as province, status, visible, 'procedimiento' as "resultType"
        FROM "Procedure"
        WHERE visible = true
          ${likePattern ? Prisma.sql`AND LOWER(REGEXP_REPLACE(title, '[[:punct:]]', '', 'g')) LIKE ${likePattern}` : Prisma.empty}
          ${province ? Prisma.sql`AND '' = ${province}` : Prisma.empty} -- no province filter for procedures
          ${type ? Prisma.sql`AND 'Trámite' = ${type}` : Prisma.empty}
          ${status ? Prisma.sql`AND status = ${status}` : Prisma.empty}
        ORDER BY "createdAt" DESC
        LIMIT 15
      `),

      // 3. Regulations / Normativas
      db.$queryRaw<{
        id: string; name: string; nire: string; type: string;
        province: string; status: string; visible: boolean;
        resultType: string;
      }>(Prisma.sql`
        SELECT id, title as name, '' as nire, 'Normativa' as type, '' as province, '' as status, visible, 'normativa' as "resultType"
        FROM "Regulation"
        WHERE visible = true
          ${likePattern ? Prisma.sql`AND LOWER(REGEXP_REPLACE(title, '[[:punct:]]', '', 'g')) LIKE ${likePattern}` : Prisma.empty}
          ${province ? Prisma.sql`AND '' = ${province}` : Prisma.empty} -- no province filter for regulations
          ${type ? Prisma.sql`AND 'Normativa' = ${type}` : Prisma.empty}
          ${status ? Prisma.sql`AND '' = ${status}` : Prisma.empty}
        ORDER BY "createdAt" DESC
        LIMIT 15
      `),
    ]);

    // Combine results with type discriminator
    const results = [...societies, ...procedures, ...regulations];

    return NextResponse.json({ success: true, data: { results } });
  } catch (error) {
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}
