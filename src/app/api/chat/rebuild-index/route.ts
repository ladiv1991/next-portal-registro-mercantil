import { NextResponse } from 'next/server';
import { forceRebuildIndex, buildKnowledgeIndex } from '@/lib/chat-knowledge';

export async function POST() {
  forceRebuildIndex();
  await buildKnowledgeIndex();
  return NextResponse.json({ success: true, message: 'Knowledge index rebuilt' });
}
