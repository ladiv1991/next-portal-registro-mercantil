/**
 * Helper para mostrar contadores de caracteres en campos de texto CMS
 * 
 * @param current - longitud actual del campo
 * @param max - límite máximo de caracteres
 * @returns string para mostrar: "150/200"
 */
export function getCharCount(current: number, max: number): string {
  return `${current}/${max}`;
}

/**
 * Formatea mensaje de toast para acciones CMS
 * 
 * @param model - nombre del modelo en singular (Slider, Noticia, etc.)
 * @param name - nombre del contenido
 * @param action - acción realizada (creado, actualizado, eliminado)
 * @returns mensaje formateado
 */
export function formatCmsToast(model: string, name: string, action: string): string {
  const nameDisplay = name && name.trim() ? `'${name.trim().slice(0, 50)}${name.trim().length > 50 ? '...' : ''}'` : '';
  return `${model} ${nameDisplay} ${action} correctamente`;
}

/**
 * Mapeo de modelos CMS a nombres legibles para toasts
 */
export const CMS_MODEL_NAMES: Record<string, string> = {
  slider: 'Slider',
  sliders: 'Slider',
  service: 'Servicio',
  services: 'Servicio',
  statistic: 'Estadística',
  statistics: 'Estadística',
  newsArticle: 'Noticia',
  news: 'Noticia',
  procedure: 'Trámite',
  procedures: 'Trámite',
  regulation: 'Normativa',
  regulations: 'Normativa',
  fAQ: 'Pregunta',
  faq: 'Pregunta',
  faqs: 'Pregunta',
  videoTutorial: 'Tutorial',
  tutorials: 'Tutorial',
  webinar: 'Webinar',
  webinars: 'Webinar',
  contactChannel: 'Canal',
  contacts: 'Canal',
  'contact-channels': 'Canal',
  searchableName: 'Nombre',
  'search-names': 'Nombre',
  'searchable-names': 'Nombre',
  sitePage: 'Página',
  'site-pages': 'Página',
  guide: 'Guía',
  guides: 'Guía',
  botConfig: 'Configuración',
  'bot-config': 'Configuración',
  userRole: 'Rol',
  'user-roles': 'Rol',
  portalUser: 'Usuario',
  'portal-users': 'Usuario',
};
