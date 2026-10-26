import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { checkOrigin } from '@/lib/origin-check';

const inquirySchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Formato de correo electrónico inválido'),
  subject: z.string().min(1, 'El asunto es requerido'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

export async function POST(request: Request) {
  try {
    if (!checkOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
    }

    const body = await request.json();
    const validation = inquirySchema.safeParse(body);

    if (!validation.success) {
      const first = validation.error.errors[0];
      const field = first?.path?.[0] as string | undefined;
      const msg = first?.message ?? 'Campo inválido';
      return NextResponse.json(
        { success: false, error: field ? `${field}: ${msg}` : msg },
        { status: 400 }
      );
    }

    const inquiry = await db.inquiry.create({
      data: validation.data,
    });

    return NextResponse.json({ success: true, data: inquiry }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}