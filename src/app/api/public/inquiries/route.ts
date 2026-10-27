import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { checkOrigin } from '@/lib/origin-check';
import { checkAntiBot, HONEYPOT_FIELD, botOkResponse } from '@/lib/anti-bot';
import { verifyCaptcha } from '@/lib/captcha';
import { rateLimit } from '@/lib/rate-limiter';

const inquirySchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Formato de correo electrónico inválido'),
  subject: z.string().min(1, 'El asunto es requerido'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
  // Anti-bot fields (not stored, consumed server-side)
  [HONEYPOT_FIELD]: z.string().optional(),
  captchaId: z.string().min(1, 'CAPTCHA requerido'),
  captchaAnswer: z.string().min(1, 'CAPTCHA requerido'),
  submittedAt: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    if (!checkOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
    }

    // Rate limiting: max 10 solicitudes por IP cada 60 segundos
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';
    const allowed = await rateLimit(`inquiries:${ip}`, { max: 10, windowMs: 60_000 });
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Demasiados intentos. Inténtelo más tarde.' },
        { status: 429 },
      );
    }

    const body = await request.json();

    // Anti-bot: honeypot + timing
    const antiBotReason = checkAntiBot(body);
    if (antiBotReason !== null) {
      // Honeypot hit → silent 200 so bots can't fingerprint the rule.
      // checkAntiBot returns '' for honeypot, non-empty string for timing fail.
      if (antiBotReason === '') {
        return botOkResponse();
      }
      return NextResponse.json({ success: false, error: antiBotReason }, { status: 400 });
    }

    // CAPTCHA verification (mandatory — zod enforces min length above)
    const captchaValid = verifyCaptcha(body.captchaId ?? '', body.captchaAnswer ?? '');
    if (!captchaValid) {
      return NextResponse.json(
        { success: false, error: 'La verificación de seguridad no es correcta. Por favor, intentelo de nuevo.' },
        { status: 400 },
      );
    }

    const validation = inquirySchema.safeParse(body);

    if (!validation.success) {
      const first = validation.error.errors[0];
      const field = first?.path?.[0] as string | undefined;
      const msg = first?.message ?? 'Campo inválido';
      return NextResponse.json(
        { success: false, error: field ? `${field}: ${msg}` : msg },
        { status: 400 },
      );
    }

    const { [HONEYPOT_FIELD]: _honeypot, captchaId: _cid, captchaAnswer: _can, submittedAt: _sat, ...data } = validation.data;

    const inquiry = await db.inquiry.create({
      data,
    });

    return NextResponse.json({ success: true, data: inquiry }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al procesar la solicitud' },
      { status: 500 },
    );
  }
}
