import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [faqs, procedures, regulations, services, contactChannels] = await Promise.all([
      db.fAQ.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
      db.procedure.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
      db.regulation.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
      db.service.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
      db.contactChannel.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
    ]);

    const contextParts: string[] = [];

    // Add FAQs
    if (faqs.length > 0) {
      contextParts.push('=== PREGUNTAS FRECUENTES ===');
      for (const faq of faqs) {
        contextParts.push(`P: ${faq.question}\nR: ${faq.answer}`);
      }
      contextParts.push('');
    }

    // Add Procedures
    if (procedures.length > 0) {
      contextParts.push('=== TRÁMITES ===');
      for (const proc of procedures) {
        contextParts.push(`- ${proc.title}: ${proc.description || ''} ${proc.time ? `(Tiempo estimado: ${proc.time})` : ''} ${proc.cost ? `(Costo: ${proc.cost})` : ''}`);
      }
      contextParts.push('');
    }

    // Add Regulations
    if (regulations.length > 0) {
      contextParts.push('=== NORMATIVAS ===');
      for (const reg of regulations) {
        contextParts.push(`- ${reg.title} (${reg.type}${reg.number ? ` ${reg.number}` : ''}${reg.effectiveDate ? `, ${reg.effectiveDate}` : ''}): ${reg.description || ''}`);
      }
      contextParts.push('');
    }

    // Add Services
    if (services.length > 0) {
      contextParts.push('=== SERVICIOS ===');
      for (const svc of services) {
        contextParts.push(`- ${svc.title}: ${svc.description || ''}`);
      }
      contextParts.push('');
    }

    // Add Contact Channels
    if (contactChannels.length > 0) {
      contextParts.push('=== CANALES DE CONTACTO ===');
      for (const ch of contactChannels) {
        contextParts.push(`- ${ch.label} (${ch.type}): ${ch.value}`);
      }
      contextParts.push('');
    }

    return NextResponse.json({
      success: true,
      data: {
        context: contextParts.join('\n'),
        faqCount: faqs.length,
        procedureCount: procedures.length,
        regulationCount: regulations.length,
        serviceCount: services.length,
        contactCount: contactChannels.length,
      },
    });
  } catch (error) {
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}
