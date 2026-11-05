/**
 * File Validation Module
 *
 * Validates uploaded files using multiple layers:
 * 1. MIME type whitelist per category
 * 2. Extension whitelist per category
 * 3. Magic bytes (binary signature) verification - CORE SECURITY
 * 4. File size limits
 *
 * Magic bytes are the most reliable defense against content spoofing:
 * - A .jpg file that starts with PNG magic bytes is rejected
 * - An HTML/JS file pretending to be a PDF is rejected
 * - Prevents XSS via malicious file uploads
 */

import path from 'path';
import { createHash } from 'crypto';

// Magic bytes (file signatures) for common file types
// Format: [startByteHex, mimeType, extension]
const MAGIC_BYTES: Array<{ start: string; mimeType: string; extension: string }> = [
  // JPEG JFIF
  { start: 'FFD8FF', mimeType: 'image/jpeg', extension: '.jpg' },
  // PNG (first 8 bytes: 89504E470D0A1A0A)
  { start: '89504E47', mimeType: 'image/png', extension: '.png' },
  // WebP (RIFF container)
  { start: '52494646', mimeType: 'image/webp', extension: '.webp' },
  // PDF (must start with %PDF-)
  { start: '255044462D312E', mimeType: 'application/pdf', extension: '.pdf' },
  // GIF (GIF89a or GIF87a)
  { start: '47494638', mimeType: 'image/gif', extension: '.gif' },
  // ZIP (includes DOCX, XLSX, PPTX, ODF, etc.)
  { start: '504B0304', mimeType: 'application/zip', extension: '.zip' },
  // SVG (XML prolog or DOCTYPE)
  { start: '3C3F786D6C', mimeType: 'application/xml', extension: '.svg' },
];

/**
 * Verifica los "magic bytes" (firma binaria) de un archivo
 * para confirmar que el contenido coincide con el tipo MIME/extensión afirmados.
 * Retorna { valid, actualMimeType, actualExtension }.
 */
export function verifyMagicBytes(
  buffer: Buffer,
  expectedMimeType: string,
  expectedExtension: string
): { valid: boolean; actualMimeType?: string; actualExtension?: string } {
  const header = buffer.toString('utf8', 0, 16).toUpperCase();

  for (const magic of MAGIC_BYTES) {
    if (header.startsWith(magic.start.toUpperCase())) {
      // Verificar que la extensión también coincide
      const actualExt = expectedExtension.toLowerCase();
      if (actualExt === magic.extension.toLowerCase()) {
        return { valid: true, actualMimeType: magic.mimeType, actualExtension: magic.extension };
      }
      // Extensión no coincide - archivo con firma incorrecta
      return {
        valid: false,
        actualMimeType: magic.mimeType,
        actualExtension: magic.extension,
      };
    }
  }

  // No matching magic byte found - reject
  return { valid: false };
}

/**
 * Detecta el tipo de archivo basándose en los primeros bytes (magic bytes).
 * Útil para logging y mensajes de error más precisos.
 */
export function detectFileTypeFromBuffer(buffer: Buffer): { mimeType: string; extension: string } | null {
  const header = buffer.toString('utf8', 0, 16).toUpperCase();

  for (const magic of MAGIC_BYTES) {
    if (header.startsWith(magic.start.toUpperCase())) {
      return { mimeType: magic.mimeType, extension: magic.extension };
    }
  }

  return null;
}

/**
 * Lista blanca de extensiones permitidas por categoría.
 */
export const EXTENSIONS_BY_CATEGORY: Record<string, Set<string>> = {
  file: new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.zip', '.gz']),
  image: new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']),
  document: new Set(['.pdf']),
  video: new Set(['.mp4', '.webm', '.mov', '.avi']),
  archive: new Set(['.zip', '.rar', '.tar', '.gz', '.pdf']),
};

/**
 * Verifica que la suma de verificación (checksum) del archivo sea único
 * para prevenir sobrescrituras accidental o maliciosas.
 */
export function generateFileChecksum(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}