import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { requireAdmin } from '@/lib/api-auth';
import { categoryFromFolder, safeUploadFolder, sanitizeUploadFilename, validateUpload } from '@/lib/upload-security';
import { checkOrigin } from '@/lib/origin-check';

export async function POST(request: NextRequest) {
  try {
    if (!checkOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
    }

    // Only authenticated CMS administrators may write files to the server filesystem.
    await requireAdmin();
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No se proporcionó archivo' }, { status: 400 });
    }

    const safeFolder = safeUploadFolder(folder);
    if (!safeFolder) return NextResponse.json({ success: false, error: 'Carpeta de upload inválida' }, { status: 400 });
    const category = categoryFromFolder(safeFolder);
    const validationError = validateUpload(file, category);
    if (validationError) return NextResponse.json({ success: false, error: validationError }, { status: 400 });

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', safeFolder);
    await mkdir(uploadsDir, { recursive: true });

    const fileName = sanitizeUploadFilename(file.name);
    const filePath = `/uploads/${safeFolder}/${fileName}`;
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
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}
