import type {
  User,
  MenuItem,
  Page,
  Block,
  CMSStats,
  Slider,
  Service,
  NewsArticle,
  Procedure,
  ProcedureDocument,
  Regulation,
  FAQItem,
  VideoTutorial,
  Webinar,
  ContactChannel,
  Statistic,
  SearchableName,
  SitePage,
  BotConfig,
  Guide,
} from './cms-types';

const API_BASE = '';

async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    throw new Error('Respuesta vacía del servidor');
  }
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error('La respuesta del servidor no es JSON válido');
  }
  if (!response.ok) {
    throw new Error(json.error || json.message || 'Error en la solicitud');
  }
  return json.data as T;
}

// ============================================================
// Auth
// ============================================================

export async function login(email: string, password: string): Promise<{ user: User }> {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<{ user: User }>(response);
}

export async function logout(): Promise<void> {
  const response = await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  await handleResponse<void>(response);
}

export async function getMe(): Promise<{ user: User } | null> {
  try {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      credentials: 'include',
    });
    if (!response.ok) return null;
    return handleResponse<{ user: User }>(response);
  } catch {
    return null;
  }
}

// ============================================================
// Generic CMS CRUD helpers
// ============================================================

function cmsUrl(model: string, id?: string) {
  return id ? `${API_BASE}/api/cms/${model}/${id}` : `${API_BASE}/api/cms/${model}`;
}

export async function cmsGetAll<T>(model: string): Promise<T[]> {
  const response = await fetch(cmsUrl(model), { credentials: 'include' });
  return handleResponse<T[]>(response);
}

export async function cmsGetOne<T>(model: string, id: string): Promise<T> {
  const response = await fetch(cmsUrl(model, id), { credentials: 'include' });
  return handleResponse<T>(response);
}

export async function cmsCreate<T>(model: string, data: unknown): Promise<T> {
  const response = await fetch(cmsUrl(model), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleResponse<T>(response);
}

export async function cmsUpdate<T>(model: string, id: string, data: unknown): Promise<T> {
  const response = await fetch(cmsUrl(model, id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleResponse<T>(response);
}

export async function cmsDelete(model: string, id: string): Promise<void> {
  const response = await fetch(cmsUrl(model, id), {
    method: 'DELETE',
    credentials: 'include',
  });
  await handleResponse<void>(response);
}

// ============================================================
// Menus
// ============================================================

export async function getMenus(): Promise<MenuItem[]> {
  const response = await fetch(`${API_BASE}/api/menus`, {
    credentials: 'include',
  });
  return handleResponse<MenuItem[]>(response);
}

export async function createMenu(data: Partial<MenuItem>): Promise<MenuItem> {
  const response = await fetch(`${API_BASE}/api/menus`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleResponse<MenuItem>(response);
}

export async function updateMenu(id: string, data: Partial<MenuItem>): Promise<MenuItem> {
  const response = await fetch(`${API_BASE}/api/menus/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleResponse<MenuItem>(response);
}

export async function deleteMenu(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/menus/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  await handleResponse<void>(response);
}

export async function reorderMenus(menuIds: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/api/menus/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ menuIds }),
  });
  await handleResponse<void>(response);
}

// ============================================================
// Pages
// ============================================================

export async function getPages(includeBlocks?: boolean): Promise<Page[]> {
  const params = includeBlocks ? '?includeBlocks=true' : '';
  const response = await fetch(`${API_BASE}/api/pages${params}`, {
    credentials: 'include',
  });
  return handleResponse<Page[]>(response);
}

export async function getPage(id: string): Promise<Page> {
  const response = await fetch(`${API_BASE}/api/pages/${id}`, {
    credentials: 'include',
  });
  return handleResponse<Page>(response);
}

export async function createPage(data: Partial<Page>): Promise<Page> {
  const response = await fetch(`${API_BASE}/api/pages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleResponse<Page>(response);
}

export async function updatePage(id: string, data: Partial<Page>): Promise<Page> {
  const response = await fetch(`${API_BASE}/api/pages/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleResponse<Page>(response);
}

export async function deletePage(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/pages/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  await handleResponse<void>(response);
}

// ============================================================
// Blocks
// ============================================================

export async function getBlocks(pageId?: string): Promise<Block[]> {
  const params = pageId ? `?pageId=${pageId}` : '';
  const response = await fetch(`${API_BASE}/api/blocks${params}`, {
    credentials: 'include',
  });
  return handleResponse<Block[]>(response);
}

export async function createBlock(data: Partial<Block>): Promise<Block> {
  const response = await fetch(`${API_BASE}/api/blocks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleResponse<Block>(response);
}

export async function updateBlock(id: string, data: Partial<Block>): Promise<Block> {
  const response = await fetch(`${API_BASE}/api/blocks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleResponse<Block>(response);
}

export async function deleteBlock(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/blocks/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  await handleResponse<void>(response);
}

export async function reorderBlocks(pageId: string, blockIds: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/api/blocks/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ pageId, blockIds }),
  });
  await handleResponse<void>(response);
}

// ============================================================
// Sliders
// ============================================================

export const getSliders = () => cmsGetAll<Slider>('sliders');
export const createSlider = (data: Partial<Slider>) => cmsCreate<Slider>('sliders', data);
export const updateSlider = (id: string, data: Partial<Slider>) => cmsUpdate<Slider>('sliders', id, data);
export const deleteSlider = (id: string) => cmsDelete('sliders', id);

// ============================================================
// Services
// ============================================================

export const getServices = () => cmsGetAll<Service>('services');
export const createService = (data: Partial<Service>) => cmsCreate<Service>('services', data);
export const updateService = (id: string, data: Partial<Service>) => cmsUpdate<Service>('services', id, data);
export const deleteService = (id: string) => cmsDelete('services', id);

// ============================================================
// Procedures
// ============================================================

export const getProcedures = () => cmsGetAll<Procedure>('procedures');
export const createProcedure = (data: Partial<Procedure>) => cmsCreate<Procedure>('procedures', data);
export const updateProcedure = (id: string, data: Partial<Procedure>) => cmsUpdate<Procedure>('procedures', id, data);
export const deleteProcedure = (id: string) => cmsDelete('procedures', id);

export async function getProcedureDocuments(procedureId: string): Promise<ProcedureDocument[]> {
  const response = await fetch(`${API_BASE}/api/cms/procedures/${procedureId}/documents`, {
    credentials: 'include',
  });
  return handleResponse<ProcedureDocument[]>(response);
}

export async function uploadProcedureDocument(
  procedureId: string,
  formData: FormData
): Promise<ProcedureDocument> {
  const response = await fetch(`${API_BASE}/api/cms/procedures/${procedureId}/documents`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse<ProcedureDocument>(response);
}

export async function deleteProcedureDocument(
  procedureId: string,
  documentId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/cms/procedures/${procedureId}/documents/${documentId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    }
  );
  await handleResponse<void>(response);
}

// ============================================================
// Regulations
// ============================================================

export const getRegulations = () => cmsGetAll<Regulation>('regulations');
export const createRegulation = (data: Partial<Regulation>) => cmsCreate<Regulation>('regulations', data);
export const updateRegulation = (id: string, data: Partial<Regulation>) => cmsUpdate<Regulation>('regulations', id, data);
export const deleteRegulation = (id: string) => cmsDelete('regulations', id);

// ============================================================
// FAQ
// ============================================================

export const getFAQs = () => cmsGetAll<FAQItem>('faq');
export const createFAQ = (data: Partial<FAQItem>) => cmsCreate<FAQItem>('faq', data);
export const updateFAQ = (id: string, data: Partial<FAQItem>) => cmsUpdate<FAQItem>('faq', id, data);
export const deleteFAQ = (id: string) => cmsDelete('faq', id);

// ============================================================
// News
// ============================================================

export const getNewsArticles = () => cmsGetAll<NewsArticle>('news');
export const createNewsArticle = (data: Partial<NewsArticle>) => cmsCreate<NewsArticle>('news', data);
export const updateNewsArticle = (id: string, data: Partial<NewsArticle>) => cmsUpdate<NewsArticle>('news', id, data);
export const deleteNewsArticle = (id: string) => cmsDelete('news', id);

// ============================================================
// Webinars
// ============================================================

export const getWebinars = () => cmsGetAll<Webinar>('webinars');
export const createWebinar = (data: Partial<Webinar>) => cmsCreate<Webinar>('webinars', data);
export const updateWebinar = (id: string, data: Partial<Webinar>) => cmsUpdate<Webinar>('webinars', id, data);
export const deleteWebinar = (id: string) => cmsDelete('webinars', id);

// ============================================================
// Tutorials
// ============================================================

export const getTutorials = () => cmsGetAll<VideoTutorial>('tutorials');
export const createTutorial = (data: Partial<VideoTutorial>) => cmsCreate<VideoTutorial>('tutorials', data);
export const updateTutorial = (id: string, data: Partial<VideoTutorial>) => cmsUpdate<VideoTutorial>('tutorials', id, data);
export const deleteTutorial = (id: string) => cmsDelete('tutorials', id);

// ============================================================
// Contact Channels
// ============================================================

export const getContactChannels = () => cmsGetAll<ContactChannel>('contacts');
export const createContactChannel = (data: Partial<ContactChannel>) => cmsCreate<ContactChannel>('contacts', data);
export const updateContactChannel = (id: string, data: Partial<ContactChannel>) => cmsUpdate<ContactChannel>('contacts', id, data);
export const deleteContactChannel = (id: string) => cmsDelete('contacts', id);

// ============================================================
// Statistics
// ============================================================

export const getStatistics = () => cmsGetAll<Statistic>('statistics');
export const createStatistic = (data: Partial<Statistic>) => cmsCreate<Statistic>('statistics', data);
export const updateStatistic = (id: string, data: Partial<Statistic>) => cmsUpdate<Statistic>('statistics', id, data);
export const deleteStatistic = (id: string) => cmsDelete('statistics', id);

// ============================================================
// Searchable Names
// ============================================================

export const getSearchableNames = () => cmsGetAll<SearchableName>('search-names');
export const createSearchableName = (data: Partial<SearchableName>) => cmsCreate<SearchableName>('search-names', data);
export const updateSearchableName = (id: string, data: Partial<SearchableName>) => cmsUpdate<SearchableName>('search-names', id, data);
export const deleteSearchableName = (id: string) => cmsDelete('search-names', id);

// ============================================================
// Site Pages
// ============================================================

export const getSitePages = () => cmsGetAll<SitePage>('site-pages');
export const createSitePage = (data: Partial<SitePage>) => cmsCreate<SitePage>('site-pages', data);
export const updateSitePage = (id: string, data: Partial<SitePage>) => cmsUpdate<SitePage>('site-pages', id, data);
export const deleteSitePage = (id: string) => cmsDelete('site-pages', id);

// ============================================================
// Bot Config
// ============================================================

export const getBotConfig = () => cmsGetAll<BotConfig>('bot-config');
export const createBotConfig = (data: Partial<BotConfig>) => cmsCreate<BotConfig>('bot-config', data);
export const updateBotConfig = (id: string, data: Partial<BotConfig>) => cmsUpdate<BotConfig>('bot-config', id, data);
export const deleteBotConfig = (id: string) => cmsDelete('bot-config', id);

// ============================================================
// Guides
// ============================================================

export const getGuides = () => cmsGetAll<Guide>('guides');
export const createGuide = (data: Partial<Guide>) => cmsCreate<Guide>('guides', data);
export const updateGuide = (id: string, data: Partial<Guide>) => cmsUpdate<Guide>('guides', id, data);
export const deleteGuide = (id: string) => cmsDelete('guides', id);

export async function testBotConnection(data: {
  provider: string;
  model: string;
  apiUrl: string;
  apiKey: string;
  systemPrompt: string;
  maxTokens: number;
  temperature: number;
  testMessage: string;
}): Promise<{ reply: string }> {
  const response = await fetch(`${API_BASE}/api/cms/bot-config/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleResponse<{ reply: string }>(response);
}

// ============================================================
// Stats
// ============================================================

export async function getStats(): Promise<CMSStats> {
  const response = await fetch(`${API_BASE}/api/stats`, {
    credentials: 'include',
  });
  return handleResponse<CMSStats>(response);
}

// ============================================================
// ENZONA Configuration
// ============================================================

export interface EnzonaConfig {
  id: string;
  apiUrl: string;
  consumerKey: string;
  consumerSecret: string;
  merchantId: string;
  returnUrl: string;
  cancelUrl: string;
  testMode: boolean;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export async function getEnzonaConfig(): Promise<EnzonaConfig | null> {
  try {
    const response = await fetch(`${API_BASE}/api/cms/enzona-config`, {
      credentials: 'include',
    });
    return await handleResponse<EnzonaConfig>(response);
  } catch {
    return null;
  }
}

export async function createEnzonaConfig(data: Omit<EnzonaConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<EnzonaConfig> {
  const response = await fetch(`${API_BASE}/api/cms/enzona-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleResponse<EnzonaConfig>(response);
}

export async function updateEnzonaConfig(id: string, data: Partial<EnzonaConfig>): Promise<EnzonaConfig> {
  const response = await fetch(`${API_BASE}/api/cms/enzona-config/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleResponse<EnzonaConfig>(response);
}

export async function testEnzonaConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/cms/enzona-config/test`, {
      method: 'POST',
      credentials: 'include',
    });
    return await handleResponse<{ success: boolean; message: string }>(response);
  } catch (error) {
    console.error('[API] Internal error:', error);
    return { success: false, message: 'Error de conexión' };
  }
}
