import { NextRequest } from 'next/server';
import { handleCMSGet, handleCMSPost, parseModelFromPath } from '@/lib/cms-handler';
import { checkOrigin } from '@/lib/origin-check';

export async function GET(request: NextRequest) {
  const model = parseModelFromPath(request.nextUrl.pathname);
  return handleCMSGet(request, model);
}

export async function POST(request: NextRequest) {
  const model = parseModelFromPath(request.nextUrl.pathname);
  return handleCMSPost(request, model);
}
