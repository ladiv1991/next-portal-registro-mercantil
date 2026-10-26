import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireAdmin } from '@/lib/api-auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { maxUploadBytes, sanitizeUploadFilename, validateUpload } from '@/lib/upload-security';
import { checkOrigin } from '@/lib/origin-check';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Document uploads mutate CMS storage and therefore require administrator privileges.
    await requireAdmin();
    const { id } = await params;
    const documents = await db.procedureDocument.findMany({
      where: { procedureId: id },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!checkOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
    }

    await requireAuth();
    const { id } = await params;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No se proporcionó archivo' }, { status: 400 });
    }

    // Verify procedure exists
    const procedure = await db.procedure.findUnique({ where: { id } });
    if (!procedure) {
      return NextResponse.json({ success: false, error: 'Trámite no encontrado' }, { status: 404 });
    }

    const validationError = validateUpload(file, 'document');
    if (validationError) return NextResponse.json({ success: false, error: `${validationError} (máximo ${Math.round(maxUploadBytes('document') / 1024 / 1024)} MB)` }, { status: 400 });

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'procedures');
    await mkdir(uploadsDir, { recursive: true });

    const fileName = sanitizeUploadFilename(file.name);
    const filePath = `/uploads/procedures/${fileName}`;
    const fullPath = path.join(uploadsDir, fileName);

    const bytes = await file.arrayBuffer();
    await writeFile(fullPath, Buffer.from(bytes));

    // Get max order
    const maxDoc = await db.procedureDocument.findFirst({
      where: { procedureId: id },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const order = (maxDoc?.order ?? -1) + 1;

    const document = await db.procedureDocument.create({
      data: {
        procedureId: id,
        name: title || file.name,
        fileName,
        fileSize: file.size,
        mimeType: file.type || 'application/pdf',
        url: filePath,
        order,
      },
    });

    return NextResponse.json({ success: true, data: document }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!checkOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
    }

    await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const { documentId } = body as { documentId: string };

    if (!documentId) {
      return NextResponse.json({ success: false, error: 'documentId es requerido' }, { status: 400 });
    }

    const doc = await db.procedureDocument.findFirst({
      where: { id: documentId, procedureId: id },
    });

    if (!doc) {
      return NextResponse.json({ success: false, error: 'Documento no encontrado' }, { status: 404 });
    }

    await db.procedureDocument.delete({ where: { id: documentId } });
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
