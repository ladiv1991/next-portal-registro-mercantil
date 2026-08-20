'use client';

import React, { useCallback, useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CmsFileUploadProps {
  /** Called with the uploaded file path (URL) when upload succeeds */
  value?: string;
  onChange: (url: string) => void;
  /** Comma-separated accepted extensions, e.g. ".jpg,.png,.gif,.webp" */
  accept?: string;
  /** Upload folder under public/uploads/ */
  folder: string;
  /** Max file size in MB */
  maxSizeMB?: number;
  /** Label shown above the field */
  label?: string;
  className?: string;
}

const ACCEPT_IMAGES = '.jpg,.jpeg,.png,.gif,.webp,.svg,.bmp';
const ACCEPT_DOCS = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt';

export function ImageUpload({ value, onChange, label = 'Imagen', folder = 'cms/images', maxSizeMB = 5, className }: Omit<CmsFileUploadProps, 'accept'>) {
  return (
    <CmsFileUploadInner
      value={value}
      onChange={onChange}
      accept={ACCEPT_IMAGES}
      folder={folder}
      maxSizeMB={maxSizeMB}
      label={label}
      className={className}
      previewMode="image"
    />
  );
}

export function DocumentUpload({ value, onChange, label = 'Documento', folder = 'cms/documents', maxSizeMB = 20, className }: Omit<CmsFileUploadProps, 'accept'>) {
  return (
    <CmsFileUploadInner
      value={value}
      onChange={onChange}
      accept={ACCEPT_DOCS}
      folder={folder}
      maxSizeMB={maxSizeMB}
      label={label}
      className={className}
      previewMode="document"
    />
  );
}

/* ─── shared inner component ─── */

interface InnerProps extends CmsFileUploadProps {
  previewMode: 'image' | 'document';
}

function CmsFileUploadInner({
  value,
  onChange,
  accept,
  folder,
  maxSizeMB = 10,
  label,
  className,
  previewMode,
}: InnerProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndUpload = useCallback(
    async (files: FileList) => {
      const file = files[0];
      if (!file) return;

      setError(null);
      setSuccess(false);

      // extension check
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      const accepted = (accept || '').split(',').map((a) => a.trim().toLowerCase());
      if (!accepted.includes(ext)) {
        setError(`Tipo de archivo no permitido: ${ext}`);
        return;
      }

      // size check
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`El archivo excede el tamaño máximo de ${maxSizeMB} MB`);
        return;
      }

      // upload
      try {
        setUploading(true);
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', folder);

        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const json = await res.json();

        if (!json.success) {
          setError(json.error || 'Error al subir el archivo');
          return;
        }

        onChange(json.data.filePath);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error de red al subir');
      } finally {
        setUploading(false);
      }
    },
    [accept, folder, maxSizeMB, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) validateAndUpload(e.dataTransfer.files);
    },
    [validateAndUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleClear = () => {
    onChange('');
    setError(null);
    setSuccess(false);
  };

  /* ── preview helpers ── */
  const hasValue = !!value;
  const isImage = previewMode === 'image' && hasValue;

  return (
    <div className={cn('space-y-2', className)}>
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}

      {/* existing value preview */}
      {isImage && (
        <div className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <img
            src={value}
            alt={label || 'preview'}
            className="w-full h-40 object-cover"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
            title="Quitar imagen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {previewMode === 'document' && hasValue && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 bg-gray-50 group">
          <div className="w-9 h-9 rounded-lg bg-[#1A1A1A]/5 flex items-center justify-center shrink-0">
            <Upload className="w-4 h-4 text-[#1A1A1A]" />
          </div>
          <span className="text-sm text-gray-700 truncate flex-1" title={value}>
            {value.split('/').pop()}
          </span>
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-md hover:bg-[#7A2A1E]/10 text-gray-400 hover:text-[#9E3A2E] transition-colors opacity-0 group-hover:opacity-100"
            title="Quitar documento"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-5 transition-colors cursor-pointer',
          uploading ? 'pointer-events-none opacity-60' : '',
          dragOver
            ? 'border-[#7A2A1E] bg-[#7A2A1E]/5'
            : 'border-gray-300 hover:border-[#7A2A1E]/50 hover:bg-gray-50/50',
          success && 'border-green-500 bg-green-50'
        )}
      >
        {uploading ? (
          <Loader2 className="w-6 h-6 text-[#1A1A1A] animate-spin mb-1" />
        ) : success ? (
          <CheckCircle2 className="w-6 h-6 text-green-600 mb-1" />
        ) : dragOver ? (
          <Upload className="w-6 h-6 text-[#9E3A2E] mb-1" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
            {previewMode === 'image' ? (
              <ImageIcon className="w-5 h-5 text-gray-400" />
            ) : (
              <Upload className="w-5 h-5 text-gray-400" />
            )}
          </div>
        )}

        <p className="text-sm font-medium text-gray-700 text-center">
          {uploading
            ? 'Subiendo...'
            : success
              ? '¡Archivo subido!'
              : dragOver
                ? 'Suelte el archivo aquí'
                : 'Arrastre o haga clic para seleccionar'}
        </p>
        {!uploading && !success && (
          <p className="text-xs text-gray-400 mt-0.5">
            {(accept || '').toUpperCase()} — Máx. {maxSizeMB} MB
          </p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={(e) => e.target.files && e.target.files.length > 0 && validateAndUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* error */}
      {error && (
        <p className="text-xs text-[#9E3A2E] flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}

      {/* manual URL fallback */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="O pegue una URL externa https://..."
          className="flex-1 h-9 rounded-md border border-gray-200 bg-white px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-[#1A1A1A]"
        />
      </div>
    </div>
  );
}
