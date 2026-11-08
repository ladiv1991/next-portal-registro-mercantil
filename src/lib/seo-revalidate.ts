import { revalidateTag } from 'next/cache';

// ── SEO Revalidation utility ───────────────────────────────────────────────
// Revalidates cached pages and the sitemap when CMS content changes.
// Runs silently (no throw on failure) so content operations are never blocked.
//
// Tag-based approach (preferred):
//   Each route tags its response; here we invalidate by tag → Next.js regenerates on next request.
//
// Path-based fallback:
//   For routes without tags, call revalidatePath() directly.

const TAG_MAP: Record<string, string[]> = {
  // Static portal sections
  slider: ['portal-sliders', 'home'],
  service: ['services'],
  procedure: ['procedures', 'tramites'],
  sitePage: ['site-pages', 'pages'],
  regulation: ['regulations', 'normatividad'],
  faq: ['faqs', 'normatividad'],
  newsArticle: ['news', 'noticias'],
  webinar: ['webinars', 'eventos'],
  videoTutorial: ['tutorials', 'tutoriales'],
  statistic: ['statistics', 'estadisticas'],
  guide: ['guides', 'guias'],
  contactChannel: ['contacts', 'contacto'],
};

/**
 * Revalidate SEO cache after a CMS content change.
 * Called automatically from cms-handler.ts after create/update/delete.
 *
 * @param modelPath The CMS model path (e.g. "news", "site-pages")
 * @param id Optional item ID for more granular invalidation
 */
export function revalidateSEO(modelPath: string, id?: string): void {
  try {
    const tags = TAG_MAP[modelPath] ?? [];

    // Also revalidate the sitemap itself whenever any content changes
    tags.push('sitemap');

    for (const tag of tags) {
      revalidateTag(tag);
    }

    // Always revalidate the main homepage (it aggregates dynamic content)
    if (modelPath !== 'botConfig' && modelPath !== 'enzonaConfig') {
      revalidateTag('home');
      revalidatePath('/', 'layout');
    }

    // If we have an ID, also try path-level revalidation for static-page routes
    if (id && modelPath === 'site-pages') {
      revalidatePath(`/portal/pagina/${id}`, 'page');
    }

  } catch {
    // Non-fatal: revalidation failures should not block CMS operations
  }
}
