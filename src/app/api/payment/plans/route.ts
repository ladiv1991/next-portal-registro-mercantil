import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const plans = await db.paymentPlan.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ success: true, plans });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener planes';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}