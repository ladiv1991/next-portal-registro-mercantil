import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { getAllProfiles, getProfile } from '@/lib/guardian';

// GET /api/admin/guardian — list all IP profiles sorted by score
export async function GET() {
  try {
    await requireAdmin();
    const profiles = getAllProfiles();
    return NextResponse.json({ success: true, data: profiles });
  } catch (error) {
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/admin/guardian — reset score for an IP
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json() as { ip?: string; action?: string };
    if (body.action === 'reset' && body.ip) {
      const profile = getProfile(body.ip);
      if (profile) {
        profile.score = 0;
        profile.flags = [];
        profile.blockedUntil = undefined;
        return NextResponse.json({ success: true, message: `Score reset for ${body.ip}` });
      }
      return NextResponse.json({ success: false, error: 'IP not found' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}