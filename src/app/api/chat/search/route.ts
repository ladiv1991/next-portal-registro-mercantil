import { NextRequest, NextResponse } from 'next/server';
import { buildKnowledgeIndex, searchKnowledge, buildKnowledgeResponse } from '@/lib/chat-knowledge';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q');

  if (!q || !q.trim()) {
    return NextResponse.json({ success: false, message: 'Query parameter "q" required' }, { status: 400 });
  }

  // Build/rebuild index if needed
  await buildKnowledgeIndex();

  // Search
  const results = searchKnowledge(q);

  if (results.length === 0) {
    return NextResponse.json({ success: true, data: { results: [], message: 'No se encontraron resultados' } });
  }

  // Build response from top match
  const top = results[0];
  const response = buildKnowledgeResponse(top);

  return NextResponse.json({
    success: true,
    data: {
      response,
      matches: results.map((r) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        section: r.section,
        score: 0, // scoring already applied in searchKnowledge
      })),
    },
  });
}
