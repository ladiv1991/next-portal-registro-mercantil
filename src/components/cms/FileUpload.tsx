'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFilesSelected: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  className?: string;
}

const DEFAULT_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.txt';

export default function FileUpload({
  onFilesSelected,
  accept = DEFAULT_ACCEPT,
  multiple = true,
  maxSizeMB = 10,
  className,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const validateFiles = useCallback(
    (files: FileList): FileList | null => {
      const valid: File[] = [];
      const rejected: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        const accepted = accept.split(',').map((a) => a.trim().toLowerCase());

        if (!accepted.includes(ext)) {
          rejected.push(`${file.name}: tipo no permitido`);
          continue;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
          rejected.push(`${file.name}: excede ${maxSizeMB}MB`);
          continue;
        }
        valid.push(file);
      }

      setRejectedFiles(rejected);

      if (valid.length === 0) return null;

      const dt = new DataTransfer();
      valid.forEach((f) => dt.items.add(f));
      return dt.files;
    },
    [accept, maxSizeMB]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        const valid = validateFiles(e.dataTransfer.files);
        if (valid) onFilesSelected(valid);
      }
    },
    [validateFiles, onFilesSelected]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const valid = validateFiles(e.target.files);
        if (valid) onFilesSelected(valid);
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [validateFiles, onFilesSelected]
  );

  return (
    <div className={cn('space-y-2', className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer',
          isDragOver
            ? 'border-[#7A2A1E] bg-[#7A2A1E]/5'
            : 'border-gray-300 hover:border-[#7A2A1E]/50 hover:bg-gray-50'
        )}
      >
        <div
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors',
            isDragOver ? 'bg-[#7A2A1E]/20' : 'bg-gray-100'
          )}
        >
          <Upload className={cn('w-5 h-5', isDragOver ? 'text-[#9E3A2E]' : 'text-gray-400')} />
        </div>
        <p className="text-sm font-medium text-gray-700">
          {isDragOver ? 'Suelte los archivos aquí' : 'Arrastre archivos o haga clic para seleccionar'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {accept.replace(/\./g, '').toUpperCase()} — Máx. {maxSizeMB}MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {rejectedFiles.length > 0 && (
        <div className="space-y-1">
          {rejectedFiles.map((err, i) => (
            <p key={i} className="text-xs text-[#9E3A2E] flex items-center gap-1">
              <X className="w-3 h-3" />
              {err}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

interface FileListProps {
  files: { id: string; name: string; size: number; url: string }[];
  onDownload: (file: { id: string; name: string; url: string }) => void;
  onDelete: (file: { id: string; name: string }) => void;
}

export function FileListItem({ file, onDownload, onDelete }: { file: FileListProps['files'][0]; onDownload: FileListProps['onDownload']; onDelete: FileListProps['onDelete'] }) {
  const sizeStr = file.size < 1024
    ? `${file.size} B`
    : file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(1)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group">
      <div className="w-9 h-9 rounded-lg bg-[#1A1A1A]/5 flex items-center justify-center shrink-0">
        <FileIcon className="w-4 h-4 text-[#1A1A1A]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
        <p className="text-xs text-gray-400">{sizeStr}</p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onDownload(file)}
          className="p-1.5 rounded-md hover:bg-[#1A1A1A]/5 text-gray-400 hover:text-[#1A1A1A] transition-colors"
          title="Descargar"
        >
          <Upload className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(file)}
          className="p-1.5 rounded-md hover:bg-[#7A2A1E]/5 text-gray-400 hover:text-[#9E3A2E] transition-colors"
          title="Eliminar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
