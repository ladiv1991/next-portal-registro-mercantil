import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { forceRebuildIndex, buildKnowledgeIndex } from '@/lib/chat-knowledge';
import { CMS_SCHEMAS } from '@/lib/cms-schemas';

// Rebuild chatbot knowledge index after content changes
async function rebuildChatIndex() {
  try {
    forceRebuildIndex();
    await buildKnowledgeIndex();
  } catch { /* ignore — chat index rebuild is best-effort */ }
}

type ModelName = 'slider' | 'service' | 'procedure' | 'regulation' | 'fAQ' | 'newsArticle' | 'webinar' | 'videoTutorial' | 'contactChannel' | 'statistic' | 'searchableName' | 'sitePage' | 'botConfig' | 'guide';

const MODEL_MAP: Record<string, ModelName> = {
  sliders: 'slider',
  services: 'service',
  procedures: 'procedure',
  regulations: 'regulation',
  faq: 'fAQ',
  faqs: 'fAQ',
  news: 'newsArticle',
  webinars: 'webinar',
  tutorials: 'videoTutorial',
  contacts: 'contactChannel',
  statistics: 'statistic',
  'search-names': 'searchableName',
  'searchable-names': 'searchableName',
  'site-pages': 'sitePage',
  'bot-config': 'botConfig',
  guides: 'guide',
};

// Models that have an 'order' field for sorting
const MODELS_WITH_ORDER: Set<ModelName> = new Set([
  'slider',
  'service',
  'procedure',
  'regulation',
  'fAQ',
  'newsArticle',
  'webinar',
  'videoTutorial',
  'contactChannel',
  'statistic',
  'sitePage',
  'guide',
]);

function getModel(modelPath: string): ModelName {
  const model = MODEL_MAP[modelPath];
  if (!model) throw new Error('Modelo no encontrado');
  return model;
}

function getModelDb(model: ModelName) {
  const dbAny = db as unknown as Record<string, any>;
  return dbAny[model.charAt(0).toLowerCase() + model.slice(1)] || dbAny[model.toLowerCase()];
}

export function parseModelFromPath(pathname: string): string {
  // /api/cms/{model} -> model
  const match = pathname.match(/\/api\/cms\/([^/]+)/);
  return match ? match[1] : '';
}

/**
 * Validate request body against the model's Zod schema.
 * Returns { success: true, data } or { success: false, error }.
 */
function validateBody(modelPath: string, body: unknown, isUpdate: boolean): { success: true; data: any } | { success: false; error: string } {
  const schemas = CMS_SCHEMAS[modelPath];
  if (!schemas) return { success: true, data: body }; // no schema → passthrough

  const schema = isUpdate ? schemas.update : schemas.create;
  const result = schema.safeParse(body);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Flatten first validation error into a readable message
  const first = result.error.errors[0];
  const field = first?.path?.[0] as string | undefined;
  const msg = first?.message ?? 'Campo inválido';
  return { success: false, error: field ? `${field}: ${msg}` : msg };
}

export async function handleCMSGet(request: NextRequest, modelPath: string) {
  try {
    await requireAdmin();
    const model = getModel(modelPath);
    const modelDb = getModelDb(model);
    const orderBy = MODELS_WITH_ORDER.has(model)
      ? { order: 'asc' as const }
      : { createdAt: 'desc' as const };
    const items = await modelDb.findMany({ orderBy });
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function handleCMSPost(request: NextRequest, modelPath: string) {
  try {
    await requireAdmin();
    const model = getModel(modelPath);
    const modelDb = getModelDb(model);
    let body: any = await request.json();

    // Validate against schema
    const validation = validateBody(modelPath, body, false);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }
    body = validation.data;

    // For bot-config, use upsert with a fixed ID
    if (model === 'botConfig') {
      const existing = await modelDb.findFirst();
      if (existing) {
        const updated = await modelDb.update({ where: { id: existing.id }, data: body });
        return NextResponse.json({ success: true, data: updated });
      }
      const created = await modelDb.create({ data: { id: 'default-bot-config', ...body } });
      return NextResponse.json({ success: true, data: created }, { status: 201 });
    }

    // Set default order (only for models that have 'order' field)
    if (MODELS_WITH_ORDER.has(model) && (body.order === undefined || body.order === null)) {
      try {
        const maxItem = await modelDb.findFirst({ orderBy: { order: 'desc' }, select: { order: true } });
        body.order = (maxItem?.order ?? -1) + 1;
      } catch {
        body.order = 0;
      }
    }

    const item = await modelDb.create({ data: body });
    await rebuildChatIndex();
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function handleCMSGetOne(modelPath: string, id: string) {
  try {
    await requireAdmin();
    const model = getModel(modelPath);
    const modelDb = getModelDb(model);
    const item = await modelDb.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function handleCMSPut(request: NextRequest, modelPath: string, id: string) {
  try {
    await requireAdmin();
    const model = getModel(modelPath);
    const modelDb = getModelDb(model);
    let body: any = await request.json();

    // Validate against schema
    const validation = validateBody(modelPath, body, true);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }
    body = validation.data;

    const existing = await modelDb.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 });
    }

    const item = await modelDb.update({ where: { id }, data: body });
    await rebuildChatIndex();
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function handleCMSDelete(modelPath: string, id: string) {
  try {
    await requireAdmin();
    const model = getModel(modelPath);
    const modelDb = getModelDb(model);

    const existing = await modelDb.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 });
    }

    await modelDb.delete({ where: { id } });
    await rebuildChatIndex();
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
