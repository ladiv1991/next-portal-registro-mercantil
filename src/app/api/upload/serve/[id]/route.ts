import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';
import { requireAdmin } from '@/lib/api-auth';
import { checkOrigin } from '@/lib/origin-check';

/**
 * Endpoint seguro para servir archivos subidos.
 * - Requiere autenticación admin (requireAdmin)
 * - Solo sirve archivos desde .private/uploads/
 * - Previene directory traversal attacks
 */

// Lista blanca de extensiones permitidas para servir
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm', '.mov', '.zip', '.gz']);

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verificar origen
    if (!checkOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });
    }

    // Solo admin puede servir archivos
    await requireAdmin();

    const { id } = await params;

    // Sanitizar el ID para prevenir directory traversal
    const safeId = path.basename(id);
    const fullPath = path.resolve(
      process.cwd(),
      '.private',
      'uploads',
      safeId
    );

    // Verificar que la ruta está dentro del directorio permitido
    const canonicalPath = path.normalize(fullPath);
    const uploadsRoot = path.resolve(process.cwd(), '.private', 'uploads');

    if (!canonicalPath.startsWith(uploadsRoot)) {
      console.warn(`[Upload Serve] Intento de directory traversal bloqueado: ${canonicalPath}`);
      return NextResponse.json({ success: false, error: 'Archivo no encontrado' }, { status: 404 });
    }

    // Verificar que el archivo existe
    let stats;
    try {
      stats = await stat(fullPath);
    } catch {
      return NextResponse.json({ success: false, error: 'Archivo no encontrado' }, { status: 404 });
    }

    if (!stats.isFile()) {
      return NextResponse.json({ success: false, error: 'Archivo no encontrado' }, { status: 404 });
    }

    // Verificar extensión permitida
    const ext = path.extname(safeId).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json({ success: false, error: 'Tipo de archivo no permitido' }, { status: 403 });
    }

    // Determinar MIME type basado en extensión
    const mimeTypeMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
      '.zip': 'application/zip',
      '.gz': 'application/gzip',
    };

    const contentType = mimeTypeMap[ext] || 'application/octet-stream';
    const buffer = await readFile(fullPath);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${safeId}"`,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('[API Upload Serve] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}