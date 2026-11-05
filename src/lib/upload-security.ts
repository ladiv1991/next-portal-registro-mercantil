/**
 * Security-hardened upload utilities.
 * - Private storage: uploads go to .private/uploads/, not public/
 * - Magic bytes validation: enforced in route.ts via file-validation.ts
 * - Safe path resolution: prevents directory traversal attacks
 */

import path from 'path';
import { EXTENSIONS_BY_CATEGORY } from './file-validation';

export type UploadCategory = 'file' | 'image' | 'document' | 'video';

const MIME_BY_CATEGORY: Record<UploadCategory, Set<string>> = {
  file: new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  image: new Set(['image/jpeg', 'image/png', 'image/webp']),
  document: new Set(['application/pdf']),
  video: new Set(['video/mp4', 'video/webm', 'video/quicktime']),
};

/**
 * Rutas privadas de almacenamiento para cada categoría.
 * Estos directorios NO son accesibles directamente desde el navegador.
 */
const PRIVATE_UPLOAD_ROOT = path.join(process.cwd(), '.private', 'uploads');

const PRIVATE_UPLOAD_FOLDERS: Record<UploadCategory, string> = {
  file: PRIVATE_UPLOAD_ROOT,
  image: path.join(PRIVATE_UPLOAD_ROOT, 'images'),
  document: path.join(PRIVATE_UPLOAD_ROOT, 'documents'),
  video: path.join(PRIVATE_UPLOAD_ROOT, 'videos'),
};

function envMegabytes(name: string, fallback: number): number {
  const value = Number(process.env[name] || fallback);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function maxUploadBytes(category: UploadCategory): number {
  const variableByCategory: Record<UploadCategory, string> = {
    file: 'UPLOAD_MAX_FILE_MB',
    image: 'UPLOAD_MAX_IMAGE_MB',
    document: 'UPLOAD_MAX_DOCUMENT_MB',
    video: 'UPLOAD_MAX_VIDEO_MB',
  };
  return envMegabytes(variableByCategory[category], category === 'video' ? 100 : category === 'document' ? 20 : 5) * 1024 * 1024;
}

export function categoryFromFolder(folder: string): UploadCategory {
  const normalized = folder.toLowerCase();
  if (normalized.includes('video')) return 'video';
  if (normalized.includes('document') || normalized.includes('procedure') || normalized.includes('regulation')) return 'document';
  if (normalized.includes('image') || normalized.includes('slider') || normalized.includes('news')) return 'image';
  return 'file';
}

export function validateUpload(file: File, category: UploadCategory): string | null {
  const extension = path.extname(file.name || '').toLowerCase();
  if (file.size === 0) return 'El archivo está vacío';
  if (file.size > maxUploadBytes(category)) return `El archivo supera el límite permitido para ${category}`;
  if (!MIME_BY_CATEGORY[category].has(file.type.toLowerCase()) || !EXTENSIONS_BY_CATEGORY[category].has(extension)) {
    return 'Tipo de archivo no permitido';
  }
  return null;
}

export function sanitizeUploadFilename(filename: string): string {
  const extension = path.extname(filename || '').toLowerCase();
  const basename = path.basename(filename || 'upload', extension).replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${crypto.randomUUID()}_${basename || 'file'}${extension}`;
}

/**
 * Retorna la ruta absoluta del directorio privado para una categoría dada.
 * Útil para limpiar archivos viejos o para auditar el almacenamiento.
 */
export function getPrivateUploadPath(category: UploadCategory): string {
  return PRIVATE_UPLOAD_FOLDERS[category];
}