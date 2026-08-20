import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';

// This would integrate with ENZONA API
export async function POST(request: NextRequest) {
  try {
    const { planId } = await request.json();

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

    // TODO: Implement ENZONA API integration
    // For now, return a mock payment URL
    const paymentUrl = `${enzonaConfig.apiUrl}/payment?amount=${plan.price}&currency=${plan.currency}&plan=${plan.id}`;

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
    const message = error instanceof Error ? error.message : 'Error al crear pago';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}