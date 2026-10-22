'use client';

import React, { useState, useCallback, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  THEME_PRESETS,
  getPresetById,
  type ThemePreset,
} from '@/lib/themes';

// ─── Theme Context ───
interface ThemeContextValue {
  theme: ThemePreset;
  setTheme: (id: string) => void;
}

const ThemeCtx = React.createContext<ThemeContextValue>({
  theme: THEME_PRESETS[0],
  setTheme: () => {},
});

export function useTheme() {
  return React.useContext(ThemeCtx);
}

export { ThemeCtx as ThemeContext };

// ─── localStorage sync with useSyncExternalStore ───
const THEME_STORAGE_KEY = 'rmc-theme';

function subscribeToStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getStorageSnapshot() {
  return localStorage.getItem(THEME_STORAGE_KEY) || 'terracota';
}

function getServerSnapshot() {
  return 'terracota';
}

function storeThemeId(id: string) {
  localStorage.setItem(THEME_STORAGE_KEY, id);
  window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY }));
}

// ─── CSS Variable Applier ───
function applyThemeCSS(colors: ThemePreset['colors']) {
  const root = document.documentElement;
  const s = root.style;
  s.setProperty('--c-navy', colors.navy);
  s.setProperty('--c-navy-light', colors.navyLight);
  s.setProperty('--c-accent', colors.accent);
  s.setProperty('--c-accent-light', colors.accentLight);
  s.setProperty('--c-accent-dark', colors.accentDark);
  s.setProperty('--c-warm', colors.warm);
  s.setProperty('--c-warm-light', colors.warmLight);
  s.setProperty('--c-warm-dark', colors.warmDark);
}

// ─── Provider Component ───
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const storedThemeId = useSyncExternalStore(subscribeToStorage, getStorageSnapshot, getServerSnapshot);
  const [mounted, setMounted] = useState(false);

  // Apply CSS on mount and when theme changes
  const applyRef = React.useRef(false);
  React.useEffect(() => {
    if (!mounted) {
      setMounted(true);
      applyRef.current = true;
    }
    applyThemeCSS(getPresetById(storedThemeId).colors);
  }, [storedThemeId, mounted]);

  const setTheme = useCallback((id: string) => {
    storeThemeId(id);
  }, []);

  const theme = getPresetById(storedThemeId);

  return (
    <ThemeCtx.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}

// ─── Theme Switcher Button (Floating) ───
export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <>
      {/* Floating trigger button */}
      <motion.div
        className="fixed bottom-[5.5rem] right-6 z-[9999]"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 1 }}
      >
        <Button
          onClick={() => setOpen(!open)}
          className="w-12 h-12 rounded-full shadow-xl border-2 border-white/20 backdrop-blur-md flex items-center justify-center gap-1 transition-all duration-300 hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.navy} 0%, ${theme.colors.navyLight} 100%)`,
          }}
          aria-label="Cambiar tema de colores"
        >
          <Palette className="w-5 h-5 text-white" />
        </Button>
      </motion.div>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed bottom-[9rem] right-6 z-[9999] w-80 rounded-2xl shadow-2xl border overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAFA 100%)',
                borderColor: theme.colors.accent + '30',
              }}
            >
              {/* Header */}
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ borderBottom: `2px solid ${theme.colors.accent}20` }}
              >
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5" style={{ color: theme.colors.accent }} />
                  <span className="font-semibold text-sm" style={{ color: theme.colors.navy }}>
                    Tema del Portal
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  ✕
                </Button>
              </div>

              {/* Presets list */}
              <div className="p-3 space-y-2 max-h-[340px] overflow-y-auto">
                {THEME_PRESETS.map((preset) => {
                  const isActive = preset.id === theme.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setTheme(preset.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left group ${
                        isActive
                          ? 'ring-2 shadow-md'
                          : 'hover:bg-gray-50'
                      }`}
                      style={isActive
                        ? { ringColor: preset.colors.accent, background: preset.colors.accent + '08' }
                        : {}
                      }
                    >
                      {/* Color swatches */}
                      <div className="flex gap-1.5 shrink-0">
                        <span
                          className="w-6 h-6 rounded-full border border-white/50 shadow-sm"
                          style={{ backgroundColor: preset.colors.navy }}
                        />
                        <span
                          className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
                          style={{ backgroundColor: preset.colors.accent }}
                        />
                        <span
                          className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
                          style={{ backgroundColor: preset.colors.warm }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{preset.emoji}</span>
                          <span className="text-sm font-medium truncate" style={{ color: preset.colors.navy }}>
                            {preset.name}
                          </span>
                        </div>
                        <p className="text-xs truncate" style={{ color: 'var(--rm-muted)' }}>
                          {preset.description}
                        </p>
                      </div>

                      {/* Active check */}
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: preset.colors.accent }}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer hint */}
              <div
                className="px-5 py-3 text-center"
                style={{
                  borderTop: `1px solid ${theme.colors.accent}15`,
                  background: theme.colors.navy + '04',
                }}
              >
                <p className="text-xs" style={{ color: 'var(--rm-muted)' }}>
                  <Palette className="w-3 h-3 inline mr-1" />
                  La selección se guarda automáticamente en su navegador
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
