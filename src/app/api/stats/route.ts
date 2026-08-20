import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';

// GET /api/stats - Return CMS dashboard stats (admin only)
export async function GET() {
  try {
    await requireAdmin();

    const [users, pages, blocks, menus, recentLogs] = await Promise.all([
      db.user.count(),
      db.page.count(),
      db.block.count(),
      db.menuItem.count(),
      db.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users,
        pages,
        blocks,
        menus,
        recentLogs,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
