import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { requireAdmin } from '@/lib/api-auth';
import { checkOrigin } from '@/lib/origin-check';
import { verifyMagicBytes, generateFileChecksum, detectFileTypeFromBuffer, EXTENSIONS_BY_CATEGORY } from '@/lib/file-validation';
import { categoryFromFolder, maxUploadBytes } from '@/lib/upload-security';
import { randomUUID } from 'crypto';

/**
 * Ruta privada de almacenamiento para uploads (NO accesible desde public/)
 * Los archivos se sirven mediante el endpoint /api/upload/serve/:id
 */
const PRIVATE_UPLOADS_DIR = path.join(process.cwd(), '.private', 'uploads');

export async function POST(request: NextRequest) {
  try {
    if (!checkOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
    }

    // Solo administradores autorizados pueden subir archivos al servidor.
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No se proporcionó archivo' }, { status: 400 });
    }

    const category = categoryFromFolder(folder);
    const maxBytes = maxUploadBytes(category);

    // Validación básica
    const extension = path.extname(file.name || '').toLowerCase();
    const allowedExt = EXTENSIONS_BY_CATEGORY[category.toLowerCase()] || EXTENSIONS_BY_CATEGORY.file;
    if (!allowedExt.has(extension)) {
      return NextResponse.json(
        { success: false, error: `Extensión ${extension} no permitida para categoría ${category}` },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ success: false, error: 'El archivo está vacío' }, { status: 400 });
    }

    if (file.size > maxBytes) {
      return NextResponse.json(
        { success: false, error: `El archivo supera el límite de ${(maxBytes / (1024 * 1024)).toFixed(1)} MB` },
        { status: 400 }
      );
    }

    // Leer buffer completo para validación de magic bytes
    const buffer = Buffer.from(await file.arrayBuffer());

    // VALIDACIÓN CRÍTICA: Magic bytes
    // Esto previene que un archivo HTML/JS sea subido con extensión .jpg o .pdf
    const magicValidation = verifyMagicBytes(buffer, file.type.toLowerCase(), extension);
    if (!magicValidation.valid) {
      const detectedType = detectFileTypeFromBuffer(buffer);
      return NextResponse.json(
        {
          success: false,
          error: `El archivo no coincide con su tipo afirmado. Extensión: ${extension}, Tipo MIME: ${file.type}. Firma detectada: ${detectedType?.mimeType || 'desconocida'}`,
          detected: detectedType
        },
        { status: 400 }
      );
    }

    // Generar nombre único y ruta privada
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const uuid = randomUUID();
    const fileName = `${uuid}${extension}`;
    const relativePath = path.join('.private', 'uploads', safeFolder, fileName);
    const fullPath = path.resolve(relativePath);

    // Asegurar que la ruta no escape del directorio .private/uploads
    const canonicalPath = path.normalize(fullPath);
    if (!canonicalPath.startsWith(path.resolve(PRIVATE_UPLOADS_DIR))) {
      return NextResponse.json({ success: false, error: 'Ruta de archivo inválida' }, { status: 400 });
    }

    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, buffer);

    // Calcular checksum para auditoría
    const checksum = generateFileChecksum(buffer);

    return NextResponse.json({
      success: true,
      data: {
        id: uuid,
        fileName,
        filePath: `/api/upload/serve/${uuid}${extension}`,
        fileSize: file.size,
        fileType: file.type,
        extension,
        checksum,
        category
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Permiso denegado' }, { status: 403 });
    }
    console.error('[API Upload] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}