export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  sectionId: string | null;
  order: number;
  visible: boolean;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  visible: boolean;
  order: number;
  blocks?: Block[];
  _count?: { blocks: number };
}

export interface Block {
  id: string;
  pageId: string;
  type: string;
  title: string | null;
  content: string;
  order: number;
  visible: boolean;
  page?: Page;
}

export interface Slider {
  id: string;
  title: string;
  subtitle?: string;
  message: string;
  imageUrl?: string;
  link?: string;
  linkLabel?: string;
  order: number;
  active: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  sectionId?: string;
  order: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  imageUrl?: string;
  source?: string;
  published: boolean;
  publishedAt?: string;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Procedure {
  id: string;
  title: string;
  description: string;
  icon: string;
  time: string;
  cost: string;
  requirements: string;
  steps: string;
  order: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProcedureDocument {
  id: string;
  procedureId: string;
  name: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Regulation {
  id: string;
  title: string;
  type: string;
  number?: string;
  description: string;
  content: string;
  fileUrl?: string;
  effectiveDate?: string;
  category: string;
  order: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: string;
  views: number;
  category: string;
  order: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Webinar {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  status: string;
  maxAttendees?: number;
  order: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactChannel {
  id: string;
  type: string;
  label: string;
  value: string;
  icon: string;
  order: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Statistic {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  icon: string;
  order: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchableName {
  id: string;
  name: string;
  nire?: string;
  type: string;
  province?: string;
  status: string;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SitePage {
  id: string;
  title: string;
  slug: string;
  content: string;
  order: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BotConfig {
  id: string;
  provider: string;
  model: string;
  apiUrl: string;
  apiKey: string;
  systemPrompt: string;
  maxTokens: number;
  temperature: number;
  enabled: boolean;
  updatedAt: string;
}

export interface Guide {
  id: string;
  title: string;
  description: string;
  icon: string;
  steps: string;
  order: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CMSStats {
  users: number;
  pages: number;
  blocks: number;
  menus: number;
}

export type CMSView =
  | 'dashboard'
  | 'menus'
  | 'pages'
  | 'blocks'
  | 'sliders'
  | 'services'
  | 'procedures'
  | 'regulations'
  | 'faq'
  | 'news'
  | 'webinars'
  | 'tutorials'
  | 'contacts'
  | 'statistics'
  | 'search-names'
  | 'site-pages'
  | 'bot-config'
  | 'guides'
  | 'user-roles'
  | 'portal-users'
  | 'inquiries';

export const BLOCK_TYPES = [
  'hero',
  'quick-access',
  'stats',
  'news',
  'benefits',
  'search-bar',
  'procedures',
  'constitution-steps',
  'modification-types',
  'foreign-investment',
  'legal-framework',
  'fee-schedule',
  'forms',
  'gaceta',
  'glossary',
  'faq',
  'chart-pie',
  'chart-bar',
  'chart-horizontal',
  'province-distribution',
  'guides',
  'videos',
  'webinars',
  'contact-form',
  'contact-channels',
  'chatbot-card',
  'login-section',
  'sgr-features',
  'cta-banner',
] as const;
