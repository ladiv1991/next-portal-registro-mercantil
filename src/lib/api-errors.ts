import { NextResponse } from 'next/server';

export function internalError(message?: string, context?: unknown): Response {
  if (context) console.error('[API] Internal error:', context);
  return NextResponse.json(
    { success: false, error: message || 'Error interno del servidor. Por favor, inténtelo más tarde.' },
    { status: 500 },
  );
}