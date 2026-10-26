import { z } from 'zod';

// RFC 5322 simplified — covers all common real-world addresses while
// rejecting obviously malformed input. Full RFC is impractical in Zod.
const EMAIL_REGEX = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const URL_REGEX = /^https?:\/\/.+$/;
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
const SLUG_REGEX = /^[a-z0-9-]+$/;

/** Cuban mobile/landline: optional +53 prefix, then exactly 8 digits. */
const CUBAN_PHONE_REGEX = /^(?:\+53|5)[0-9]{7}$/;

/** OWASP/BIPA password strength: ≥8 chars, at least one uppercase, one digit, one special char. */
const PASSWORD_STRENGTH = z.string().min(8, 'Mínimo 8 caracteres').max(255).refine(
  v => /[A-Z]/.test(v),
  'Debe contener al menos una mayúscula',
).refine(
  v => /[0-9]/.test(v),
  'Debe contener al menos un número',
).refine(
  v => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(v),
  'Debe contener al menos un carácter especial (!@#$%^&*...)',
);

function dateNotInPast(dateStr: string): boolean {
  if (!dateStr) return true;
  return new Date(dateStr) >= new Date(new Date().toDateString());
}

function dateNotAfterToday(dateStr: string): boolean {
  if (!dateStr) return true;
  return new Date(dateStr) <= new Date(new Date().toDateString());
}

// ─── SLIDER ───────────────────────────────────────────────────────────────────

export const createSliderSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(255, 'Máximo 255 caracteres'),
  subtitle: z.string().max(255).optional().nullable(),
  message: z.string().min(1, 'El mensaje es requerido').max(500, 'Máximo 500 caracteres'),
  imageUrl: z.string().url('URL inválida').optional().nullable().or(z.literal('')),
  link: z.string().url('URL inválida').optional().nullable().or(z.literal('')),
  linkLabel: z.string().max(50).optional().nullable(),
  order: z.number().int().nonnegative().default(0),
  active: z.boolean().default(true),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export const updateSliderSchema = createSliderSchema.partial();

// ─── SERVICE ──────────────────────────────────────────────────────────────────

export const createServiceSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(255, 'Máximo 255 caracteres'),
  description: z.string().min(1, 'La descripción es requerida'),
  icon: z.string().min(1).max(50).default('Circle'),
  color: z.string().regex(HEX_COLOR_REGEX, 'Color debe ser formato #RRGGBB').default('#1A1A1A'),
  sectionId: z.string().max(100).optional().nullable(),
  order: z.number().int().nonnegative().default(0),
  visible: z.boolean().default(true),
});

export const updateServiceSchema = createServiceSchema.partial();

// ─── STATISTIC ────────────────────────────────────────────────────────────────

export const createStatisticSchema = z.object({
  label: z.string().min(1, 'La etiqueta es requerida').max(100, 'Máximo 100 caracteres'),
  value: z.number().int().nonnegative(),
  suffix: z.string().max(20).optional().nullable(),
  icon: z.string().min(1).max(50).default('BarChart3'),
  order: z.number().int().nonnegative().default(0),
  visible: z.boolean().default(true),
});

export const updateStatisticSchema = createStatisticSchema.partial();

// ─── NEWS ARTICLE ─────────────────────────────────────────────────────────────

export const createNewsSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(255, 'Máximo 255 caracteres'),
  summary: z.string().min(1, 'El resumen es requerido').max(500, 'Máximo 500 caracteres'),
  content: z.string().min(1, 'El contenido es requerido'),
  category: z.string().max(50).default('General'),
  imageUrl: z.string().url('URL inválida').optional().nullable().or(z.literal('')),
  source: z.string().max(255).optional().nullable(),
  published: z.boolean().default(false),
  publishedAt: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  order: z.number().int().nonnegative().default(0),
});

export const updateNewsSchema = createNewsSchema.partial();

// ─── PROCEDURE ────────────────────────────────────────────────────────────────

export const createProcedureSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(255, 'Máximo 255 caracteres'),
  description: z.string().min(1, 'La descripción es requerida'),
  icon: z.string().min(1).max(50).default('FileText'),
  time: z.string().max(50).optional().nullable().or(z.literal('')),
  cost: z.string().max(50).optional().nullable().or(z.literal('')),
  requirements: z.string().optional().nullable().or(z.literal('')),
  steps: z.string().optional().nullable().or(z.literal('')),
  order: z.number().int().nonnegative().default(0),
  visible: z.boolean().default(true),
});

export const updateProcedureSchema = createProcedureSchema.partial();

// ─── REGULATION ───────────────────────────────────────────────────────────────

const REGULATION_TYPES = ['Ley', 'Decreto', 'Resolución', 'Acuerdo', 'Circular', 'Instrucción', 'Otro'];
const REGULATION_CATEGORIES = ['Constitución', 'Modificación', 'Disolución', 'Inversión Extranjera (VUCE)', 'Registro', 'General'];

export const createRegulationSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(255, 'Máximo 255 caracteres'),
  type: z.enum(REGULATION_TYPES as [string, ...string[]]).default('Ley'),
  number: z.string().max(50).optional().nullable(),
  description: z.string().min(1, 'La descripción es requerida'),
  content: z.string().optional().nullable().or(z.literal('')),
  fileUrl: z.string().url('URL inválida').optional().nullable().or(z.literal('')),
  effectiveDate: z.string().optional().nullable(),
  category: z.enum(REGULATION_CATEGORIES as [string, ...string[]]).default('Registro General'),
  order: z.number().int().nonnegative().default(0),
  visible: z.boolean().default(true),
});

export const updateRegulationSchema = createRegulationSchema.partial();

// ─── FAQ ──────────────────────────────────────────────────────────────────────

export const createFAQSchema = z.object({
  question: z.string().min(1, 'La pregunta es requerida').max(300, 'Máximo 300 caracteres'),
  answer: z.string().min(1, 'La respuesta es requerida'),
  category: z.string().max(50).default('General'),
  order: z.number().int().nonnegative().default(0),
  visible: z.boolean().default(true),
});

export const updateFAQSchema = createFAQSchema.partial();

// ─── VIDEO TUTORIAL ───────────────────────────────────────────────────────────

export const createTutorialSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(255, 'Máximo 255 caracteres'),
  description: z.string().min(1, 'La descripción es requerida'),
  videoUrl: z.string().min(1, 'La URL del video es requerida').max(500, 'Máximo 500 caracteres'),
  thumbnailUrl: z.string().url('URL inválida').optional().nullable().or(z.literal('')),
  duration: z.string().max(20).optional().nullable().or(z.literal('')),
  category: z.string().max(50).default('General'),
  order: z.number().int().nonnegative().default(0),
  visible: z.boolean().default(true),
});

export const updateTutorialSchema = createTutorialSchema.partial();

// ─── WEBINAR ──────────────────────────────────────────────────────────────────

const WEBINAR_STATUSES = ['programado', 'en_curso', 'finalizado', 'cancelado'];

export const createWebinarSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(255, 'Máximo 255 caracteres'),
  description: z.string().min(1, 'La descripción es requerida'),
  date: z.string().min(1, 'La fecha es requerida'),
  time: z.string().min(1, 'La hora es requerida').regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato HH:MM'),
  location: z.string().max(255).optional().nullable().or(z.literal('')),
  status: z.enum(WEBINAR_STATUSES as [string, ...string[]]).default('programado'),
  maxAttendees: z.number().int().positive().optional().nullable(),
  order: z.number().int().nonnegative().default(0),
  visible: z.boolean().default(true),
});

export const updateWebinarSchema = createWebinarSchema.partial();

// ─── CONTACT CHANNEL ──────────────────────────────────────────────────────────

const CONTACT_TYPES = ['teléfono', 'email', 'dirección', 'horario', 'web', 'red_social', 'otro'];

export const createContactSchema = z.object({
  type: z.enum(CONTACT_TYPES as [string, ...string[]]),
  label: z.string().min(1, 'La etiqueta es requerida').max(100, 'Máximo 100 caracteres'),
  value: z.string().min(1, 'El valor es requerido').max(500, 'Máximo 500 caracteres'),
  icon: z.string().min(1).max(50).default('Phone'),
  order: z.number().int().nonnegative().default(0),
  visible: z.boolean().default(true),
});

export const updateContactSchema = createContactSchema.partial();

// ─── SEARCHABLE NAME ──────────────────────────────────────────────────────────

const NAME_TYPES = ['Sociedad', 'Empresa Individual', 'Sucursal', 'Representación', 'Otro'];
const NAME_STATUSES = ['Vigente', 'Disuelta', 'Suspendida', 'En Trámite'];

export const createSearchNameSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255, 'Máximo 255 caracteres'),
  nire: z.string().max(50).optional().nullable(),
  type: z.enum(NAME_TYPES as [string, ...string[]]).default('Sociedad'),
  province: z.string().max(50).optional().nullable(),
  status: z.enum(NAME_STATUSES as [string, ...string[]]).default('Vigente'),
  visible: z.boolean().default(true),
});

export const updateSearchNameSchema = createSearchNameSchema.partial();

// ─── SITE PAGE ────────────────────────────────────────────────────────────────

export const createSitePageSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(255, 'Máximo 255 caracteres'),
  slug: z.string().min(1, 'El slug es requerido').max(255, 'Máximo 255 caracteres').regex(SLUG_REGEX, 'Slug inválido (solo minúsculas, números y guiones)'),
  content: z.string().max(50000).optional().nullable().or(z.literal('')),
  order: z.number().int().nonnegative().default(0),
  visible: z.boolean().default(true),
});

export const updateSitePageSchema = createSitePageSchema.partial();

// ─── GUIDE ────────────────────────────────────────────────────────────────────

export const createGuideSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(255, 'Máximo 255 caracteres'),
  description: z.string().max(1000).optional().nullable().or(z.literal('')),
  icon: z.string().min(1).max(50).default('BookOpen'),
  steps: z.string().min(1, 'Debe haber al menos un paso').default('[]'),
  order: z.number().int().nonnegative().default(0),
  visible: z.boolean().default(true),
});

export const updateGuideSchema = createGuideSchema.partial();

// ─── BOT CONFIG ───────────────────────────────────────────────────────────────

const BOT_PROVIDERS = ['z-ai-web-dev-sdk', 'openai-compatible'];

export const createBotConfigSchema = z.object({
  provider: z.enum(BOT_PROVIDERS as [string, ...string[]]).default('z-ai-web-dev-sdk'),
  model: z.string().max(100).optional().nullable().or(z.literal('')),
  apiUrl: z.string().url('URL inválida').optional().nullable().or(z.literal('')),
  apiKey: z.string().max(500).optional().nullable().or(z.literal('')),
  systemPrompt: z.string().max(5000, 'Máximo 5000 caracteres').default(''),
  maxTokens: z.number().int().min(256).max(8192).default(2048),
  temperature: z.number().min(0).max(2).default(0.7),
  enabled: z.boolean().default(true),
});

export const updateBotConfigSchema = createBotConfigSchema.partial();

// ─── USER ROLE ────────────────────────────────────────────────────────────────

export const createUserRoleSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(50, 'Máximo 50 caracteres'),
  description: z.string().max(255).optional().nullable(),
  permissions: z.array(z.string()).default([]),
});

export const updateUserRoleSchema = createUserRoleSchema.partial();

// ─── PORTAL USER ──────────────────────────────────────────────────────────────
// Role is validated against DB UserRole table at the API route level, not here.

export const createPortalUserSchema = z.object({
  email: z.string().min(1, 'El email es requerido').regex(EMAIL_REGEX, 'Email inválido').max(255),
  password: PASSWORD_STRENGTH,
  name: z.string().max(255).optional().nullable().or(z.literal('')),
  phone: z.string().regex(CUBAN_PHONE_REGEX, 'Teléfono cubano inválido (ej: +53 5XXXXXXX o 5XXXXXXX)').optional().nullable().or(z.literal('')),
  role: z.string().min(1, 'El rol es requerido').default('user'),
  isActive: z.boolean().default(true),
});

export const updatePortalUserSchema = z.object({
  email: z.string().min(1, 'El email es requerido').regex(EMAIL_REGEX, 'Email inválido').max(255).optional(),
  password: PASSWORD_STRENGTH.optional(),
  name: z.string().max(255).optional().nullable().or(z.literal('')),
  phone: z.string().regex(CUBAN_PHONE_REGEX, 'Teléfono cubano inválido').optional().nullable().or(z.literal('')),
  role: z.string().min(1, 'El rol es requerido').optional(),
  isActive: z.boolean().optional(),
});

// ─── Map model path → { create, update } schemas ─────────────────────────────

export const CMS_SCHEMAS: Record<string, { create: z.ZodTypeAny; update: z.ZodTypeAny }> = {
  sliders: { create: createSliderSchema, update: updateSliderSchema },
  services: { create: createServiceSchema, update: updateServiceSchema },
  statistics: { create: createStatisticSchema, update: updateStatisticSchema },
  news: { create: createNewsSchema, update: updateNewsSchema },
  procedures: { create: createProcedureSchema, update: updateProcedureSchema },
  regulations: { create: createRegulationSchema, update: updateRegulationSchema },
  faq: { create: createFAQSchema, update: updateFAQSchema },
  faqs: { create: createFAQSchema, update: updateFAQSchema },
  tutorials: { create: createTutorialSchema, update: updateTutorialSchema },
  webinars: { create: createWebinarSchema, update: updateWebinarSchema },
  contacts: { create: createContactSchema, update: updateContactSchema },
  'contact-channels': { create: createContactSchema, update: updateContactSchema },
  'search-names': { create: createSearchNameSchema, update: updateSearchNameSchema },
  'searchable-names': { create: createSearchNameSchema, update: updateSearchNameSchema },
  'site-pages': { create: createSitePageSchema, update: updateSitePageSchema },
  guides: { create: createGuideSchema, update: updateGuideSchema },
  'bot-config': { create: createBotConfigSchema, update: updateBotConfigSchema },
  'user-roles': { create: createUserRoleSchema, update: updateUserRoleSchema },
};

// Also export individual schemas for frontend use
export const SLIDER_SCHEMA = createSliderSchema;
export const SERVICE_SCHEMA = createServiceSchema;
export const STATISTIC_SCHEMA = createStatisticSchema;
export const NEWS_SCHEMA = createNewsSchema;
export const PROCEDURE_SCHEMA = createProcedureSchema;
export const REGULATION_SCHEMA = createRegulationSchema;
export const FAQ_SCHEMA = createFAQSchema;
export const TUTORIAL_SCHEMA = createTutorialSchema;
export const WEBINAR_SCHEMA = createWebinarSchema;
export const CONTACT_SCHEMA = createContactSchema;
export const SEARCH_NAME_SCHEMA = createSearchNameSchema;
export const SITE_PAGE_SCHEMA = createSitePageSchema;
export const GUIDE_SCHEMA = createGuideSchema;
export const BOT_CONFIG_SCHEMA = createBotConfigSchema;
export const USER_ROLE_SCHEMA = createUserRoleSchema;
export const PORTAL_USER_SCHEMA = updatePortalUserSchema;
