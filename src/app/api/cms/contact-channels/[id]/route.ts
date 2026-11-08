import { NextRequest, NextResponse } from 'next/server';
import { handleCMSGetOne, handleCMSPut, handleCMSDelete } from '@/lib/cms-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleCMSGetOne('contacts', id);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleCMSPut(request, 'contacts', id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleCMSDelete(request, 'contacts', id);
}