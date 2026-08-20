import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ═══════════════════════════════════════════════════════════════
// ALGORITMO DEL CHAT - EXPLICACIÓN
// ═══════════════════════════════════════════════════════════════
//
// Este archivo (/api/chat/send) es el "cerebro" del asistente virtual.
// Funciona en 3 fases secuenciales cada vez que el usuario envía un mensaje:
//
// ┌─────────────────────────────────────────────────────────┐
// │ FASE 1: EXTRAER CONTEXTO DE LA BD (líneas 40-140)       │
// │                                                          │
// │ Se ejecuta SIEMPRE, en cada mensaje del usuario.         │
// │ Hace 6 queries en paralelo a la BD usando Prisma ORM:    │
// │   • db.fAQ           → Preguntas frecuentes              │
// │   • db.procedure      → Trámites (requ, costos, pasos)    │
// │   • db.regulation    → Normativas legales                 │
// │   • db.service       → Servicios del portal               │
// │   • db.guide         → Guías paso a paso (JSON)          │
// │   • db.contactChannel→ Teléfonos, correo, dirección       │
// │                                                          │
// │ Todo se concatena en un string "knowledgeContext"          │
// │ que se inyecta como contexto del LLM.                     │
// │                                                          │
// │ ⚡ AUTO-ACTUALIZACIÓN: Cada vez que se guarda un         │
// │   contenido desde el CMS (ej: agregar una nueva FAQ),     │
// │   la próxima consulta del chat ya trae ese dato fresco    │
// │   porque lee directamente de la BD en cada llamada.       │
// │   No hay archivo de caché, no hay que regenerar nada.    │
// └─────────────────────────────────────────────────────────┘
//                          ↓
// ┌─────────────────────────────────────────────────────────┐
// │ FASE 2: BUSCAR COINCIDENCIAS EN LA BD (líneas 142-190) │
// │                                                          │
// │ Antes de llamar al LLM, se busca si hay coincidencias   │
// │ directas en el contenido de la BD con el mensaje del     │
// │ usuario. Se usa un sistema de scoring por palabras:      │
// │                                                          │
// │   - Término en título → +5 puntos                       │
// │   - Término en contenido → +2 puntos                     │
// │   - Frase exacta → +10 puntos                            │
// │                                                          │
// │ Si score > 3 → se encontró algo relevante.              │
// │ Si score ≤ 3 → la consulta es vaga o no hay coincidencia│
// │                                                          │
// │ Ejemplo con "necesito hacer una modificación":           │
// │   - "modificación" está en título de trámite → +5        │
// │   - "modificación" está en Guía de Modificaciones → +5   │
// │   - "modificación" está en descripciones → +2+2          │
// │   Score total: ~14 → ¡Coincidencia encontrada! →         │
// │   Se le indica al LLM: "RESPONDE DIRECTAMENTE con..."   │
// └─────────────────────────────────────────────────────────┘
//                          ↓
// ┌─────────────────────────────────────────────────────────┐
// │ FASE 3: ENVIAR AL LLM (líneas 192-240)                  │
//                                                          │
// │ Se construye un system prompt dinámico con:             │
// │   1. Config personalizada del bot (tabla BotConfig)     │
// │   2. Reglas de comportamiento                          │
// │   3. Resultado de la Fase 2 (¿encontró coincidencias?) │
// │   4. Conocimiento completo de la BD                     │
// │   5. Datos de contacto                                  │
// │                                                          │
// │ Dependiendo de la Fase 2, la instrucción al LLM cambia:  │
// │                                                          │
// │ Si HAY coincidencias:                                   │
// │   → "RESPONDE DIRECTAMENTE con la información que        │
// │      encontraste. Sé específico sobre [temas].           │
// │      Incluye requisitos, costos, pasos si existen."      │
// │                                                          │
// │ Si NO hay coincidencias (consulta vaga):                │
// │   → "La consulta es amplia. Pide amablemente que          │
// │      especifique. Ofrece las opciones disponibles."      │
// │                                                          │
// │ Si NO hay coincidencias pero la consulta tiene           │
// │ palabras específicas (no es vaga):                      │
// │   → "No encontraste información exacta. Da contactos     │
// │      y remite a Mesa de Ayuda."                         │
// │                                                          │
// │ Se usa z-ai-web-dev-sdk para llamar al modelo LLM.       │
// └─────────────────────────────────────────────────────────┘
//                          ↓
// ┌─────────────────────────────────────────────────────────┐
// │ FASE 4: SAFETY FILTER (líneas 242-260)                  │
// │                                                          │
// │ Se verifica que la respuesta del LLM no contenga        │
// │ palabras de error. Si las contiene, se reemplaza por    │
// │ un mensaje amable que pide especificidad + contactos.    │
// │                                                          │
// │ Si hay error real del servidor → siempre devuelve        │
// │ success: true con un mensaje de ayuda (nunca error).   │
// └─────────────────────────────────────────────────────────┘
//
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body as { messages: Array<{ role: string; content: string }> };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ success: false, error: 'messages es requerido' }, { status: 400 });
    }

    const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || '';

    // ═══════════════════════════════════════════════
    // FASE 1: Extraer contexto de la BD
    // ═══════════════════════════════════════════════
    let botConfigPrompt = '';
    let knowledgeContext = '';
    let knowledgeSources = '';
    let dbContent: string[] = []; // flat list for search scoring

    try {
      // Bot config
      const config = await db.botConfig.findUnique({ where: { id: 'default' } });
      if (config?.systemPrompt) botConfigPrompt = config.systemPrompt;

      // All content in parallel
      const [faqs, procedures, regulations, services, guides, contactChannels] = await Promise.all([
        db.fAQ.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
        db.procedure.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
        db.regulation.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
        db.service.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
        db.guide.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
        db.contactChannel.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
      ]);

      const parts: string[] = [];

      // Build knowledge context for LLM
      if (faqs.length > 0) {
        parts.push('## PREGUNTAS FRECUENTES (Sección: Normatividad → #normatividad)');
        for (const faq of faqs) {
          const entry = `P: ${faq.question}\nR: ${faq.answer}`;
          parts.push(entry);
          dbContent.push(`FAQ|${faq.question}|${faq.answer}`);
        }
        parts.push('');
      }

      if (procedures.length > 0) {
        parts.push('## TRÁMITES (Sección: Trámites → #tramites)');
        for (const proc of procedures) {
          let detail = `**${proc.title}**: ${proc.description}`;
          if (proc.time) detail += ` | Tiempo: ${proc.time}`;
          if (proc.cost) detail += ` | Costo: ${proc.cost}`;
          if (proc.requirements) detail += ` | Requisitos: ${proc.requirements}`;
          if (proc.steps) detail += ` | Pasos: ${proc.steps}`;
          parts.push(detail);
          dbContent.push(`PROCEDURE|${proc.title}|${proc.description} ${proc.requirements || ''} ${proc.steps || ''}`);
        }
        parts.push('');
      }

      if (regulations.length > 0) {
        parts.push('## NORMATIVAS LEGALES (Sección: Normatividad → #normatividad)');
        for (const reg of regulations) {
          parts.push(`**${reg.title}** (${reg.type}${reg.number ? ` ${reg.number}` : ''}): ${reg.description}`);
          dbContent.push(`REGULATION|${reg.title}|${reg.description} ${reg.category || ''}`);
        }
        parts.push('');
      }

      if (services.length > 0) {
        parts.push('## SERVICIOS DEL PORTAL (Sección: Inicio → #home)');
        for (const svc of services) {
          parts.push(`**${svc.title}**: ${svc.description}`);
          dbContent.push(`SERVICE|${svc.title}|${svc.description}`);
        }
        parts.push('');
      }

      if (guides.length > 0) {
        parts.push('## GUÍAS PASO A PASO (Sección: Asistencia → #asistencia)');
        for (const guide of guides) {
          let stepsInfo = '';
          try {
            const steps = JSON.parse(guide.steps || '[]');
            stepsInfo = steps.map((s: { title: string; description: string }, i: number) => `  Paso ${i + 1}: ${s.title} - ${s.description}`).join('\n');
          } catch { /* ignore */ }
          parts.push(`**${guide.title}**: ${guide.description}${stepsInfo ? '\n' + stepsInfo : ''}`);
          dbContent.push(`GUIDE|${guide.title}|${guide.description} ${guide.steps || ''}`);
        }
        parts.push('');
      }

      if (contactChannels.length > 0) {
        parts.push('## CANALES DE CONTACTO');
        for (const ch of contactChannels) {
          parts.push(`- ${ch.label} (${ch.type}): ${ch.value}`);
        }
        parts.push('');
      }

      knowledgeContext = parts.join('\n');
      knowledgeSources = `
Secciones del portal y sus enlaces internos:
- Inicio → #home
- Consultas → #consultas
- Trámites → #tramites
- Normatividad → #normatividad
- Estadísticas → #estadisticas
- Asistencia → #asistencia
- Acceso → #acceso`;
    } catch {
      // Continue without knowledge
    }

    // ═══════════════════════════════════════════════
    // FASE 2: Buscar coincidencias en la BD
    // ═══════════════════════════════════════════════
    const stopWords = new Set([
      'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'en',
      'con', 'por', 'para', 'que', 'es', 'son', 'se', 'su', 'al', 'a', 'y', 'o',
      'no', 'si', 'como', 'más', 'pero', 'este', 'esta', 'eso', 'ese', 'ha', 'han',
      'he', 'fue', 'ser', 'tiene', 'puede', 'todo', 'todos', 'otra', 'otro', 'sobre',
      'entre', 'cuando', 'donde', 'qué', 'cual', 'necesito', 'hacer', 'quiero',
      'saber', 'información', 'ayuda', 'info', 'consulta', 'favor',
    ]);

    const queryLower = lastUserMsg.toLowerCase();
    // Also normalize accented chars for matching
    const normalizedQuery = queryLower.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const terms = normalizedQuery.split(/\s+/).filter(t => t.length > 2 && !stopWords.has(t));
    const isVagueMessage = terms.length === 0;

    // Synonym expansion for common terms
    const synonymMap: Record<string, string[]> = {
      'tramite': ['trámite', 'trámites', 'procedimiento', 'proceso', 'gestión'],
      'constitucion': ['constitución', 'constituir', 'crear', 'fundar', 'inscripción'],
      'modificacion': ['modificación', 'modificar', 'cambiar', 'actualizar', 'alterar'],
      'certificacion': ['certificación', 'certificado', 'certificar', 'nota simple'],
      'costo': ['costo', 'costos', 'precio', 'tarifa', 'arancel', 'pago'],
      'empresa': ['empresa', 'sociedad', 'negocio', 'sociedad mercantil', 'entidad'],
      'srl': ['srl', 'responsabilidad limitada'],
      'sa': ['sa', 'sociedad anónima'],
      'inversion': ['inversión', 'inversionista', 'extranjera'],
      'cuentas': ['cuentas', 'balance', 'estados financieros', 'anual'],
      'normativa': ['normativa', 'ley', 'resolución', 'reglamento', 'legal'],
    };

    // Expand terms with synonyms
    const expandedTerms = new Set<string>(terms);
    for (const term of terms) {
      for (const [key, syns] of Object.entries(synonymMap)) {
        if (key.includes(term) || term.includes(key)) {
          syns.forEach(s => expandedTerms.add(s));
        }
      }
    }

    let searchScore = 0;
    const matchedItems: string[] = [];

    for (const entry of dbContent) {
      const [type, title, content] = entry.split('|');
      const titleLower = title.toLowerCase();
      const contentLower = content.toLowerCase();
      const titleNorm = titleLower.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const contentNorm = contentLower.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      let score = 0;

      // Exact phrase match in title or content
      if (titleNorm.includes(normalizedQuery)) score += 10;
      if (contentNorm.includes(normalizedQuery)) score += 7;

      // Term-by-term matching (original + expanded synonyms)
      const allTerms = [...expandedTerms];
      for (const term of allTerms) {
        const termNorm = term.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (titleNorm.includes(termNorm)) score += 5;
        if (contentNorm.includes(termNorm)) score += 2;
      }

      if (score > 0) {
        searchScore += score;
        matchedItems.push(`${type}: ${title}`);
      }
    }

    const foundMatch = searchScore > 2; // Lower threshold to catch more matches
    const matchedTopics = matchedItems.slice(0, 5).join('\n- ');

    // ═══════════════════════════════════════════════
    // FASE 3: Construir prompt dinámico y llamar LLM
    // ═══════════════════════════════════════════════

    let behaviorInstruction = '';

    if (foundMatch) {
      // ✅ HAY coincidencias → Responder directamente
      behaviorInstruction = `
🔔 SE ENCONTRÓ INFORMACIÓN RELEVANTE en el portal para la consulta del usuario.
Los temas encontrados son:
- ${matchedTopics}

INSTRUCCIÓN: Responde DIRECTAMENTE con la información que encontraste. NO pidas más detalles.
Sé específico sobre los trámites, requisitos, costos y pasos que apliquen.
Si hay una guía paso a paso relacionada, menciona sus pasos.
Incluye enlaces a la sección correspondiente del portal.`;
    } else if (isVagueMessage) {
      // ❌ Consulta completamente vaga (solo stop words)
      behaviorInstruction = `
⚠️ La consulta del usuario es VAGA.

INSTRUCCIÓN: Pide amablemente que especifique qué necesita. Ofrece estas opciones concretas:
- **Solicitud de Primera Inscripción de un Sujeto** (SRL, SA, Cooperativa)
- **Modificaciones** de datos de sociedad
- **Depósito de estado de situación**
- **Inversión extranjera**
- **Certificaciones** y notas simples
- **Normativas legales** vigentes
- **Guías paso a paso**

Termina siempre con:
📞 **(+53) 7 862-3456** (Lun-Vie 8:30-16:30)
📝 [Mesa de Ayuda](#asistencia)`;
    } else {
      // ⚠️ Consulta tiene términos pero no hay coincidencias
      behaviorInstruction = `
⚠️ La consulta del usuario tiene palabras clave pero NO se encontró información exacta en el portal.

INSTRUCCIÓN: Indica amablemente que no tienes datos específicos sobre ese tema exacto, pero ofrece alternativas cercanas si las hay. Si no hay alternativas, proporciona los canales de contacto directo y el formulario de Mesa de Ayuda.
NUNCA digas que hubo un error o problema.`;
    }

    const fullSystemPrompt = `${botConfigPrompt || 'Eres un asistente virtual del Registro Mercantil de Cuba. Siempre responde en español, con tono amable y profesional.'}

${behaviorInstruction}

REGLAS GENERALES:
- Usa Markdown (listas, negritas) para organizar.
- Sé conciso pero completo. Si hay requisitos, costos o pasos, inclúyelos.
- Incluye SIEMPRE un enlace a la sección del portal. Formato: [Nombre Sección](#enlace)
- Si el usuario saluda, saluda de vuelta y ofrece opciones.
- Si pregunta por horarios, costos o contacto, responde directamente.
- NUNCA uses frases como: "tuve un problema", "no pude procesar", "hubo un error", "ocurrió un fallo".

${knowledgeSources ? `ENLACES DISPONIBLES:\n${knowledgeSources}` : ''}

CONOCIMIENTO COMPLETO DEL PORTAL:
${knowledgeContext || 'No hay contenido disponible en este momento.'}

DATOS DE CONTACTO (siempre disponibles):
- 📞 Teléfono: (+53) 7 862-3456 • Horario: Lun-Vie 8:30-16:30
- 📧 Correo: soporte@registromercantil.cu
- 📍 Oficina Central: Calle Obispo No. 154, La Habana Vieja
- 📝 Mesa de Ayuda: [Asistencia → Mesa de Ayuda](#asistencia)`;

    // ─── LLM Call ───
    let reply = '';

    if (config?.provider === 'openai-compatible' && config.apiUrl && config.apiKey) {
      // Use OpenAI-compatible API
      const response = await fetch(`${config.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: fullSystemPrompt },
            ...messages,
          ],
          max_tokens: config.maxTokens || 2048,
          temperature: config.temperature || 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        reply = data.choices?.[0]?.message?.content || '';
      } else {
        throw new Error(`OpenAI API error: ${response.status}`);
      }
    } else {
      // Use Z-AI-Web-Dev-SDK (fallback)
      try {
        const mod = await import('z-ai-web-dev-sdk');
        const ZAI = mod.default || mod;
        const zai = await ZAI.create();

        const completion = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: fullSystemPrompt },
            ...messages,
          ],
        });

        reply = completion.choices[0]?.message?.content || '';
      } catch (zaiError) {
        // If Z-AI fails and no OpenAI config, provide fallback response
        reply = `Lo siento, el servicio de chat inteligente no está disponible en este momento. ¿Podría contactar directamente con nosotros?\n\n📞 **Teléfono**: (+53) 7 862-3456 (Lun-Vie 8:30-16:30)\n📧 **Correo**: soporte@registromercantil.cu\n📝 [Mesa de Ayuda](#asistencia)`;
      }
    }

    // ═══════════════════════════════════════════════
    // FASE 4: Safety filter
    // ═══════════════════════════════════════════════

    if (!reply || /error|problema|fallo|no pude|no logré|ocurrrió un error/i.test(reply)) {
      reply = foundMatch
        ? `Le comparto la información que encontré en el portal:\n\n${matchedItems.map(m => `- ${m.replace(/^\w+:\s*/, '**')}`).join('\n')}\n\nPara más detalles, consulte las secciones correspondientes del portal.\n\n📞 **Teléfono**: (+53) 7 862-3456 (Lun-Vie 8:30-16:30)\n📧 **Correo**: soporte@registromercantil.cu\n📝 [Mesa de Ayuda](#asistencia)`
        : `¿Podría ser más específico sobre lo que necesita? Puedo ayudarle con:\n\n- **Solicitud de Primera Inscripción de un Sujeto** (SRL, SA, Cooperativa)\n- **Modificaciones** de datos de sociedad\n- **Estado de Situación** y depósitos\n- **Inversión extranjera**\n- **Certificaciones** y notas simples\n- **Normativas y leyes** vigentes\n- **Guías paso a paso**\n\nO contacte directamente:\n📞 **(+53) 7 862-3456** (Lun-Vie 8:30-16:30)\n📧 **soporte@registromercantil.cu**\n📝 [Mesa de Ayuda](#asistencia)`;
    }

    return NextResponse.json({ success: true, data: { reply } });
  } catch (error) {
    // Real server error → never expose to user, always return graceful message
    return NextResponse.json({
      success: true,
      data: {
        reply: `¿Podría ser más específico sobre su consulta? Estoy aquí para ayudarle con trámites, normativas, guías y más.\n\n📞 **Teléfono**: (+53) 7 862-3456 (Lun-Vie 8:30-16:30)\n📧 **Correo**: soporte@registromercantil.cu\n📝 [Formulario de Mesa de Ayuda](#asistencia)`,
      },
    });
  }
}
