/**
 * Centralized HTML sanitizer — wraps DOMPurify with a consistent API.
 *
 * ALL dangerouslySetInnerHTML calls MUST go through this helper.
 * Using a single entry point makes it easy to audit and upgrade the
 * sanitizer later (different configuration, stricter mode, etc.).
 */
import DOMPurify from 'isomorphic-dompurify';

// Strip scripts/inline event handlers, allow common markdown-like elements
DOMPurify.addHook('uponSanitizeElement', (node: Element, data) => {
  if (data.tagName === 'script' || data.tagName === 'style') {
    node.remove();
  }
});

/**
 * Sanitize HTML from an LLM/CMS source before rendering with dangerouslySetInnerHTML.
 * Returns a string safe for __html.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b','i','u','em','strong','a','p','br','ul','ol','li','h1','h2','h3','h4','h5','h6','blockquote','code','pre','hr'],
    ALLOWED_ATTR: ['href','title','target','rel'],
    ADD_ATTR: ['target'],
    // No inline JS — no on* attributes
    USE_PROFILES: { html: true, svg: false, mathMl: false },
  });
}

/**
 * Sanitize a single line of text (pre-render split).
 * Prefer raw text + markdown parser over HTML when possible;
 * this is a fallback for legacy line-by-line rendering.
 */
export function sanitizeLine(line: string): string {
  return sanitizeHtml(line);
}