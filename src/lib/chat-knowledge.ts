import { db } from '@/lib/db';

// ─── Section mapping for correct navigation links ───
const SECTION_MAP: Record<string, string> = {
  guides: 'asistencia',
  faq: 'asistencia',
  procedures: 'tramites',
  regulations: 'normatividad',
  services: 'home',
  statistics: 'estadisticas',
  news: 'home',
  tutorials: 'asistencia',
  webinars: 'asistencia',
  contacts: 'asistencia',
  searchableNames: 'consultas',
  videoTutorials: 'asistencia',
};

interface KnowledgeEntry {
  id: string;
  type: string;
  title: string;
  content: string;
  section: string;
  keywords: string[];
  metadata?: Record<string, unknown>;
}

// Cache the index in memory (regenerated on demand)
let knowledgeIndex: KnowledgeEntry[] | null = null;
let lastBuildTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function buildKnowledgeIndex(): Promise<KnowledgeEntry[]> {
  const now = Date.now();
  if (knowledgeIndex && now - lastBuildTime < CACHE_TTL) {
    return knowledgeIndex;
  }

  const entries: KnowledgeEntry[] = [];

  // ─── Guides ───
  const guides = await db.guide.findMany({ where: { visible: true } });
  for (const g of guides) {
    const keywords = [
      ...normalizeText(g.title),
      ...normalizeText(g.description),
    ];
    let stepsText = '';
    try {
      const steps = JSON.parse(g.steps || '[]');
      stepsText = steps
        .map((s: { title?: string; description?: string }) => `${s.title || ''} ${s.description || ''}`)
        .join(' ');
      keywords.push(...normalizeText(stepsText));
    } catch { /* empty */ }

    entries.push({
      id: g.id,
      type: 'guide',
      title: g.title,
      content: `${g.title}. ${g.description}. Pasos: ${stepsText}`,
      section: SECTION_MAP.guides,
      keywords,
      metadata: { icon: g.icon, steps: g.steps },
    });
  }

  // ─── FAQs ───
  const faqs = await db.fAQ.findMany({ where: { visible: true } });
  for (const f of faqs) {
    const keywords = [
      ...normalizeText(f.question),
      ...normalizeText(f.answer),
      ...(f.category ? normalizeText(f.category) : []),
    ];
    entries.push({
      id: f.id,
      type: 'faq',
      title: f.question,
      content: `${f.question}: ${f.answer}`,
      section: SECTION_MAP.faq,
      keywords,
      metadata: { category: f.category },
    });
  }

  // ─── Procedures ───
  const procedures = await db.procedure.findMany({ where: { visible: true } });
  for (const p of procedures) {
    const keywords = [
      ...normalizeText(p.title),
      ...normalizeText(p.description),
      ...(p.requirements ? normalizeText(p.requirements) : []),
      ...(p.cost ? normalizeText(p.cost) : []),
      ...(p.time ? normalizeText(p.time) : []),
    ];
    let stepsText = '';
    try {
      const steps = JSON.parse(p.steps || '[]');
      stepsText = steps
        .map((s: { title?: string; description?: string }) => `${s.title || ''} ${s.description || ''}`)
        .join(' ');
      keywords.push(...normalizeText(stepsText));
    } catch { /* empty */ }

    entries.push({
      id: p.id,
      type: 'procedure',
      title: p.title,
      content: `${p.title}. ${p.description}. Tiempo: ${p.time || 'N/A'}. Costo: ${p.cost || 'N/A'}. Requisitos: ${p.requirements || 'N/A'}. Pasos: ${stepsText}`,
      section: SECTION_MAP.procedures,
      keywords,
      metadata: { icon: p.icon, time: p.time, cost: p.cost },
    });
  }

  // ─── Regulations ───
  const regulations = await db.regulation.findMany({ where: { visible: true } });
  for (const r of regulations) {
    const keywords = [
      ...normalizeText(r.title),
      ...normalizeText(r.description),
      ...(r.content ? normalizeText(r.content) : []),
      ...(r.type ? normalizeText(r.type) : []),
      ...(r.category ? normalizeText(r.category) : []),
    ];
    entries.push({
      id: r.id,
      type: 'regulation',
      title: r.title,
      content: `${r.title} (${r.type || ''}). ${r.description}. ${r.content || ''}`,
      section: SECTION_MAP.regulations,
      keywords,
      metadata: { type: r.type, category: r.category, number: r.number },
    });
  }

  // ─── Services ───
  const services = await db.service.findMany({ where: { visible: true } });
  for (const s of services) {
    const keywords = [
      ...normalizeText(s.title),
      ...normalizeText(s.description),
    ];
    entries.push({
      id: s.id,
      type: 'service',
      title: s.title,
      content: `${s.title}: ${s.description}`,
      section: s.sectionId || SECTION_MAP.services,
      keywords,
    });
  }

  // ─── Video Tutorials ───
  const tutorials = await db.videoTutorial.findMany({ where: { visible: true } });
  for (const t of tutorials) {
    const keywords = [
      ...normalizeText(t.title),
      ...normalizeText(t.description || ''),
      ...(t.category ? normalizeText(t.category) : []),
    ];
    entries.push({
      id: t.id,
      type: 'tutorial',
      title: t.title,
      content: `${t.title}. ${t.description || ''}. Duración: ${t.duration || 'N/A'}. Categoría: ${t.category || 'N/A'}`,
      section: SECTION_MAP.tutorials,
      keywords,
      metadata: { duration: t.duration, category: t.category },
    });
  }

  // ─── Webinars ───
  const webinars = await db.webinar.findMany({ where: { visible: true } });
  for (const w of webinars) {
    const keywords = [
      ...normalizeText(w.title),
      ...normalizeText(w.description || ''),
    ];
    entries.push({
      id: w.id,
      type: 'webinar',
      title: w.title,
      content: `${w.title}. ${w.description || ''}. Fecha: ${w.date || 'Por definir'}. ${w.location ? `Lugar: ${w.location}` : ''}`,
      section: SECTION_MAP.webinars,
      keywords,
      metadata: { date: w.date, location: w.location, status: w.status },
    });
  }

  // ─── Contact Channels ───
  const contacts = await db.contactChannel.findMany({ where: { visible: true } });
  for (const c of contacts) {
    const keywords = [
      ...normalizeText(c.label),
      ...normalizeText(c.value),
      ...(c.type ? normalizeText(c.type) : []),
    ];
    entries.push({
      id: c.id,
      type: 'contact',
      title: c.label,
      content: `${c.label}: ${c.value}`,
      section: SECTION_MAP.contacts,
      keywords,
      metadata: { type: c.type, icon: c.icon },
    });
  }

  // ─── General Info (hardcoded but always accurate) ───
  const generalEntries: Omit<KnowledgeEntry, 'keywords'>[] = [
    {
      id: 'general-horarios',
      type: 'general',
      title: 'Horarios de Atención',
      content: 'Horarios: Lunes a Viernes de 8:30 AM a 4:30 PM. Sábados, Domingos y Festivos cerrado. Oficina Central: Calle Obispo No. 154, entre Monserrate y O\'Reilly, La Habana Vieja. Teléfono: (+53) 7 862-3456. Correo: info@registromercantil.cu.',
      section: 'asistencia',
      metadata: {},
    },
    {
      id: 'general-costos',
      type: 'general',
      title: 'Costos de Trámites',
      content: 'Solicitud de Primera Inscripción de un Sujeto: Gratuito. Modificaciones societarias: Gratuito. Depósito de estado de situación: Gratuito. Nota Simple: 50 CUP. Certificación de Vigencia: 150 CUP. Certificación Completa: 250 CUP.',
      section: 'normatividad',
      metadata: {},
    },
    {
      id: 'general-verificar',
      type: 'general',
      title: 'Verificar Certificación',
      content: 'Cada documento emitido por el Registro Mercantil incluye un código CSV de verificación. Para verificar: diríjase a la sección de Consultas e ingrese el código CSV. El sistema confirmará si es válido.',
      section: 'consultas',
      metadata: {},
    },
    {
      id: 'general-normativas',
      type: 'general',
      title: 'Normativas Vigentes',
      content: 'Ley No. 107/2016 — Ley del Registro Mercantil. Decreto Ley No. 354/2019 — Reglamento del Registro. Resolución No. 120/2020 — Normas Procedimentales. Resolución No. 85/2021 — Tarifa de Derechos. Instrucción No. 01/2024 — Constitución Digital.',
      section: 'normatividad',
      metadata: {},
    },
  ];

  for (const entry of generalEntries) {
    entries.push({
      ...entry,
      keywords: normalizeText(entry.content),
    });
  }

  knowledgeIndex = entries;
  lastBuildTime = now;
  return entries;
}

export function forceRebuildIndex() {
  knowledgeIndex = null;
  lastBuildTime = 0;
}

// ─── Search the knowledge index ───
export function searchKnowledge(query: string): KnowledgeEntry[] {
  const terms = normalizeText(query);
  if (!terms.length || !knowledgeIndex) return [];

  // Stop words to ignore in matching
  const stopWords = new Set(['que', 'es', 'un', 'una', 'el', 'la', 'los', 'las', 'de', 'del', 'en', 'con', 'para', 'por', 'como', 'se', 'me', 'mi', 'tu', 'su', 'yo', 'tu', 'si', 'no', 'hay', 'puedo', 'necesito', 'quiero', 'donde', 'cuando', 'cual', 'cuales', 'cuanto', 'cuantos']);
  const queryTerms = terms.filter((t) => !stopWords.has(t));

  // If all terms are stop words, use all terms
  const effectiveTerms = queryTerms.length > 0 ? queryTerms : terms;

  const scored = knowledgeIndex.map((entry) => {
    let score = 0;
    const titleNorm = entry.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const contentLower = entry.content.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // 1. Exact title match (highest priority)
    const fullQueryNorm = effectiveTerms.join(' ');
    if (titleNorm === fullQueryNorm) score += 200;
    else if (titleNorm.includes(fullQueryNorm)) score += 150;

    // 2. Title term coverage — how many query terms appear in title
    let titleTermHits = 0;
    for (const term of effectiveTerms) {
      if (titleNorm.includes(term)) {
        titleTermHits++;
        score += 50; // Strong signal: term in title
      }
    }
    // Bonus: if ALL query terms are in the title
    if (titleTermHits === effectiveTerms.length && effectiveTerms.length > 1) {
      score += 100;
    }

    // 3. Keyword matching (medium priority, deduplicated)
    const keywordSet = new Set(entry.keywords);
    for (const term of effectiveTerms) {
      let keywordHit = false;
      for (const kw of keywordSet) {
        if (kw === term) {
          score += 15;
          keywordHit = true;
          break;
        } else if (kw.includes(term)) {
          score += 8;
          keywordHit = true;
        }
      }
      if (keywordHit) score += 3; // bonus for any keyword match
    }

    // 4. Content matching (low priority)
    for (const term of effectiveTerms) {
      if (contentLower.includes(term)) score += 2;
    }

    // 5. Type priority boost — FAQs and general info should rank higher for questions
    const isQuestion = query.includes('?') || /^(como|que|cuanto|donde|cuando|cual|puedo|necesito|quiero)/i.test(query);
    if (isQuestion && (entry.type === 'faq' || entry.type === 'general')) {
      score += 30;
    }

    // 6. Query-title similarity bonus (shared word overlap)
    const queryWords = new Set(effectiveTerms);
    const titleWords = new Set(titleNorm.split(/\s+/).filter((w) => w.length > 1 && !stopWords.has(w)));
    let overlap = 0;
    for (const w of queryWords) {
      if (titleWords.has(w)) overlap++;
    }
    if (queryWords.size > 0) {
      const ratio = overlap / queryWords.size;
      score += Math.round(ratio * 40);
    }

    // 7. When very few query terms remain (1-2 after stop words),
    //    prefer entries whose full title more closely matches the ORIGINAL query
    if (effectiveTerms.length <= 2) {
      const origLower = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[¿?]/g, '').trim();
      const titleClean = titleNorm.replace(/[¿?]/g, '').trim();

      // Count how many original query words appear in the title
      const origWords = origLower.split(/\s+/).filter((w) => w.length > 1);
      let origOverlap = 0;
      for (const w of origWords) {
        if (titleClean.includes(w)) origOverlap++;
      }
      if (origWords.length > 0) {
        const origRatio = origOverlap / origWords.length;
        // Exponential boost: 100% match gets much more than 75%
        score += Math.round(Math.pow(origRatio, 2) * 200);
      }

      // If the title contains ALL original query words, massive bonus
      const allPresent = origWords.every((w) => titleClean.includes(w));
      if (allPresent && origWords.length >= 3) {
        score += 150;
      }
    }

    return { entry, score };
  });

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ entry }) => entry);
}

// ─── Build a chatbot response from a knowledge entry ───
export function buildKnowledgeResponse(entry: KnowledgeEntry): string {
  const sectionLabels: Record<string, string> = {
    asistencia: 'Asistencia',
    tramites: 'Trámites',
    normatividad: 'Normatividad',
    consultas: 'Consultas',
    home: 'Portada',
    estadisticas: 'Estadísticas',
  };

  const sectionLabel = sectionLabels[entry.section] || 'Asistencia';

  switch (entry.type) {
    case 'faq': {
      return `**${entry.title}**\n\n${entry.content.replace(/^.*?:\s*/, '')}\n\n📖 [Ver más en ${sectionLabel}](#${entry.section})`;
    }

    case 'guide': {
      let stepsText = '';
      try {
        const steps = JSON.parse((entry.metadata?.steps as string) || '[]');
        stepsText = steps
          .map((s: { title: string; description: string }, i: number) => `\n  **Paso ${i + 1}: ${s.title}**\n  ${s.description}`)
          .join('\n');
      } catch { /* empty */ }

      return `## ${entry.title}\n\n${entry.content.split('.')[0] || entry.title}${
        stepsText ? `\n\n**Pasos a seguir:**${stepsText}` : ''
      }\n\n📖 [Ver más en ${sectionLabel}](#${entry.section})\n\n📞 ¿Necesita más ayuda? **(+53) 7 862-3456** (Lun-Vie 8:30-16:30)`;
    }

    case 'procedure': {
      return `## ${entry.title}\n\n${entry.content.split('. Tiempo:')[0] || ''}\n\n⏱️ **Tiempo:** ${(entry.metadata?.time as string) || 'Consultar'}\n💰 **Costo:** ${(entry.metadata?.cost as string) || 'Consultar'}\n\n📖 [Ver más en ${sectionLabel}](#${entry.section})`;
    }

    case 'regulation': {
      return `**${entry.title}**\n\n${entry.content.split('. ').slice(0, 3).join('. ')}.\n\n📖 [Ver todas las normativas en ${sectionLabel}](#${entry.section})`;
    }

    case 'contact': {
      return `📞 **${entry.title}**\n\n${entry.content.split(': ').slice(1).join(': ')}\n\n📝 [Formulario de Mesa de Ayuda](#${entry.section})`;
    }

    case 'tutorial': {
      return `🎥 **${entry.title}**\n\n${entry.content.split('. Duración:')[0] || ''}\n⏱️ **Duración:** ${(entry.metadata?.duration as string) || 'N/A'}\n\n📖 [Ver en ${sectionLabel}](#${entry.section})`;
    }

    case 'webinar': {
      return `🎓 **${entry.title}**\n\n${entry.content.split('. Fecha:')[0] || ''}\n📅 **Fecha:** ${(entry.metadata?.date as string) || 'Por definir'}\n${entry.metadata?.location ? `📍 **Lugar:** ${entry.metadata.location}` : ''}\n\n📖 [Ver en ${sectionLabel}](#${entry.section})`;
    }

    default: {
      return `${entry.content}\n\n📖 [Ver más en ${sectionLabel}](#${entry.section})`;
    }
  }
}

// ─── Text normalization ───
function normalizeText(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 1);
}
