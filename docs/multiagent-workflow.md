/**
 * Regla de trabajo obligatorio — Multiagentes + iteración hasta pasaje
 *
 * Esta sección define el flujo de trabajo que TODO agente debe seguir.
 * No es opcional. Se aplica a cualquier tarea que implique cambios en el proyecto.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PRINCIPIO BASE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   "Nunca declares terminado hasta que TODA la suite relevante pase en TODAS
 *    las capas, en ITERACIONES sucesivas si es necesario."
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FLUJO DE TRABAJO OBLIGATORIO
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 1. DESCOMPONER EN TAREAS PARALELAS
 *    - Dividir el trabajo por carpetas/áreas independientes del proyecto
 *    - Cada tarea debe tener un responsable claro y resultados medibles
 *    - Usar subagentes con `subagent` para ejecutar en paralelo
 *
 * 2. EJECUTAR PRUEBAS POR CAPAS (en este orden)
 *    │ Capa        │ Qué prueba                          │ Tool                │
 *    ├─────────────┼─────────────────────────────────────┼──────────────────────┤
 *    │ Código       │ Compilación, types, imports         │ tsc / next build     │
 *    │ Seguridad    │ CSRF, auth, origin checks           │ scripts/test-*.js    │
 *    │ Funcional    │ Endpoints críticos, flujos usuario  │ playwright / curl    │
 *    │ Navegador    │ Rendering, interacción, accesibilidad│ browser / screenshot │
 *
 * 3. ITERAR HASTA PASO LIMPIO
 *    - Si ALGUN test falla → corregir → RE-EJECUTAR toda la suite de esa capa
 *    - NO pasar a la siguiente capa hasta que la actual esté 100% verde
 *    - Ejemplo: si un fix funcional rompe seguridad, corregir y repetir ambas
 *
 * 4. REGRESIÓN AUTOMÁTICA
 *    - Después de CUALQUIER corrección, ejecutar de nuevo TODAS las capas
 *      anteriores que ya habían pasado (regresión)
 *    - Esto detecta regressiones introducidas por los fixes
 *
 * 5. REVISIÓN EN CAPAS CONFLICTIVAS
 *    - En módulos de seguridad: un agente revisa, otro verifica de forma
 *      independiente sin confiar en la primera revisión
 *    -Patrón: "Write → Verify → Audit" con agentes distintos
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * MODELO MULTIAGENTE RECOMENDADO
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Patrón A — "Ejecución paralela por áreas":
 *   Agent 1: api/ (rutas, handlers)
 *   Agent 2: components/cms/ (UI CMS)
 *   Agent 3: components/portal/ (UI portal)
 *   Agent 4: lib/ (utilidades, seguridad)
 *   → Todos ejecutan sus tests en paralelo
 *   → Consolidar resultados al final
 *
 * Patrón B — "Write → Verify → Audit" (para seguridad crítica):
 *   Agent 1 (coder): implementa el fix
 *   Agent 2 (tester): ejecuta tests de la capa correspondiente
 *   Agent 3 (reviewer): ejecuta tests DE OTRA capa relacionada para
 *                       detectar regresiones cruzadas
 *
 * Patrón C — "Especialistas por dominio":
 *   Agent seguridad: audit CORS, CSRF, auth, rate-limiting
 *   Agent funcional: prueba flujos de usuario, forms, Naviación
 *   Agent datos:     validación DB, migraciones, seed
 *   Agent UI/UX:     rendering, accesibilidad, diseño
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CRITERIOS DE ÉXITO POR CAPA
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Código:
 *    ✅ 0 errores de TypeScript
 *    ✅ 0 errores de import/lint
 *    ✅ next dev inicia sin errores de compilación
 *
 *  Seguridad:
 *    ✅ N/N handlers mutantes protegidos con checkOrigin
 *    ✅ 0 falsos positivos en tests de seguridad
 *    ✅ Origin-evil rechaza con 403 en TODOS los endpoints mutantes
 *
 *  Funcional:
 *    ✅ Todos los tests automatizados pasan
 *    ✅ Flujos críticos de usuario funcionan (login, búsqueda, envío formulario)
 *    ✅ 0 errores en consola del navegador (devtools)
 *
 *  Navegador:
 *    ✅ Screenshot confirma renderizado correcto
 *    ✅ Interacción humana simulada funciona
 *    ✅ WCAG 2.1 AA: contraste, focus, skip-link
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * REGLAS NO NEGOCIABLEES
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 1. NUNCA usar `replaceAll: true` en edits de código de seguridad sin
 *    revisión manual posterior de cada ocurrencia.
 *
 * 2. NUNCA declarar una tarea como terminada sin ejecutar la verificación
 *    triple (código + tests + navegador) en ese orden.
 *
 * 3. SIEMPRE usar graphify query ANTES de grep o lectura de archivos para
 *    preguntas sobre arquitectura o impacto de cambios.
 *
 * 4. CUANDO un agente detecta un fallo en otra capa → parar, reportar, y
 *    re-ejecutar la capa afectada ANTES de continuar.
 *
 * 5. LOS TESTS son la fuente de verdad — nunca confiar en "parece que funciona"
 *    sin evidencia de tests pasando.
 *
 * 6. Después de cada fix, regenerar grafo con `graphify update .` para
 *    mantener la trazabilidad de dependencias.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * EJEMPLO DE EJECUCIÓN (sesión real)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Tarea: "Agregar protección anti-bot al formulario de contacto"
 *
 * Fase 1 — Paralela por áreas:
 *   Agent A (lib/): crear src/lib/captcha.ts, src/lib/anti-bot.ts
 *   Agent B (api/public/inquiries): agregar checks honeypot+timing+CAPTCHA
 *   Agent C (components/portal/sections/asistencia): reescribir ContactForm
 *   → Todos reportan resultados en paralelo
 *
 * Fase 2 — Verificación por capas:
 *   Capa seguridad: node /tmp/verify-anti-bot.js → 12/12 PASS
 *   Capa CSRF:      node /tmp/verify-csrf-final.js → 16/16 PASS
 *   Capa handlers:  node /tmp/count-protect.js     → 91/91 protected
 *
 * Fase 3 — Regresión:
 *   → Re-ejecutar todas las suites en secuencia
 *   → Confirmar 0 regressiones
 *
 * Fase 4 — Commit:
 *   → Agregar cambios, commit semántico, push a origin/main
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */
