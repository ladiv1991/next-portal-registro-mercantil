import { NextRequest, NextResponse } from 'next/server';
import { handleCMSGet, handleCMSPost } from '@/lib/cms-handler';
import { parseModelFromPath } from '@/lib/cms-handler';

export async function GET(request: NextRequest) {
  return handleCMSGet(request, 'webinars');
}

export async function POST(request: NextRequest) {
  return handleCMSPost(request, 'webinars');
}