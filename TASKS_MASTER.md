# Plan Maestro de Tareas - Portal Registro Mercantil

## Estado: EN PROGRESO (Parcialmente completado)

---

### ✅ COMPLETADO

| # | Tarea | Commit |
|---|-------|--------|
| A1 | ObfuscatedContact - Clipboard, tel:, mailto: | `2b1fa95` |
| A2 | Captcha Búsqueda - Layout y UX | `a14d822` |
| A3 | Navegación Persistente (localStorage) | `2fa6a7e` |
| A4 | Calculadora Costos - Estado Inicial + fix 500 | `628a4ef`, `6d2675f` |
| A5 | Footer - QR Code + Share + Contact Links | `2b1fa95`, `d03ae69` |
| B | Seguridad OWASP Top 10 | `51d77f6`, `d03ae69` |
| C1 | CMS Users - Dropdown Roles | `de8728e` |
| C2 | Validación Per-Field Backend+Frontend | `de8728e` |
| F1 | Contenido Legal (5 páginas) | `b676031` |
| G1 | WCAG Audit Results Committed | `53c1aac` |

---

### ⬜ PENDIENTE

#### D1-D3. Accesibilidad Técnica Completa
- **Estado**: Parcial ✅ (contraste base corregido en 950670f)
- **Pendiente**:
  - aria-label en botones solo-icono restantes
  - Progress bars en charts con aria-label
  - Jerarquía headings completa
  - Touch targets ≥44px verificados

#### D4. Web Speech API - Text-to-Speech
- **Requisito**: Botón "Leer página" / locutor navegador
- **Estado**: ⬜ Pendiente

#### D5. Acciones WCAG UI
- **Requisito**: Controles para aumentar fuente, modo alto contraste, daltónicos
- **Estado**: ⬜ Pendiente

#### H1. Referencias Legales → Chatbot
- **Estado**: ⬜ Pendiente
- **Nota**: Ya hay GacetaLink component, necesita integración con chatbot

#### H2. Canales de Contacto - Obfuscation en AsistenciaSection
- **Estado**: ⬜ Verificar si ya está implementado

#### H3. Overlap "Notas Simple" con Calculadora
- **Estado**: ⬜ Verificar fix en 245c153

#### G2. Testing Visual Completo
- **Secciones faltantes**: Sincronización, Errores, Auditoría, Usuarios
- **Estado**: ⬜ Pendiente

---

### 📊 Resumen de Commits Esta Sesión

```
6d2675f fix(tax-calculator): restore fee calculations with empty state guard
53c1aac docs(qa): commit WCAG audit results and visual testing evidence
cd42109 chore: remove temp files
b676031 feat(legal): Aviso Legal, Privacidad, Accesibilidad, Mapa, Sugerencias
de8728e fix(cms-users): roles dropdown + per-field onBlur validation + backend Zod
d03ae69 fix(security): prevent user enumeration in portal login + strip injected messages in chat
51d77f6 fix(security): promote CMS routes from requireAuth to requireAdmin (12 files)
a14d822 fix(captcha-search): vertical layout + disable until complete + case sensitivity + home nav only
2fa6a7e feat(chatbot-scroll): auto-refresh chatbot knowledge + persist section on reload
2b1fa95 fix(contact): fix clipboard, add tel/mailto links, QR code in footer
ed092b2 fix(chatbot): Iniciar Chat button opens chatbot with pointer ready to type
bb9f112 chore(estadisticas): remove Portal de Datos Abiertos section
```

**Total commits esta sesión**: 11

---

### Not Risk

- Container healthy at localhost:3003
- Build passes cleanly
- WCAG audit shows 6/7 sections need contrast improvements (mainly chart labels)
- Remaining tasks are incremental improvements vs critical fixes