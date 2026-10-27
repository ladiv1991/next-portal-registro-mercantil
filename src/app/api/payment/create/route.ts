import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requirePortalAuth } from '@/lib/portal-auth';
import { checkOrigin } from '@/lib/origin-check';

const createPaymentSchema = z.object({
  planId: z.string().uuid('Plan ID debe ser un UUID válido'),
});

// Allowlisted hosts for the ENZONA API endpoint. Prevents SSRF via attacker-controlled enzonaConfig.apiUrl.
const ALLOWED_ENZONA_HOSTS = new Set([
  'enzona.cu',
  'api.enzona.cu',
  'sandbox.enzona.cu',
]);

// This would integrate with ENZONA API
export async function POST(request: NextRequest) {
  try {
    // Auth: only authenticated portal users may create payments.
    requirePortalAuth(request);

    // CSRF defense-in-depth for cookie-authenticated Route Handlers.
    if (!checkOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos' },
        { status: 400 },
      );
    }
    const { planId } = parsed.data;

    // Get plan details
    const plan = await db.paymentPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ success: false, error: 'Plan no encontrado' }, { status: 404 });
    }

    // Get ENZONA config
    const enzonaConfig = await db.enzonaConfig.findUnique({
      where: { id: 'default' },
    });

    if (!enzonaConfig) {
      return NextResponse.json({ success: false, error: 'Configuración de ENZONA no encontrada' }, { status: 500 });
    }

    // Sanitize the configured API URL: require https and an allowlisted host.
    let enzonaApiUrl: URL;
    try {
      enzonaApiUrl = new URL(enzonaConfig.apiUrl);
    } catch {
      return NextResponse.json({ success: false, error: 'URL de ENZONA inválida en configuración' }, { status: 500 });
    }
    if (enzonaApiUrl.protocol !== 'https:' || !ALLOWED_ENZONA_HOSTS.has(enzonaApiUrl.hostname)) {
      return NextResponse.json({ success: false, error: 'Host de ENZONA no permitido' }, { status: 500 });
    }

    // TODO: Implement ENZONA API integration
    // For now, return a mock payment URL
    const paymentUrl = `${enzonaApiUrl.origin}/payment?amount=${plan.price}&currency=${plan.currency}&plan=${plan.id}`;

    // Create subscription record
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    // This would be done after successful payment
    // const subscription = await db.userSubscription.create({
    //   data: {
    //     userId: session.user.id,
    //     planId: plan.id,
    //     endDate,
    //     paymentStatus: 'pending',
    //   },
    // });

    return NextResponse.json({
      success: true,
      paymentUrl,
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
      },
    });
  } catch (error) {
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}