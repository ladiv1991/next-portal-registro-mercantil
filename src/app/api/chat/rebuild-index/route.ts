import { NextRequest, NextResponse } from 'next/server';
import { forceRebuildIndex, buildKnowledgeIndex } from '@/lib/chat-knowledge';
import { checkOrigin } from '@/lib/origin-check';

export async function POST(request: NextRequest) {
  if (!checkOrigin(request)) {
    return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
  }

  forceRebuildIndex();
  await buildKnowledgeIndex();
  return NextResponse.json({ success: true, message: 'Knowledge index rebuilt' });
}
