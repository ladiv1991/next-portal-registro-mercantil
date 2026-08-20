'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

/* ─── step data shape ─── */

interface StepData {
  id: string;
  step: number;
  title: string;
  description: string;
}

/* ─── single sortable step card ─── */

interface SortableStepItemProps {
  id: string;
  data: StepData;
  index: number;
  onChange: (id: string, field: keyof StepData, value: string) => void;
  onRemove: (id: string) => void;
}

function SortableStepCard({ id, data, index, onChange, onRemove }: SortableStepItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-white group transition-shadow',
        isDragging && 'shadow-lg border-[#1A1A1A]/30 z-50'
      )}
    >
      {/* drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 shrink-0"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* step number badge */}
      <div className="w-8 h-8 rounded-full bg-[#1A1A1A]/10 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-[#1A1A1A]">{index + 1}</span>
      </div>

      {/* fields */}
      <div className="flex-1 space-y-2 min-w-0">
        <Input
          value={data.title}
          onChange={(e) => onChange(id, 'title', e.target.value)}
          placeholder="Título del paso…"
          className="text-sm font-medium h-9"
        />
        <Textarea
          value={data.description}
          onChange={(e) => onChange(id, 'description', e.target.value)}
          placeholder="Descripción del paso…"
          rows={2}
          className="resize-none text-sm"
        />
      </div>

      {/* remove */}
      <button
        type="button"
        onClick={() => onRemove(id)}
        className="mt-1 p-1 rounded-md text-gray-300 hover:text-[#9E3A2E] hover:bg-[#7A2A1E]/5 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
        title="Eliminar paso"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ─── main component ─── */

interface SortableStepsProps {
  /** JSON string: [{step, title, description}] or plain text (fallback) */
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/** Unique ID generator */
let _counter = 0;
const uid = () => `step-${Date.now()}-${++_counter}`;

/**
 * Parse stored value into StepData[].
 * Handles both JSON format `[{step, title, description}]` and plain text fallback.
 */
function parseSteps(text: string): StepData[] {
  if (!text || !text.trim()) return [];

  // Try JSON format
  try {
    const arr = JSON.parse(text);
    if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'object') {
      return arr.map((item: Record<string, unknown>, i: number) => ({
        id: uid(),
        step: typeof item.step === 'number' ? item.step : i + 1,
        title: String(item.title || ''),
        description: String(item.description || ''),
      }));
    }
  } catch {
    // Not JSON — treat as plain text, one step per line
  }

  // Plain text fallback: each non-empty line becomes a step
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line, i) => ({
      id: uid(),
      step: i + 1,
      title: line,
      description: '',
    }));
}

/** Serialize StepData[] back to JSON string */
function serializeSteps(steps: StepData[]): string {
  const json = steps
    .filter((s) => s.title.trim() || s.description.trim())
    .map((s, i) => ({
      step: i + 1,
      title: s.title.trim(),
      description: s.description.trim(),
    }));
  return JSON.stringify(json);
}

export default function SortableSteps({ value, onChange, className }: SortableStepsProps) {
  const [steps, setSteps] = useState<StepData[]>(() => parseSteps(value));

  // Sync when external value changes (e.g. opening edit modal)
  useEffect(() => {
    setSteps(parseSteps(value));
  }, [value]);

  const persist = useCallback(
    (next: StepData[]) => {
      setSteps(next);
      onChange(serializeSteps(next));
    },
    [onChange]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIdx = steps.findIndex((s) => s.id === active.id);
      const newIdx = steps.findIndex((s) => s.id === over.id);
      persist(arrayMove(steps, oldIdx, newIdx));
    },
    [steps, persist]
  );

  const handleChange = useCallback(
    (id: string, field: keyof StepData, val: string) => {
      persist(steps.map((s) => (s.id === id ? { ...s, [field]: val } : s)));
    },
    [steps, persist]
  );

  const handleRemove = useCallback(
    (id: string) => {
      persist(steps.filter((s) => s.id !== id));
    },
    [steps, persist]
  );

  const handleAdd = () => {
    persist([
      ...steps,
      { id: uid(), step: steps.length + 1, title: '', description: '' },
    ]);
  };

  const handleClearAll = () => {
    persist([]);
  };

  if (steps.length === 0) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Pasos del Trámite</span>
          <Button type="button" size="sm" variant="outline" onClick={handleAdd}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Agregar paso
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-400">No hay pasos definidos</p>
          <Button type="button" variant="ghost" size="sm" onClick={handleAdd} className="text-[#1A1A1A] mt-1">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Agregar primer paso
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Pasos del Trámite ({steps.length})
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleClearAll}
            className="text-gray-400 hover:text-[#9E3A2E]"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={handleAdd}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Agregar paso
          </Button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {steps.map((step, i) => (
              <SortableStepCard
                key={step.id}
                id={step.id}
                data={step}
                index={i}
                onChange={handleChange}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
