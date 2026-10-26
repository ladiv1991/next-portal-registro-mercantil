import { NextRequest } from 'next/server';
import { handleCMSGetOne, handleCMSPut, handleCMSDelete, parseModelFromPath } from '@/lib/cms-handler';
import { checkOrigin } from '@/lib/origin-check';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const model = parseModelFromPath(request.nextUrl.pathname);
  return handleCMSGetOne(model, id);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const model = parseModelFromPath(request.nextUrl.pathname);
  return handleCMSPut(request, model, id);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const model = parseModelFromPath(request.nextUrl.pathname);
  return handleCMSDelete(request, model, id);
}
