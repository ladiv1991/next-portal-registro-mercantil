'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Plus, X, Trash2, Code, Eye, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

/* ─── key-value pair ─── */

interface KVPair {
  id: string;
  key: string;
  value: string;
}

let _counter = 0;
const uid = () => `kv-${Date.now()}-${++_counter}`;

/* ─── helpers ─── */

/** Try to parse JSON string into flat KV pairs. Returns null if not parseable or not a flat object. */
function jsonToKVs(text: string): KVPair[] | null {
  if (!text || !text.trim()) return [];
  try {
    const obj = JSON.parse(text);
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return null;
    return Object.entries(obj).map(([k, v]) => ({
      id: uid(),
      key: k,
      value: typeof v === 'string' ? v : JSON.stringify(v),
    }));
  } catch {
    return null;
  }
}

function kvsToJson(kvs: KVPair[]): string {
  const obj: Record<string, string | number | boolean | null> = {};
  for (const kv of kvs) {
    if (!kv.key.trim()) continue;
    // Try to infer type
    const v = kv.value.trim();
    if (v === 'null') obj[kv.key] = null;
    else if (v === 'true') obj[kv.key] = true;
    else if (v === 'false') obj[kv.key] = false;
    else if (v !== '' && !isNaN(Number(v))) obj[kv.key] = Number(v);
    else obj[kv.key] = v;
  }
  return JSON.stringify(obj, null, 2);
}

/** Validate JSON string, return error message or null */
function validateJson(text: string): string | null {
  if (!text.trim()) return null;
  try {
    JSON.parse(text);
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : 'JSON inválido';
  }
}

/* ─── main component ─── */

interface JsonFieldEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  rows?: number;
}

export default function JsonFieldEditor({ value, onChange, className, rows = 6 }: JsonFieldEditorProps) {
  const [mode, setMode] = useState<'visual' | 'raw'>('visual');
  const [rawValue, setRawValue] = useState(value);
  const [kvs, setKvs] = useState<KVPair[]>(() => jsonToKVs(value) || []);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [parseWarning, setParseWarning] = useState<string | null>(null);

  // Sync when external value changes
  useEffect(() => {
    setRawValue(value);
    const parsed = jsonToKVs(value);
    if (parsed !== null) {
      setKvs(parsed);
      setParseWarning(null);
    } else {
      // Can't parse as flat object — switch to raw mode
      setParseWarning('El contenido no es un objeto JSON plano. Se muestra en modo texto.');
      setMode('raw');
    }
  }, [value]);

  // Validate raw JSON in real-time
  useEffect(() => {
    setJsonError(validateJson(rawValue));
  }, [rawValue]);

  const applyRawToJson = useCallback(() => {
    const parsed = jsonToKVs(rawValue);
    if (parsed !== null) {
      setKvs(parsed);
      setMode('visual');
      setParseWarning(null);
    } else {
      setParseWarning('No se puede convertir a editor visual. Corrija el JSON primero.');
    }
  }, [rawValue]);

  const switchToRaw = useCallback(() => {
    setRawValue(kvsToJson(kvs));
    setMode('raw');
  }, [kvs]);

  /* ── KV operations ── */

  const addKv = () => setKvs([...kvs, { id: uid(), key: '', value: '' }]);

  const removeKv = (id: string) => setKvs(kvs.filter((k) => k.id !== id));

  const updateKv = (id: string, field: keyof KVPair, val: string) =>
    setKvs(kvs.map((k) => (k.id === id ? { ...k, [field]: val } : k)));

  const handleKvChange = useCallback(
    (_kvs: KVPair[]) => {
      setKvs(_kvs);
      onChange(kvsToJson(_kvs));
    },
    [onChange]
  );

  /* ── render ── */

  const hasContent = value.trim().length > 0;
  const isValid = !jsonError && (!hasContent || rawValue.trim() === '' || mode === 'visual');

  return (
    <div className={cn('space-y-2', className)}>
      {/* header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Contenido del Bloque</span>
        <div className="flex items-center gap-1">
          {mode === 'visual' && kvs.length > 0 && (
            <Button type="button" size="sm" variant="ghost" onClick={switchToRaw} className="text-gray-400 hover:text-[#1A1A1A]">
              <Code className="w-3.5 h-3.5 mr-1" />
              Ver JSON
            </Button>
          )}
          {mode === 'raw' && (
            <Button type="button" size="sm" variant="ghost" onClick={applyRawToJson} className="text-gray-400 hover:text-[#1A1A1A]">
              <Eye className="w-3.5 h-3.5 mr-1" />
              Editor visual
            </Button>
          )}
        </div>
      </div>

      {/* parse warning */}
      {parseWarning && (
        <p className="text-xs text-amber-600 flex items-center gap-1 bg-amber-50 rounded-md px-3 py-2">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {parseWarning}
        </p>
      )}

      {/* visual mode */}
      {mode === 'visual' && (
        <div className="space-y-2">
          {kvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 p-6 text-center">
              <p className="text-sm text-gray-400">Sin campos definidos</p>
              <Button type="button" variant="ghost" size="sm" onClick={addKv} className="text-[#1A1A1A] mt-1">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Agregar campo
              </Button>
            </div>
          ) : (
            kvs.map((kv) => (
              <div
                key={kv.id}
                className="flex items-start gap-2 p-2 rounded-lg border border-gray-100 bg-gray-50/50 group hover:bg-gray-50 transition-colors"
              >
                <Input
                  value={kv.key}
                  onChange={(e) => updateKv(kv.id, 'key', e.target.value)}
                  placeholder="clave"
                  className="h-9 text-sm font-mono bg-white"
                />
                <span className="text-gray-300 mt-2 shrink-0">:</span>
                <Input
                  value={kv.value}
                  onChange={(e) => updateKv(kv.id, 'value', e.target.value)}
                  placeholder="valor"
                  className="h-9 text-sm bg-white flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeKv(kv.id)}
                  className="mt-1.5 p-1 rounded text-gray-300 hover:text-[#9E3A2E] hover:bg-[#7A2A1E]/5 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                  title="Eliminar campo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
          <Button type="button" size="sm" variant="outline" onClick={addKv}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Agregar campo
          </Button>
        </div>
      )}

      {/* raw mode */}
      {mode === 'raw' && (
        <div className="space-y-1">
          <Textarea
            value={rawValue}
            onChange={(e) => {
              setRawValue(e.target.value);
              onChange(e.target.value);
            }}
            placeholder='{"clave": "valor"}'
            rows={rows}
            className={cn(
              'font-mono text-xs resize-none',
              jsonError && 'border-[#7A2A1E] focus-visible:ring-cuban-red/30',
              !jsonError && rawValue.trim() && 'border-green-300 focus-visible:ring-green-500/30'
            )}
          />
          {jsonError && (
            <p className="text-xs text-[#9E3A2E] flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {jsonError}
            </p>
          )}
          {!jsonError && rawValue.trim() && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              JSON válido
            </p>
          )}
        </div>
      )}

      {/* footer actions */}
      {kvs.length > 0 && mode === 'visual' && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => handleKvChange([])}
          className="text-gray-400 hover:text-[#9E3A2E] text-xs"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Limpiar todo
        </Button>
      )}
    </div>
  );
}
