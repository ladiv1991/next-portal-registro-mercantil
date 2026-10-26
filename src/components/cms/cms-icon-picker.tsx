'use client';

import { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Input } from '@/components/ui/input';

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

// shortcut: only lucide-react icons, no custom SVG upload. Upgrade when custom icons are needed.
const iconEntries = Object.entries(LucideIcons).filter(
  ([name, mod]) =>
    typeof mod === 'function' &&
    /^[A-Z]/.test(name) &&
    name !== 'createLucideIcon' &&
    name !== 'icons'
);

export default function IconPicker({ value, onChange }: IconPickerProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return iconEntries;
    const lower = search.toLowerCase();
    return iconEntries.filter(([name]) => name.toLowerCase().includes(lower));
  }, [search]);

  const SelectedIcon = value
    ? (LucideIcons[value as keyof typeof LucideIcons] as React.ElementType)
    : null;

  return (
    <div className="space-y-3">
      {/* Selected preview */}
      {value && SelectedIcon && (
        <div className="glass-card flex items-center gap-2 p-3 rounded-lg" style={{ color: 'var(--rm-text)' }}>
          <SelectedIcon size={20} style={{ color: 'var(--rm-primary)' }} />
          <span className="text-sm font-medium">{value}</span>
        </div>
      )}

      {/* Search */}
      <Input
        placeholder="Buscar ícono..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full"
      />

      {/* Grid */}
      <div
        className="grid grid-cols-6 gap-2 overflow-y-auto p-2 rounded-lg border"
        style={{ maxHeight: '240px', borderColor: 'var(--rm-border, #e5e7eb)' }}
      >
        {filtered.map(([name, Icon]) => {
          const Comp = Icon as React.ElementType;
          const isSelected = name === value;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name)}
              title={name}
              className={`flex flex-col items-center justify-center gap-1 p-2 rounded-md text-xs transition-colors cursor-pointer ${
                isSelected
                  ? 'ring-2'
                  : 'hover:bg-gray-100'
              }`}
              style={
                isSelected
                  ? { '--tw-ring-color': 'var(--rm-primary)', backgroundColor: 'color-mix(in srgb, var(--rm-primary) 10%, transparent)' } as React.CSSProperties
                  : undefined
              }
            >
              <Comp
                size={18}
                style={{ color: isSelected ? 'var(--rm-primary)' : 'var(--rm-text, #6B7280)' }}
              />
              <span className="truncate w-full text-center leading-tight" style={{ fontSize: '10px' }}>
                {name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
