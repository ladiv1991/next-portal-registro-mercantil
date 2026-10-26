import { NextResponse } from 'next/server';
import { forceRebuildIndex, buildKnowledgeIndex } from '@/lib/chat-knowledge';
import { checkOrigin } from '@/lib/origin-check';

export async function POST() {
  forceRebuildIndex();
  await buildKnowledgeIndex();
  return NextResponse.json({ success: true, message: 'Knowledge index rebuilt' });
}
