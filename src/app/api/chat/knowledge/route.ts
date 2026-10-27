import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkOrigin } from '@/lib/origin-check';

interface KnowledgeItem {
  section: string;
  sectionLink: string;
  type: string;
  title: string;
  content: string;
  keywords: string[];
}

export async function POST(request: NextRequest) {
  try {
    if (!checkOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
    }

    const body = await request.json();
    const { query } = body as { query: string };

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ success: false, error: 'query es requerido' }, { status: 400 });
    }

    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

    // Query all relevant content from DB in parallel
    const [
      faqs,
      procedures,
      regulations,
      services,
      guides,
      news,
      webinars,
      videoTutorials,
    ] = await Promise.all([
      db.fAQ.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
      db.procedure.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
      db.regulation.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
      db.service.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
      db.guide.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
      db.newsArticle.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
      db.webinar.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
      db.videoTutorial.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
    ]);

    const items: KnowledgeItem[] = [];

    // FAQs
    for (const faq of faqs) {
      items.push({
        section: 'Normatividad',
        sectionLink: '#normatividad',
        type: 'faq',
        title: faq.question,
        content: faq.answer,
        keywords: extractKeywords(`${faq.question} ${faq.answer} ${faq.category}`),
      });
    }

    // Procedures
    for (const proc of procedures) {
      const stepsText = proc.steps || '';
      const reqText = proc.requirements || '';
      items.push({
        section: 'Trámites',
        sectionLink: '#tramites',
        type: 'procedure',
        title: proc.title,
        content: `${proc.description}\n${proc.time ? `Tiempo estimado: ${proc.time}` : ''}${proc.cost ? `\nCosto: ${proc.cost}` : ''}${reqText ? `\nRequisitos: ${reqText}` : ''}${stepsText ? `\nPasos: ${stepsText}` : ''}`,
        keywords: extractKeywords(`${proc.title} ${proc.description} ${reqText} ${proc.time} ${proc.cost} trámite`),
      });
    }

    // Regulations
    for (const reg of regulations) {
      items.push({
        section: 'Normatividad',
        sectionLink: '#normatividad',
        type: 'regulation',
        title: reg.title,
        content: `${reg.type}${reg.number ? ` ${reg.number}` : ''}: ${reg.description}${reg.effectiveDate ? `\nFecha vigencia: ${reg.effectiveDate}` : ''}${reg.content ? `\n${reg.content.substring(0, 500)}` : ''}`,
        keywords: extractKeywords(`${reg.title} ${reg.description} ${reg.type} ${reg.number || ''} ${reg.category}`),
      });
    }

    // Services
    for (const svc of services) {
      items.push({
        section: 'Inicio',
        sectionLink: '#home',
        type: 'service',
        title: svc.title,
        content: svc.description,
        keywords: extractKeywords(`${svc.title} ${svc.description} servicio`),
      });
    }

    // Guides
    for (const guide of guides) {
      let stepsText = '';
      try {
        const steps = JSON.parse(guide.steps || '[]');
        stepsText = steps.map((s: { title: string; description: string }) => `${s.title}: ${s.description}`).join('\n');
      } catch { /* ignore */ }
      items.push({
        section: 'Asistencia',
        sectionLink: '#asistencia',
        type: 'guide',
        title: guide.title,
        content: `${guide.description}\n${stepsText}`,
        keywords: extractKeywords(`${guide.title} ${guide.description} guía paso tutorial`),
      });
    }

    // News
    for (const n of news) {
      items.push({
        section: 'Inicio',
        sectionLink: '#home',
        type: 'news',
        title: n.title,
        content: `${n.summary}\n${n.content ? n.content.substring(0, 300) : ''}`,
        keywords: extractKeywords(`${n.title} ${n.summary} ${n.category} noticia`),
      });
    }

    // Webinars
    for (const wb of webinars) {
      items.push({
        section: 'Asistencia',
        sectionLink: '#asistencia',
        type: 'webinar',
        title: wb.title,
        content: `${wb.description}\nFecha: ${wb.date}${wb.time ? ` Hora: ${wb.time}` : ''}${wb.location ? ` Lugar: ${wb.location}` : ''} Estado: ${wb.status}`,
        keywords: extractKeywords(`${wb.title} ${wb.description} webinar seminario`),
      });
    }

    // Video Tutorials
    for (const vid of videoTutorials) {
      items.push({
        section: 'Asistencia',
        sectionLink: '#asistencia',
        type: 'video',
        title: vid.title,
        content: `${vid.description}\nDuración: ${vid.duration || 'N/A'}`,
        keywords: extractKeywords(`${vid.title} ${vid.description} video tutorial`),
      });
    }

    // Score and rank results by relevance
    const scored = items.map(item => {
      let score = 0;
      const contentLower = item.content.toLowerCase();
      const titleLower = item.title.toLowerCase();
      const kwString = item.keywords.join(' ');
      const queryLower = query.toLowerCase();

      // Exact phrase match (highest score)
      if (contentLower.includes(queryLower) || titleLower.includes(queryLower)) {
        score += 10;
      }

      // Individual term matches
      for (const term of terms) {
        if (titleLower.includes(term)) score += 5;
        if (kwString.includes(term)) score += 3;
        if (contentLower.includes(term)) score += 2;
      }

      // Type boost (FAQs are most relevant for questions)
      if (item.type === 'faq') score += 1;
      if (item.type === 'procedure') score += 1;

      return { ...item, score };
    });

    // Filter relevant results and sort by score
    const results = scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    return NextResponse.json({
      success: true,
      data: {
        results,
        totalItems: items.length,
        matchedItems: results.length,
      },
    });
  } catch (error) {
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}

function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'en',
    'con', 'por', 'para', 'que', 'es', 'son', 'se', 'su', 'al', 'a', 'y', 'o',
    'no', 'si', 'como', 'más', 'pero', 'este', 'esta', 'eso', 'ese', 'ha', 'han',
    'he', 'fue', 'ser', 'tiene', 'puede', 'todo', 'todos', 'otra', 'otro', 'sobre',
    'entre', 'cuando', 'donde', 'qué', 'cual',
  ]);
  return text
    .toLowerCase()
    .replace(/[^a-záéíóúñü0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
}
