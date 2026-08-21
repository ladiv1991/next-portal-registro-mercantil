import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

function sanitizeFilename(filename: string): string {
  const extension = path.extname(filename || '').toLowerCase();
  const basename = path.basename(filename || 'upload', extension).replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${Date.now()}_${basename || 'file'}${extension}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No se proporcionó archivo' }, { status: 400 });
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'El archivo es inválido o supera el tamaño máximo permitido (5 MB)' }, { status: 400 });
    }

    const mimeType = file.type?.toLowerCase();
    const extension = path.extname(file.name || '').toLowerCase();
    if (!mimeType || !ALLOWED_MIME_TYPES.has(mimeType) || !['.pdf', '.jpg', '.jpeg', '.png', '.webp'].includes(extension)) {
      return NextResponse.json({ success: false, error: 'Tipo de archivo no permitido' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await mkdir(uploadsDir, { recursive: true });

    const fileName = sanitizeFilename(file.name);
    const filePath = `/uploads/${folder}/${fileName}`;
    const fullPath = path.join(uploadsDir, fileName);

    const bytes = await file.arrayBuffer();
    await writeFile(fullPath, Buffer.from(bytes));

    return NextResponse.json({
      success: true,
      data: {
        fileName,
        filePath,
        fileSize: file.size,
        fileType: file.type,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al subir archivo';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
