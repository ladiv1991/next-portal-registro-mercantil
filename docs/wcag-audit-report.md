# WCAG 2.1 AA Accessibility Audit Report
**Portal del Registro Mercantil de Cuba**
**Date:** 2026-11-08
**URL:** http://localhost:3003
**WCAG Level:** 2.1 AA

## Executive Summary

| Sección | Score | Passes | Fails | Status |
|---------|-------|--------|-------|--------|
| Home | 91% | ✅ | 3 | Pass |
| Consultas | 87% | ⚠️ | 5 | Fail |
| Trámites | 90% | ✅ | 4 | Pass |
| Normatividad | 86% | ⚠️ | 5 | Fail |
| Estadísticas | 82% | ❌ | 6 | Fail |
| Asistencia | 88% | ⚠️ | 4 | Fail |
| Acceso | 86% | ⚠️ | 5 | Fail |

**Overall:** 6/7 sections below 90% compliance. Critical issues found: button-name, target-size, label-content-name-mismatch across all sections.

---

## Methodology

1. Browser automation using tools.browser with Playwright-like API
2. Lighthouse accessibility audits on all portal sections
3. Manual verification of semantic HTML, keyboard navigation, form labels, CAPTCHA accessibility
4. Snapshot analysis for landmarks, heading hierarchy, ARIA attributes

---

## Detailed Findings

### Home (91% - PASS)
**Failures:**
1. **button-name** - Critical
   - Selector: `@e50514 [button]`, `@e50515 [button]` (logo buttons without accessible names)
   - Description: Several buttons lack accessible names, screen readers announce them as "button"
   - Remediation: Add `aria-label` attributes to decorative/icon-only buttons

2. **label-content-name-mismatch** - Major
   - Selector: Search buttons, service cards
   - Description: Visible text doesn't match accessible name
   - Remediation: Ensure button text matches accessible name or use aria-labelledby

3. **target-size** - Major
   - Selector: Slide indicators, small icons
   - Description: Touch targets < 44x44px
   - Remediation: Increase minimum size to 44x44px per WCAG 2.5.5

### Consultas (87% - FAIL)
**Failures:**
1. **aria-prohibited-attr** - Critical
   - Element: Tabs component with role="tab"
   - Description: ARIA attributes used in prohibited roles
   - Remediation: Remove prohibited attributes, use proper tab pattern

2. **button-name** - Critical
   - Element: CAPTCHA refresh button, empty buttons
   - Description: Buttons without accessible names
   - Remediation: Add aria-label to CAPTCHA refresh button

3. **heading-order** - Major
   - Issue: H2 → H4 skip detected
   - Remediation: Ensure sequential heading hierarchy

4. **label-content-name-mismatch** - Major
   - Form labels not matching input accessible names
   - Remediation: Align visible labels with aria-labels

5. **target-size** - Major
   - Small CAPTCHA refresh icon, search buttons
   - Remediation: Enlarge touch targets

**CAPTCHA Accessibility:** 
- ✅ SVG CAPTCHA has `aria-label="Imagen CAPTCHA para búsqueda"`
- ✅ Input has `aria-label="Respuesta del CAPTCHA de búsqueda"`
- ✅ Refresh button has `aria-label="Actualizar imagen CAPTCHA"`
- ⚠️ SVG lacks role="img" explicitly

### Trámites (90% - PASS)
**Failures similar to Home with heading-order issues**

**Additional finding:**
- Step indicators use numbered headings (H3) without proper semantic structure
- Remediation: Use `<ol>` with proper list semantics instead of divs

### Normatividad (86% - FAIL)
**Failures:**
- **color-contrast** - Critical
  - Elements: Text on gradient backgrounds, white icons on light backgrounds
  - Ratio: Estimated 3.2:1 (needs 4.5:1)
  - Remediation: Increase contrast or use darker text colors

**Other failures:** button-name, heading-order, label-content-name-mismatch, target-size

### Estadísticas (82% - FAIL - WORST)
**Failures:**
1. **aria-progressbar-name** - Critical
   - Charts use aria-progressbar without name
   - Remediation: Add `aria-label` to chart containers

2. **color-contrast** - Critical
   - Chart labels, table text on light backgrounds
   - Remediation: Use `--rm-text` with sufficient contrast

3. **heading-order** - Major
   - Multiple H2 without H1, skipped levels
   - Remediation: Start with H1 per section

### Asistencia (88% - FAIL)
**Failures:**
- **color-contrast** - Critical (similar to Normatividad)
- button-name, label-content-name-mismatch, target-size

### Acceso (86% - FAIL)
**Failures:**
- **aria-prohibited-attr** - Critical
  - Form elements with conflicting ARIA roles
- **heading-order** - Major
- button-name, label-content-name-mismatch, target-size

**CAPTCHA Accessibility:** ✅
- ✅ SVG has `aria-label="Imagen CAPTCHA para verificación de seguridad"`
- ✅ Input has `aria-label="Respuesta del CAPTCHA"`
- ✅ Refresh button has `aria-label="Actualizar imagen CAPTCHA"`
- ⚠️ Checkbox "Recordar sesión" lacks proper label association

---

## Semantic HTML Compliance

### ✅ Pass
- Skip-to-content link exists: "Ir al contenido principal" href="#main-content"
- Main landmark exists: `<main id="main-content">` line 165
- Navigation landmark exists: `<nav role="navigation" aria-label="Navegación principal">`
- Header/Footer landmarks present
- All sections use proper CSS variables `var(--rm-*)`

### ⚠️ Minor Issues
- Heading hierarchy inconsistent across dynamic sections
- Some buttons missing explicit `type="button"`
- Color contrast on decorative elements

---

## Remediation Priority

### Blocker (Fix Immediately)
1. **button-name** - Affects all sections, prevents screen reader use
2. **aria-prohibited-attr** - Consultas, Acceso sections
3. **aria-progressbar-name** - Estadísticas

### Critical (Next Sprint)
1. **color-contrast** - Normatividad, Estadísticas, Asistencia
2. **heading-order** - 4 sections affected

### Major (Backlog)
1. **target-size** - 7 sections affected
2. **label-content-name-mismatch** - 7 sections affected

---

## Recommendations

1. **Standardize button components**: Ensure all buttons have accessible names via text content or aria-label
2. **Add focus indicators**: Verify keyboard navigation focus rings meet contrast requirements
3. **Fix heading hierarchy**: Create consistent H1-H3 structure per section
4. **CAPTCHA improvements**: Add `role="img"` to SVG CAPTCHA, ensure refresh button has visible text
5. **Touch targets**: Increase minimum size to 44x44px for all interactive elements
6. **Color contrast**: Audit all text against `--rm-text` variables, ensure 4.5:1 minimum
7. **Form labels**: Ensure every input has associated label, add aria-describedby for error messages

---

## Screenshots
Screenshots would be captured here but browser window visibility required for screenshot capture.

## Conclusion
Portal meets WCAG 2.1 AA partially (Home section passes). Requires remediation of button accessibility, color contrast, and heading hierarchy before production deployment for accessibility compliance.
