import { NextRequest, NextResponse } from 'next/server';
import { handleCMSGetOne, handleCMSPut, handleCMSDelete, parseModelFromPath } from '@/lib/cms-handler';

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
  return handleCMSDelete(model, id);
}
